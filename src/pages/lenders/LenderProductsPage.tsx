import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import ActionGate from "@/components/auth/ActionGate";
import RequireRole from "@/components/auth/RequireRole";
import AppLoading from "@/components/layout/AppLoading";
import LenderProductModal, { type ProductFormValues } from "@/components/LenderProductModal";
import { getErrorMessage } from "@/utils/errors";
import { useAuthorization } from "@/hooks/useAuthorization";
import {
  createLenderProduct,
  fetchLenderProducts,
  fetchLenders,
  updateLenderProduct,
  type Lender,
  type LenderProduct,
  type LenderProductPayload
} from "@/api/lenders";
import {
  LENDER_PRODUCT_CATEGORIES,
  LENDER_PRODUCT_CATEGORY_LABELS,
  type LenderProductCategory,
  type RateType
} from "@/types/lenderManagement.types";
import {
  PRODUCT_DOCUMENT_OPTIONS,
  buildRequiredDocumentsPayload,
  deriveCurrency,
  deriveProductName,
  getDefaultRequiredDocuments,
  getRateDefaults,
  mapRequiredDocumentsToValues,
  resolveRateType
} from "./lenderProductForm";

const CATEGORY_DISPLAY_ORDER: LenderProductCategory[] = [
  "LINE_OF_CREDIT",
  "TERM_LOAN",
  "FACTORING",
  "EQUIPMENT_FINANCE",
  "PURCHASE_ORDER_FINANCE"
];

const RATE_TYPE_OPTIONS: RateType[] = ["fixed", "variable"];

const emptyProductForm = (lenderId: string): ProductFormValues => ({
  lenderId,
  active: true,
  category: LENDER_PRODUCT_CATEGORIES[0],
  country: "",
  minAmount: "",
  maxAmount: "",
  rateType: "fixed",
  fixedRate: "",
  primeRate: "",
  rateSpread: "",
  termMonths: "",
  requiredDocuments: getDefaultRequiredDocuments()
});

const toFormString = (value?: number | string | null) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const formatRateType = (value: RateType) => value.charAt(0).toUpperCase() + value.slice(1);

