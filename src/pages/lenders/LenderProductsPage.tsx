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
import { ApiError } from "@/lib/api";
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
  formatInterestPayload,
  getDefaultRequiredDocuments,
  getRateDefaults,
  isValidVariableRate,
  mapRequiredDocumentsToValues,
  normalizeProductCountry,
  normalizeInterestInput,
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
  productName: deriveProductName(LENDER_PRODUCT_CATEGORIES[0]),
  category: LENDER_PRODUCT_CATEGORIES[0],
  country: "",
  minAmount: "",
  maxAmount: "",
  minTerm: "",
  maxTerm: "",
  rateType: "fixed",
  interestMin: "",
  interestMax: "",
  fees: "",
  requiredDocuments: getDefaultRequiredDocuments()
});

const toFormString = (value?: number | string | null) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const formatRateType = (value: RateType) => value.charAt(0).toUpperCase() + value.slice(1);

const formatLenderCountryLabel = (value?: string | null) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return "";
  const normalized = trimmed.toUpperCase();
  if (normalized === "CA" || normalized === "CANADA") return "Canada";
  if (normalized === "US" || normalized === "USA" || normalized === "UNITED STATES") return "United States";
  if (normalized === "BOTH") return "Both";
  return trimmed;
};

const getApiErrorStatus = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.status;
  }
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }
  return undefined;
};

const getApiErrorDetails = (error: unknown) => {
  if (error instanceof ApiError) return error.details;
  if (error && typeof error === "object" && "details" in error) {
    return (error as { details?: unknown }).details;
  }
  return undefined;
};