const LenderProductsContent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const [activeLenderId, setActiveLenderId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<LenderProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<ProductFormValues>(emptyProductForm(""));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const canManageProducts = useAuthorization({ roles: ["Admin", "Staff"] });
  const isNewRoute = location.pathname.endsWith("/new");

  const { data: lenders = [], isLoading: lendersLoading, error: lendersError, refetch: refetchLenders } = useQuery<
    Lender[],
    Error
  >({
    queryKey: ["lenders"],
    queryFn: ({ signal }) => fetchLenders({ signal }),
    staleTime: 30_000,
    refetchOnWindowFocus: false
  });
  const safeLenders = Array.isArray(lenders) ? lenders : [];
  const activeLenders = safeLenders.filter((lender) => lender.active);

  useEffect(() => {
    if (activeLenderId) return;
    const requestedLenderId = searchParams.get("lenderId");
    if (requestedLenderId && activeLenders.some((lender) => lender.id === requestedLenderId)) {
      setActiveLenderId(requestedLenderId);
      return;
    }
    const firstActive = activeLenders.find((lender) => Boolean(lender?.id));
    if (firstActive?.id) {
      setActiveLenderId(firstActive.id);
    }
  }, [activeLenderId, activeLenders, searchParams]);

  useEffect(() => {
    if (!activeLenderId) return;
    if (activeLenders.some((lender) => lender.id === activeLenderId)) return;
    setActiveLenderId(activeLenders[0]?.id ?? "");
  }, [activeLenderId, activeLenders]);

  const activeLender = useMemo(
    () => activeLenders.find((lender) => lender.id === activeLenderId) ?? null,
    [activeLenderId, activeLenders]
  );

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery<LenderProduct[], Error>({
    queryKey: ["lender-products", activeLenderId || "all"],
    queryFn: ({ signal }) => fetchLenderProducts(activeLenderId || undefined, { signal }),
    placeholderData: (previousData) => previousData ?? [],
    staleTime: 30_000,
    refetchOnWindowFocus: false
  });
  const safeProducts = Array.isArray(products) ? products : [];

  const visibleProducts = useMemo(() => {
    const activeIds = new Set(activeLenders.map((lender) => lender.id));
    return safeProducts.filter(
      (product) => activeIds.has(product.lenderId) && (!activeLenderId || product.lenderId === activeLenderId)
    );
  }, [activeLenderId, activeLenders, safeProducts]);

  const selectedProduct = useMemo(
    () => visibleProducts.find((product) => product.id === selectedProductId) ?? null,
    [visibleProducts, selectedProductId]
  );

  useEffect(() => {
    if (isNewRoute) {
      setSelectedProductId(null);
      setEditingProduct(null);
      setFormValues(emptyProductForm(activeLenderId));
      setFormErrors({});
      setIsModalOpen(activeLenders.length > 0);
      return;
    }
    if (productId) {
      setSelectedProductId(productId);
      setIsModalOpen(true);
      return;
    }
    setSelectedProductId(null);
    setEditingProduct(null);
    setIsModalOpen(false);
  }, [activeLenderId, activeLenders.length, isNewRoute, productId]);

  useEffect(() => {
    if (!selectedProduct) {
      if (!isModalOpen && !isNewRoute) {
        setFormValues(emptyProductForm(activeLenderId));
        setFormErrors({});
      }
      return;
    }
    const resolvedCategory = selectedProduct.category ?? LENDER_PRODUCT_CATEGORIES[0];
    const rateDefaults = getRateDefaults(selectedProduct);
    const termMonths = selectedProduct.termLength?.min ?? selectedProduct.termLength?.max ?? 0;
    setEditingProduct(selectedProduct);
    setFormValues({
      lenderId: selectedProduct.lenderId,
      active: resolvedCategory === "STARTUP_CAPITAL" ? false : selectedProduct.active,
      category: resolvedCategory,
      country: selectedProduct.country ?? "",
      minAmount: toFormString(selectedProduct.minAmount),
      maxAmount: toFormString(selectedProduct.maxAmount),
      rateType: rateDefaults.rateType,
      fixedRate: rateDefaults.fixedRate,
      primeRate: rateDefaults.primeRate,
      rateSpread: rateDefaults.rateSpread,
      termMonths: termMonths ? String(termMonths) : "",
      requiredDocuments: mapRequiredDocumentsToValues(selectedProduct.requiredDocuments)
    });
    setFormErrors({});
  }, [activeLenderId, isModalOpen, isNewRoute, selectedProduct]);

  const createMutation = useMutation({
    mutationFn: (payload: LenderProductPayload) => createLenderProduct(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["lender-products"] });
      const previous = queryClient.getQueryData<LenderProduct[]>(["lender-products", activeLenderId || "all"]);
      queryClient.setQueryData<LenderProduct[]>(["lender-products", activeLenderId || "all"], (current = []) => [
        {
          ...payload,
          id: `temp-${Date.now()}`,
          requiredDocuments: payload.required_documents ?? []
        } as LenderProduct,
        ...current
      ]);
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lender-products", activeLenderId || "all"], context.previous);
      }
    },
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["lender-products"] });
      if (created?.id && created?.lenderId) {
        setSelectedProductId(created.id);
        navigate(`/lender-products/${created.id}/edit?lenderId=${created.lenderId}`);
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: Partial<LenderProductPayload> }) =>
      updateLenderProduct(productId, payload),
    onMutate: async ({ productId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["lender-products"] });
      const previous = queryClient.getQueryData<LenderProduct[]>(["lender-products", activeLenderId || "all"]);
      queryClient.setQueryData<LenderProduct[]>(["lender-products", activeLenderId || "all"], (current = []) =>
        current.map((product) => (product.id === productId ? { ...product, ...payload } : product))
      );
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lender-products", activeLenderId || "all"], context.previous);
      }
    },
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ["lender-products"] });
      if (updated?.id && updated?.lenderId) {
        navigate(`/lender-products/${updated.id}/edit?lenderId=${updated.lenderId}`);
      }
    }
  });

  const mutationError = createMutation.error ?? updateMutation.error;
  const mutationLoading = createMutation.isPending || updateMutation.isPending;
  const isFormDisabled = !activeLender || !canManageProducts;

  const validateForm = (values: ProductFormValues) => {
    const errors: Record<string, string> = {};
    if (!values.lenderId) errors.lenderId = "Lender is required.";
    if (!values.category) errors.category = "Product category is required.";
    if (!values.country.trim()) errors.country = "Country is required.";
    if (!values.minAmount) errors.minAmount = "Minimum amount is required.";
    if (!values.maxAmount) errors.maxAmount = "Maximum amount is required.";
    const minAmount = Number(values.minAmount);
    const maxAmount = Number(values.maxAmount);
    if (Number.isNaN(minAmount)) errors.minAmount = "Minimum amount must be a number.";
    if (Number.isNaN(maxAmount)) errors.maxAmount = "Maximum amount must be a number.";
    if (!Number.isNaN(minAmount) && !Number.isNaN(maxAmount) && minAmount > maxAmount) {
      errors.maxAmount = "Maximum amount must be greater than minimum.";
    }
    if (!values.rateType) errors.rateType = "Rate type is required.";
    const resolvedRateType = resolveRateType(values.rateType);
    if (resolvedRateType === "variable") {
      if (!values.primeRate.trim()) errors.primeRate = "Prime rate is required.";
      if (!values.rateSpread.trim()) errors.rateSpread = "Spread is required.";
      const primeRate = Number(values.primeRate);
      const spread = Number(values.rateSpread);
      if (Number.isNaN(primeRate)) errors.primeRate = "Prime rate must be a number.";
      if (Number.isNaN(spread)) errors.rateSpread = "Spread must be a number.";
      if (!Number.isNaN(primeRate) && primeRate < 0) {
        errors.primeRate = "Prime rate must be positive.";
      }
      if (!Number.isNaN(spread) && spread < 0) {
        errors.rateSpread = "Spread must be positive.";
      }
    } else {
      if (!values.fixedRate.trim()) errors.fixedRate = "Fixed rate is required.";
      const fixedRate = Number(values.fixedRate);
      if (Number.isNaN(fixedRate)) errors.fixedRate = "Fixed rate must be a number.";
      if (!Number.isNaN(fixedRate) && fixedRate < 0) {
        errors.fixedRate = "Fixed rate must be positive.";
      }
    }
    if (!values.termMonths.trim()) errors.termMonths = "Term is required.";
    const termMonths = Number(values.termMonths);
    if (Number.isNaN(termMonths)) errors.termMonths = "Term must be a number.";
    const normalizedCountry = values.country.trim().toUpperCase();
    if (values.category === "SBA_GOVERNMENT" && normalizedCountry !== "US" && normalizedCountry !== "BOTH") {
      errors.category = "SBA products must be limited to US lenders.";
    }
    if (values.category === "STARTUP_CAPITAL" && normalizedCountry !== "CA" && normalizedCountry !== "BOTH") {
      errors.category = "Startup capital is limited to Canada.";
    }
    if (values.category === "STARTUP_CAPITAL" && values.active) {
      errors.active = "Startup capital products must remain inactive.";
    }
    return errors;
  };

  const buildPayload = (values: ProductFormValues, existing?: LenderProduct | null): LenderProductPayload => {
    const normalizedCountry = values.country.trim();
    const resolvedRateType = resolveRateType(values.rateType);
    const primeRate = Number(values.primeRate);
    const spread = Number(values.rateSpread);
    const fixedRate = Number(values.fixedRate);
    const interestRateMin =
      resolvedRateType === "variable"
        ? Number.isNaN(primeRate)
          ? 0
          : primeRate
        : Number.isNaN(fixedRate)
          ? 0
          : fixedRate;
    const interestRateMax =
      resolvedRateType === "variable"
        ? Number.isNaN(primeRate) || Number.isNaN(spread)
          ? interestRateMin
          : primeRate + spread
        : interestRateMin;
    const termMonths = Number(values.termMonths);
    return {
      lenderId: values.lenderId,
      productName: existing?.productName ?? deriveProductName(values.category),
      active: values.category === "STARTUP_CAPITAL" ? false : values.active,
      category: values.category,
      country: normalizedCountry,
      currency: deriveCurrency(normalizedCountry, existing?.currency ?? null),
      minAmount: Number(values.minAmount),
      maxAmount: Number(values.maxAmount),
      interestRateMin,
      interestRateMax,
      rateType: resolvedRateType,
      termLength: {
        min: Number.isNaN(termMonths) ? 0 : termMonths,
        max: Number.isNaN(termMonths) ? 0 : termMonths,
        unit: "months"
      },
      minimumCreditScore: existing?.minimumCreditScore ?? null,
      ltv: existing?.ltv ?? null,
      eligibilityRules: existing?.eligibilityRules ?? null,
      eligibilityFlags: existing?.eligibilityFlags ?? {
        minimumRevenue: null,
        timeInBusinessMonths: null,
        industryRestrictions: null
      },
      required_documents: buildRequiredDocumentsPayload(values.requiredDocuments)
    };
  };

  const categoryOptions = useMemo(() => {
    const normalizedCountry = formValues.country.trim().toUpperCase();
    const isUs = normalizedCountry === "US" || normalizedCountry === "BOTH";
    const isCa = normalizedCountry === "CA" || normalizedCountry === "BOTH";
    return LENDER_PRODUCT_CATEGORIES.map((category) => ({
      value: category,
      label: LENDER_PRODUCT_CATEGORY_LABELS[category],
      disabled: (category === "SBA_GOVERNMENT" && !isUs) || (category === "STARTUP_CAPITAL" && !isCa)
    }));
  }, [formValues.country]);

  const groupedProducts = useMemo(() => {
    const ordered = [
      ...CATEGORY_DISPLAY_ORDER,
      ...LENDER_PRODUCT_CATEGORIES.filter((category) => !CATEGORY_DISPLAY_ORDER.includes(category))
    ];
    const map = new Map<LenderProductCategory, LenderProduct[]>();
    ordered.forEach((category) => map.set(category, []));
    visibleProducts.forEach((product) => {
      const category = (product.category ?? LENDER_PRODUCT_CATEGORIES[0]) as LenderProductCategory;
      if (!map.has(category)) {
        map.set(category, []);
      }
      map.get(category)?.push(product);
    });
    return { ordered, map };
  }, [visibleProducts]);

  const openCreateModal = () => {
    if (!activeLender) return;
    setEditingProduct(null);
    setFormValues(emptyProductForm(activeLender.id));
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormErrors({});
    navigate("/lender-products");
  };

  return (
    <div className="page">
      <Card title="Lender Products">
        {lendersLoading && <AppLoading />}
        {lendersError && (
          <div className="space-y-2">
            <ErrorBanner message={getErrorMessage(lendersError, "Unable to load lenders.")} />
            <Button type="button" variant="secondary" onClick={() => void refetchLenders()}>
              Retry
            </Button>
          </div>
        )}
        {!lendersLoading && !lendersError && (
          <div className="space-y-2">
            <label className="ui-field">
              <span className="ui-field__label">Active lender</span>
              <select
                className="ui-input"
                value={activeLenderId}
                onChange={(event) => {
                  setActiveLenderId(event.target.value);
                  setSelectedProductId(null);
                }}
                disabled={!activeLenders.length}
              >
                <option value="">Select lender</option>
                {activeLenders.map((lender) => (
                  <option key={lender.id} value={lender.id}>
                    {lender.name || "Unnamed lender"}
                  </option>
                ))}
              </select>
            </label>
            {!activeLenders.length && <p className="text-sm text-slate-500">No active lenders available.</p>}
          </div>
        )}
        {activeLender && (
          <div className="management-note">
            <span className="status-pill status-pill--active">Lender active</span>
            <span>{activeLender.address?.country || "—"}</span>
          </div>
        )}
      </Card>

      <div className="management-grid">
        <Card
          title="Products"
          actions={
            <ActionGate
              roles={["Admin", "Staff"]}
              fallback={
                <Button type="button" variant="secondary" disabled>
                  Add Product
                </Button>
              }
            >
              <Button
                type="button"
                variant="secondary"
                onClick={openCreateModal}
                disabled={!activeLender || !canManageProducts}
              >
                Add Product
              </Button>
            </ActionGate>
          }
        >
          {productsLoading && <AppLoading />}
          {productsError && (
            <div className="space-y-2">
              <ErrorBanner message={getErrorMessage(productsError, "Unable to load products.")} />
              <Button type="button" variant="secondary" onClick={() => void refetchProducts()}>
                Retry
              </Button>
            </div>
          )}
          {!productsLoading && !productsError && !activeLender && (
            <p className="text-sm text-slate-500">Select an active lender to view products.</p>
          )}
          {!productsLoading && !productsError && activeLender && !visibleProducts.length && (
            <p className="text-sm text-slate-500">No products for this lender.</p>
          )}
          {!productsLoading && !productsError && activeLender && visibleProducts.length > 0 && (
            <div className="space-y-3">
              {groupedProducts.ordered.map((category) => {
                const items = groupedProducts.map.get(category) ?? [];
                if (!items.length) return null;
                return (
                  <details key={category} className="lender-section" open>
                    <summary className="lender-section__header">
                      <span className="lender-section__title">
                        {LENDER_PRODUCT_CATEGORY_LABELS[category]} ({items.length})
                      </span>
                    </summary>
                    <table className="lender-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Country</th>
                          <th>Status</th>
                          <th>Amount range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((product) => {
                          const productActive = product.category === "STARTUP_CAPITAL" ? false : Boolean(product.active);
                          const minAmount = Number.isFinite(product.minAmount) ? product.minAmount : 0;
                          const maxAmount = Number.isFinite(product.maxAmount) ? product.maxAmount : 0;
                          return (
                            <tr
                              key={product.id}
                              className={productActive ? "management-row" : "management-row management-row--disabled"}
                            >
                              <td>
                                <button
                                  type="button"
                                  className="management-link"
                                  onClick={() =>
                                    navigate(
                                      `/lender-products/${product.id}/edit?lenderId=${product.lenderId ?? ""}`
                                    )
                                  }
                                >
                                  {product.productName || "Untitled product"}
                                </button>
                              </td>
                              <td>{product.country || "—"}</td>
                              <td>
                                <span className={`status-pill status-pill--${productActive ? "active" : "paused"}`}>
                                  {productActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td>
                                ${minAmount.toLocaleString()} - ${maxAmount.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </details>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {isModalOpen && (
        <LenderProductModal
          isOpen={isModalOpen}
          title={editingProduct ? "Edit product" : "Create product"}
          isSaving={mutationLoading}
          isSubmitDisabled={isFormDisabled}
          errorMessage={mutationError ? getErrorMessage(mutationError, "Unable to save product.") : null}
          isSelectedLenderInactive={false}
          lenderOptions={activeLenders.map((lender) => ({ value: lender.id, label: lender.name || "Unnamed lender" }))}
          formValues={formValues}
          formErrors={formErrors}
          categoryOptions={categoryOptions}
          rateTypes={RATE_TYPE_OPTIONS}
          documentOptions={PRODUCT_DOCUMENT_OPTIONS}
          formatRateType={formatRateType}
          onChange={(updates) => {
            setFormValues((prev) => ({ ...prev, ...updates }));
            if (updates.lenderId) {
              setActiveLenderId(updates.lenderId);
            }
          }}
          onSubmit={() => {
            if (isFormDisabled) return;
            const errors = validateForm(formValues);
            setFormErrors(errors);
            if (Object.keys(errors).length) return;
            const payload = buildPayload(formValues, editingProduct);
            if (editingProduct) {
              if (!editingProduct.id) {
                setFormErrors({ category: "Missing product id. Please refresh and try again." });
                return;
              }
              updateMutation.mutate({ productId: editingProduct.id, payload });
              return;
            }
            createMutation.mutate(payload);
          }}
          onClose={closeModal}
          onCancel={closeModal}
        />
      )}
    </div>
  );
};

const LenderProductsPage = () => (
  <RequireRole roles={["Admin", "Staff"]}>
    <LenderProductsContent />
  </RequireRole>
);

export default LenderProductsPage;