const extractValidationErrors = (error: unknown, fieldMap: Record<string, string>) => {
  const status = getApiErrorStatus(error);
  if (status !== 400 && status !== 422) return null;
  const details = getApiErrorDetails(error);
  if (!details || typeof details !== "object") return {};
  const rawErrors =
    (details as { errors?: Record<string, unknown> }).errors ??
    (details as { fieldErrors?: Record<string, unknown> }).fieldErrors ??
    (details as { fields?: Record<string, unknown> }).fields ??
    details;
  if (!rawErrors || typeof rawErrors !== "object") return {};
  const nextErrors: Record<string, string> = {};
  Object.entries(rawErrors as Record<string, unknown>).forEach(([key, value]) => {
    const mappedKey = fieldMap[key] ?? fieldMap[key.toLowerCase()] ?? key;
    const message = Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string" && item.trim()).join(", ")
      : typeof value === "string"
        ? value
        : typeof value === "object" && value && "message" in value
          ? String((value as { message?: unknown }).message ?? "")
          : "";
    if (mappedKey && message) {
      nextErrors[mappedKey] = message;
    }
  });
  return nextErrors;
};

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
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    setEditingProduct(selectedProduct);
    setFormValues({
      lenderId: selectedProduct.lenderId,
      active: selectedProduct.active,
      productName: selectedProduct.productName ?? "",
      category: resolvedCategory,
      country: normalizeProductCountry(selectedProduct.country),
      minAmount: toFormString(selectedProduct.minAmount),
      maxAmount: toFormString(selectedProduct.maxAmount),
      rateType: rateDefaults.rateType,
      interestMin: rateDefaults.interestMin,
      interestMax: rateDefaults.interestMax,
      minTerm: toFormString(selectedProduct.termLength?.min),
      maxTerm: toFormString(selectedProduct.termLength?.max),
      fees: selectedProduct.fees ?? "",
      requiredDocuments: mapRequiredDocumentsToValues(selectedProduct.requiredDocuments)
    });
    setFormErrors({});
  }, [activeLenderId, isModalOpen, isNewRoute, selectedProduct]);

  const productFieldMap = useMemo(
    () => ({
      lender_id: "lenderId",
      lenderId: "lenderId",
      name: "productName",
      product_name: "productName",
      category: "category",
      product_category: "category",
      country: "country",
      min_amount: "minAmount",
      max_amount: "maxAmount",
      interest_type: "rateType",
      interest_min: "interestMin",
      interest_max: "interestMax",
      term_min_months: "minTerm",
      term_max_months: "maxTerm"
    }),
    []
  );

  const createMutation = useMutation({
    mutationFn: (payload: LenderProductPayload) => createLenderProduct(payload),
    onMutate: async (payload) => {
      setSubmitError(null);
      setFormErrors({});
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
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lender-products", activeLenderId || "all"], context.previous);
      }
      const validationErrors = extractValidationErrors(error, productFieldMap);
      if (validationErrors && Object.keys(validationErrors).length) {
        setFormErrors(validationErrors);
        return;
      }
      setSubmitError(getErrorMessage(error, "Unable to save product. Please retry."));
    },
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["lender-products"] });
      if (created?.id && created?.lenderId) {
        setSelectedProductId(created.id);
        navigate(`/lender-products/${created.id}/edit?lenderId=${created.lenderId}`);
      }
      setSubmitError(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: Partial<LenderProductPayload> }) =>
      updateLenderProduct(productId, payload),
    onMutate: async ({ productId, payload }) => {
      setSubmitError(null);
      setFormErrors({});
      await queryClient.cancelQueries({ queryKey: ["lender-products"] });
      const previous = queryClient.getQueryData<LenderProduct[]>(["lender-products", activeLenderId || "all"]);
      queryClient.setQueryData<LenderProduct[]>(["lender-products", activeLenderId || "all"], (current = []) =>
        current.map((product) => (product.id === productId ? { ...product, ...payload } : product))
      );
      return { previous };
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lender-products", activeLenderId || "all"], context.previous);
      }
      const validationErrors = extractValidationErrors(error, productFieldMap);
      if (validationErrors && Object.keys(validationErrors).length) {
        setFormErrors(validationErrors);
        return;
      }
      setSubmitError(getErrorMessage(error, "Unable to save product. Please retry."));
    },
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ["lender-products"] });
      if (updated?.id && updated?.lenderId) {
        navigate(`/lender-products/${updated.id}/edit?lenderId=${updated.lenderId}`);
      }
      setSubmitError(null);
    }
  });

  const mutationLoading = createMutation.isPending || updateMutation.isPending;
  const isFormDisabled = !activeLender || !canManageProducts;

  const validateForm = (values: ProductFormValues) => {
    const errors: Record<string, string> = {};
    if (!values.lenderId) errors.lenderId = "Lender is required.";
    const isActiveLender = activeLenders.some((lender) => lender.id === values.lenderId);
    if (values.lenderId && !isActiveLender) {
      errors.lenderId = "Lender must be active.";
    }
    if (!values.productName.trim()) errors.productName = "Product name is required.";
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
    if (!values.minTerm) errors.minTerm = "Minimum term is required.";
    if (!values.maxTerm) errors.maxTerm = "Maximum term is required.";
    const minTerm = Number(values.minTerm);
    const maxTerm = Number(values.maxTerm);
    if (Number.isNaN(minTerm)) errors.minTerm = "Minimum term must be a number.";
    if (Number.isNaN(maxTerm)) errors.maxTerm = "Maximum term must be a number.";
    if (!Number.isNaN(minTerm) && !Number.isNaN(maxTerm) && minTerm > maxTerm) {
      errors.maxTerm = "Maximum term must be greater than minimum.";
    }
    if (!values.rateType) errors.rateType = "Rate type is required.";
    if (!values.interestMin) errors.interestMin = "Interest minimum is required.";
    if (!values.interestMax) errors.interestMax = "Interest maximum is required.";
    if (values.rateType === "variable") {
      if (values.interestMin && !isValidVariableRate(values.interestMin)) {
        errors.interestMin = "Use format P + X.";
      }
      if (values.interestMax && !isValidVariableRate(values.interestMax)) {
        errors.interestMax = "Use format P + Y.";
      }
    } else {
      const interestMin = Number(values.interestMin);
      const interestMax = Number(values.interestMax);
      if (Number.isNaN(interestMin)) errors.interestMin = "Interest minimum must be a number.";
      if (Number.isNaN(interestMax)) errors.interestMax = "Interest maximum must be a number.";
      if (!Number.isNaN(interestMin) && interestMin < 0) {
        errors.interestMin = "Interest minimum must be positive.";
      }
      if (!Number.isNaN(interestMax) && interestMax < 0) {
        errors.interestMax = "Interest maximum must be positive.";
      }
      if (!Number.isNaN(interestMin) && !Number.isNaN(interestMax) && interestMin > interestMax) {
        errors.interestMax = "Interest maximum must be greater than minimum.";
      }
    }
    return errors;
  };

  const buildPayload = (values: ProductFormValues, existing?: LenderProduct | null): LenderProductPayload => {
    const normalizedCountry = normalizeProductCountry(values.country);
    const resolvedRateType = resolveRateType(values.rateType);
    const interestRateMin = formatInterestPayload(resolvedRateType, values.interestMin);
    const interestRateMax = formatInterestPayload(resolvedRateType, values.interestMax);
    const minTerm = Number(values.minTerm);
    const maxTerm = Number(values.maxTerm);
    return {
      lenderId: values.lenderId,
      productName: values.productName.trim() || existing?.productName || deriveProductName(values.category),
      active: values.active,
      category: values.category,
      country: normalizedCountry,
      currency: deriveCurrency(normalizedCountry, existing?.currency ?? null),
      minAmount: Number(values.minAmount),
      maxAmount: Number(values.maxAmount),
      interestRateMin,
      interestRateMax,
      rateType: resolvedRateType,
      termLength: {
        min: Number.isNaN(minTerm) ? 0 : minTerm,
        max: Number.isNaN(maxTerm) ? 0 : maxTerm,
        unit: "months"
      },
      fees: values.fees.trim() ? values.fees.trim() : null,
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
    return LENDER_PRODUCT_CATEGORIES.map((category) => ({
      value: category,
      label: LENDER_PRODUCT_CATEGORY_LABELS[category]
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
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormErrors({});
    setSubmitError(null);
    navigate("/lender-products");
  };

  const handleSubmit = () => {
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
            {!activeLenders.length && <p className="text-sm text-amber-600">No active lenders available.</p>}
          </div>
        )}
        {activeLender && (
          <div className="management-note">
            <span className="status-pill status-pill--active">Lender active</span>
            <span>{formatLenderCountryLabel(activeLender.address?.country) || "—"}</span>
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
                          const productActive = Boolean(product.active);
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
                              <td>{formatLenderCountryLabel(product.country) || "—"}</td>
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
          errorMessage={submitError}
          lenderOptions={activeLenders.map((lender) => ({ value: lender.id, label: lender.name || "Unnamed lender" }))}
          formValues={formValues}
          formErrors={formErrors}
          categoryOptions={categoryOptions}
          rateTypes={RATE_TYPE_OPTIONS}
          documentOptions={PRODUCT_DOCUMENT_OPTIONS}
          formatRateType={formatRateType}
          onChange={(updates) => {
            setFormValues((prev) => {
              const next = { ...prev, ...updates };
              const resolvedRateType = next.rateType ?? prev.rateType;
              if (updates.interestMin !== undefined) {
                next.interestMin = normalizeInterestInput(resolvedRateType, updates.interestMin);
              }
              if (updates.interestMax !== undefined) {
                next.interestMax = normalizeInterestInput(resolvedRateType, updates.interestMax);
              }
              if (updates.rateType && updates.rateType === "variable") {
                next.interestMin = normalizeInterestInput("variable", next.interestMin);
                next.interestMax = normalizeInterestInput("variable", next.interestMax);
              }
              return next;
            });
            if (updates.lenderId) {
              setActiveLenderId(updates.lenderId);
            }
          }}
          onSubmit={handleSubmit}
          onClose={closeModal}
          onCancel={closeModal}
          statusNote={
            submitError ? (
              <Button type="button" variant="secondary" onClick={handleSubmit} disabled={mutationLoading}>
                Retry save
              </Button>
            ) : null
          }
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
