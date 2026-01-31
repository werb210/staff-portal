import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import AppLoading from "@/components/layout/AppLoading";
import RequireRole from "@/components/auth/RequireRole";
import ActionGate from "@/components/auth/ActionGate";
import { useAuthorization } from "@/hooks/useAuthorization";
import ErrorBoundary from "@/components/ErrorBoundary";
import LenderProductModal, { type ProductFormValues } from "@/components/LenderProductModal";
import {
  createLender,
  createLenderProduct,
  fetchLenderById,
  fetchLenderProducts,
  fetchLenders,
  updateLender,
  updateLenderProduct,
  type Lender,
  type LenderPayload,
  type LenderProduct,
  type LenderProductPayload
} from "@/api/lenders";
import { getErrorMessage } from "@/utils/errors";
import { getRequestId } from "@/utils/requestId";
import { emitUiTelemetry } from "@/utils/uiTelemetry";
import { SUBMISSION_METHODS, type SubmissionMethod } from "@/types/lenderManagement.types";
import {
  LENDER_PRODUCT_CATEGORIES,
  LENDER_PRODUCT_CATEGORY_LABELS,
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

type LenderFormValues = {
  name: string;
  active: boolean;
  country: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  submissionMethod: SubmissionMethod;
  submissionEmail: string;
};

const emptyLenderForm: LenderFormValues = {
  name: "",
  active: true,
  country: "CA",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  submissionMethod: "EMAIL",
  submissionEmail: ""
};

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

const isValidEmail = (value: string) => value.includes("@");

const COUNTRIES = [
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "BOTH", label: "Both" }
];

const toFormString = (value?: number | string | null) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const formatRateType = (value: RateType) => value.charAt(0).toUpperCase() + value.slice(1);

const buildCategoryOptions = (country: string) => {
  const normalizedCountry = country.trim().toUpperCase();
  const isUs = normalizedCountry === "US" || normalizedCountry === "BOTH";
  const isCa = normalizedCountry === "CA" || normalizedCountry === "BOTH";
  return LENDER_PRODUCT_CATEGORIES.map((category) => ({
    value: category,
    label: LENDER_PRODUCT_CATEGORY_LABELS[category],
    disabled: (category === "SBA_GOVERNMENT" && !isUs) || (category === "STARTUP_CAPITAL" && !isCa)
  }));
};

const mapLenderToFormValues = (lender: Lender): LenderFormValues => {
  const primaryContact = lender.primaryContact ?? {
    name: "",
    email: "",
    phone: ""
  };
  const submissionConfig = lender.submissionConfig ?? {
    method: "EMAIL",
    submissionEmail: ""
  };
  return {
    ...emptyLenderForm,
    name: lender.name ?? "",
    active: lender.active === true,
    country: lender.address?.country ?? "CA",
    primaryContactName: primaryContact.name ?? "",
    primaryContactEmail: primaryContact.email ?? "",
    primaryContactPhone: primaryContact.phone ?? "",
    submissionMethod: submissionConfig.method === "API" ? "API" : "EMAIL",
    submissionEmail: submissionConfig.submissionEmail ?? ""
  };
};

const LendersContent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { lenderId } = useParams();
  const isNewRoute = location.pathname.endsWith("/new");

  const { data: lenders = [], isLoading, error, refetch: refetchLenders } = useQuery<Lender[], Error>({
    queryKey: ["lenders"],
    queryFn: ({ signal }) => fetchLenders({ signal })
  });
  const safeLenders = Array.isArray(lenders) ? lenders : [];

  const [selectedLenderId, setSelectedLenderId] = useState<string | null>(null);
  const [isLenderModalOpen, setIsLenderModalOpen] = useState(false);
  const [editingLenderId, setEditingLenderId] = useState<string | null>(null);
  const [editingLender, setEditingLender] = useState<Lender | null>(null);
  const [lenderFormValues, setLenderFormValues] = useState<LenderFormValues>(emptyLenderForm);
  const [lenderFormErrors, setLenderFormErrors] = useState<Record<string, string>>({});

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LenderProduct | null>(null);
  const [productFormValues, setProductFormValues] = useState<ProductFormValues>(emptyProductForm(""));
  const [productFormErrors, setProductFormErrors] = useState<Record<string, string>>({});
  const canManageLenders = useAuthorization({ roles: ["Admin", "Staff"] });

  const selectedLender = useMemo(
    () => safeLenders.find((lender) => lender.id === selectedLenderId) ?? null,
    [safeLenders, selectedLenderId]
  );

  const isSelectedLenderInactive = Boolean(selectedLender && selectedLender.active === false);

  const {
    data: lenderDetail,
    isLoading: lenderDetailLoading,
    error: lenderDetailError
  } = useQuery<Lender, Error>({
    queryKey: ["lender-detail", editingLenderId ?? "none"],
    queryFn: () => fetchLenderById(editingLenderId ?? ""),
    enabled: Boolean(editingLenderId && isLenderModalOpen)
  });

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery<LenderProduct[], Error>({
    queryKey: ["lender-products", selectedLenderId ?? "none"],
    queryFn: ({ signal }) => fetchLenderProducts(selectedLenderId ?? "", { signal }),
    enabled: Boolean(selectedLenderId),
    placeholderData: (previousData) => previousData ?? []
  });
  const safeProducts = Array.isArray(products) ? products : [];
  const hasSelectedLender = Boolean(selectedLender);
  const productsToRender = hasSelectedLender ? safeProducts : [];

  useEffect(() => {
    if (isNewRoute) {
      setEditingLender(null);
      setEditingLenderId(null);
      setLenderFormValues(emptyLenderForm);
      setLenderFormErrors({});
      setIsLenderModalOpen(true);
      return;
    }
    if (!lenderId) return;
    setSelectedLenderId(lenderId);
    setEditingLenderId(lenderId);
    setIsLenderModalOpen(true);
  }, [isNewRoute, lenderId]);

  useEffect(() => {
    if (!safeLenders.length) return;
    if (!selectedLenderId || !safeLenders.some((lender) => lender.id === selectedLenderId)) {
      setSelectedLenderId(safeLenders[0].id ?? null);
    }
  }, [safeLenders, selectedLenderId]);

  useEffect(() => {
    if (lenderDetail && editingLenderId && lenderDetail.id === editingLenderId) {
      setEditingLender(lenderDetail);
      queryClient.setQueryData<Lender[]>(["lenders"], (current = []) =>
        current.map((lender) => (lender.id === lenderDetail.id ? lenderDetail : lender))
      );
    }
  }, [editingLenderId, lenderDetail, queryClient]);

  useEffect(() => {
    if (!editingLenderId || !selectedLender || editingLender) return;
    setLenderFormValues(mapLenderToFormValues(selectedLender));
  }, [editingLender, editingLenderId, selectedLender]);

  useEffect(() => {
    if (editingLender) {
      setLenderFormValues(mapLenderToFormValues(editingLender));
      setLenderFormErrors({});
      return;
    }
    if (!isLenderModalOpen || editingLenderId) return;
    setLenderFormValues(emptyLenderForm);
    setLenderFormErrors({});
  }, [editingLender, editingLenderId, isLenderModalOpen]);

  const createLenderMutation = useMutation({
    mutationFn: (payload: LenderPayload) => createLender(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["lenders"] });
      const previous = queryClient.getQueryData<Lender[]>(["lenders"]);
      queryClient.setQueryData<Lender[]>(["lenders"], (current = []) => [
        {
          id: `temp-${Date.now()}`,
          name: payload.name,
          active: payload.active,
          address: {
            street: "",
            city: "",
            stateProvince: "",
            postalCode: "",
            country: payload.country
          },
          phone: payload.phone,
          website: null,
          description: null,
          internalNotes: null,
          processingNotes: null,
          primaryContact: {
            name: payload.contact_name,
            email: payload.contact_email,
            phone: payload.contact_phone,
            mobilePhone: ""
          },
          submissionConfig: {
            method: payload.submission_method,
            apiBaseUrl: null,
            apiClientId: null,
            apiUsername: null,
            apiPassword: null,
            submissionEmail: payload.submission_email
          },
          operationalLimits: {
            maxLendingLimit: null,
            maxLtv: null,
            maxLoanTerm: null,
            maxAmortization: null
          }
        },
        ...current
      ]);
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lenders"], context.previous);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lenders"] });
      await refetchLenders();
      setIsLenderModalOpen(false);
      setEditingLender(null);
      navigate("/lenders");
    }
  });

  const updateLenderMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LenderPayload> }) =>
      updateLender(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["lenders"] });
      const previous = queryClient.getQueryData<Lender[]>(["lenders"]);
      queryClient.setQueryData<Lender[]>(["lenders"], (current = []) =>
        current.map((lender) =>
          lender.id === id
            ? {
                ...lender,
                name: payload.name ?? lender.name,
                active: payload.active ?? lender.active,
                address: {
                  ...lender.address,
                  country: payload.country ?? lender.address?.country
                },
                phone: payload.phone ?? lender.phone,
                primaryContact: {
                  ...lender.primaryContact,
                  name: payload.contact_name ?? lender.primaryContact?.name,
                  email: payload.contact_email ?? lender.primaryContact?.email,
                  phone: payload.contact_phone ?? lender.primaryContact?.phone
                },
                submissionConfig: {
                  ...lender.submissionConfig,
                  method: payload.submission_method ?? lender.submissionConfig?.method,
                  submissionEmail: payload.submission_email ?? lender.submissionConfig?.submissionEmail
                }
              }
            : lender
        )
      );
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lenders"], context.previous);
      }
    },
    onSuccess: async (updated) => {
      if (updated?.id) {
        queryClient.setQueryData<Lender[]>(["lenders"], (current = []) =>
          current.map((lender) => (lender.id === updated.id ? updated : lender))
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["lenders"] });
      setIsLenderModalOpen(false);
      setEditingLenderId(null);
      setEditingLender(null);
      navigate("/lenders");
    }
  });


  const createProductMutation = useMutation({
    mutationFn: (payload: LenderProductPayload) => createLenderProduct(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["lender-products"] });
      const previous = queryClient.getQueryData<LenderProduct[]>(["lender-products", selectedLenderId ?? "none"]);
      queryClient.setQueryData<LenderProduct[]>(["lender-products", selectedLenderId ?? "none"], (current = []) => [
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
        queryClient.setQueryData(["lender-products", selectedLenderId ?? "none"], context.previous);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lender-products"] });
      setIsProductModalOpen(false);
      setEditingProduct(null);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: Partial<LenderProductPayload> }) =>
      updateLenderProduct(productId, payload),
    onMutate: async ({ productId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["lender-products"] });
      const previous = queryClient.getQueryData<LenderProduct[]>(["lender-products", selectedLenderId ?? "none"]);
      queryClient.setQueryData<LenderProduct[]>(["lender-products", selectedLenderId ?? "none"], (current = []) =>
        current.map((product) => (product.id === productId ? { ...product, ...payload } : product))
      );
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lender-products", selectedLenderId ?? "none"], context.previous);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lender-products"] });
      setIsProductModalOpen(false);
      setEditingProduct(null);
    }
  });

  const mutationError = createLenderMutation.error ?? updateLenderMutation.error;
  const mutationLoading = createLenderMutation.isPending || updateLenderMutation.isPending;
  const productMutationError = createProductMutation.error ?? updateProductMutation.error;
  const productMutationLoading = createProductMutation.isPending || updateProductMutation.isPending;
  const rateTypeOptions: RateType[] = ["fixed", "variable"];

  const validateLenderForm = (values: LenderFormValues) => {
    const nextErrors: Record<string, string> = {};
    if (!values.name.trim()) nextErrors.name = "Name is required.";
    if (!values.country.trim()) nextErrors.country = "Country is required.";
    if (!values.primaryContactName.trim()) nextErrors.primaryContactName = "Primary contact name is required.";
    if (!values.primaryContactEmail.trim()) {
      nextErrors.primaryContactEmail = "Primary contact email is required.";
    } else if (!isValidEmail(values.primaryContactEmail)) {
      nextErrors.primaryContactEmail = "Enter a valid email.";
    }
    if (!values.submissionMethod) nextErrors.submissionMethod = "Submission method is required.";
    if (values.submissionMethod === "EMAIL" && !values.submissionEmail.trim()) {
      nextErrors.submissionEmail = "Submission email is required.";
    } else if (values.submissionMethod === "EMAIL" && !isValidEmail(values.submissionEmail)) {
      nextErrors.submissionEmail = "Enter a valid submission email.";
    }
    return nextErrors;
  };

  const buildLenderPayload = (values: LenderFormValues): LenderPayload => ({
    name: values.name.trim(),
    active: values.active,
    phone: values.primaryContactPhone.trim(),
    website: null,
    description: null,
    street: "",
    city: "",
    region: "",
    country: values.country.trim(),
    postal_code: "",
    contact_name: values.primaryContactName.trim(),
    contact_email: values.primaryContactEmail.trim(),
    contact_phone: values.primaryContactPhone.trim(),
    submission_method: values.submissionMethod,
    submission_email: values.submissionMethod === "EMAIL" ? values.submissionEmail.trim() : null
  });

  const validateProductForm = (values: ProductFormValues) => {
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

  const buildProductPayload = (values: ProductFormValues, existing?: LenderProduct | null): LenderProductPayload => {
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
    const resolvedCurrency = deriveCurrency(normalizedCountry, existing?.currency ?? null);
    return {
      lenderId: values.lenderId,
      productName: existing?.productName ?? deriveProductName(values.category),
      active: values.category === "STARTUP_CAPITAL" || isSelectedLenderInactive ? false : values.active,
      category: values.category,
      country: normalizedCountry,
      currency: resolvedCurrency,
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

  const updateProductForm = (updates: Partial<ProductFormValues>) => {
    setProductFormValues((prev) => ({ ...prev, ...updates }));
  };

  const openCreateLenderModal = () => {
    setEditingLender(null);
    setEditingLenderId(null);
    setLenderFormValues(emptyLenderForm);
    setLenderFormErrors({});
    setIsLenderModalOpen(true);
  };

  const openEditLenderModal = (lenderIdValue: string) => {
    if (!lenderIdValue) return;
    setSelectedLenderId(lenderIdValue);
    setEditingLenderId(lenderIdValue);
    setEditingLender(null);
    setLenderFormErrors({});
    setIsLenderModalOpen(true);
  };

  const closeLenderModal = () => {
    setIsLenderModalOpen(false);
    setEditingLenderId(null);
    setEditingLender(null);
    setLenderFormErrors({});
    if (isNewRoute || lenderId) {
      navigate("/lenders");
    }
  };

  const openCreateProductModal = () => {
    if (!selectedLender?.id) return;
    setEditingProduct(null);
    setProductFormValues(emptyProductForm(selectedLender.id));
    setProductFormErrors({});
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: LenderProduct) => {
    if (!product?.id) return;
    const resolvedCategory = product.category ?? LENDER_PRODUCT_CATEGORIES[0];
    const rateDefaults = getRateDefaults(product);
    const termMonths = product.termLength?.min ?? product.termLength?.max ?? 0;
    setEditingProduct(product);
    setProductFormValues({
      lenderId: product.lenderId ?? "",
      active: resolvedCategory === "STARTUP_CAPITAL" || isSelectedLenderInactive ? false : product.active,
      category: resolvedCategory,
      country: product.country ?? "",
      minAmount: toFormString(product.minAmount),
      maxAmount: toFormString(product.maxAmount),
      rateType: rateDefaults.rateType,
      fixedRate: rateDefaults.fixedRate,
      primeRate: rateDefaults.primeRate,
      rateSpread: rateDefaults.rateSpread,
      termMonths: termMonths ? String(termMonths) : "",
      requiredDocuments: mapRequiredDocumentsToValues(product.requiredDocuments)
    });
    setProductFormErrors({});
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setProductFormErrors({});
  };

  useEffect(() => {
    if (error) {
      console.error("Failed to load lenders", { requestId: getRequestId(), error });
    }
  }, [error]);

  useEffect(() => {
    if (!isLoading && !error) {
      emitUiTelemetry("data_loaded", { view: "lenders", count: safeLenders.length });
    }
  }, [error, isLoading, safeLenders.length]);

  useEffect(() => {
    if (lenderDetailError) {
      console.error("Failed to load lender detail", { requestId: getRequestId(), error: lenderDetailError });
    }
  }, [lenderDetailError]);

  return (
    <div className="page">
      <div className="management-grid">
        <Card
          title="Lenders"
          actions={
            <ActionGate
              roles={["Admin", "Staff"]}
              fallback={
                <Button type="button" variant="secondary" disabled>
                  Create lender
                </Button>
              }
            >
              <Button type="button" variant="secondary" onClick={openCreateLenderModal}>
                Create lender
              </Button>
            </ActionGate>
          }
        >
          {isLoading && <AppLoading />}
          {error && (
            <div className="space-y-2">
              <ErrorBanner message={getErrorMessage(error, "Unable to load lenders.")} />
              <Button type="button" variant="secondary" onClick={() => void refetchLenders()}>
                Retry
              </Button>
            </div>
          )}
          {!isLoading && !error && (
            <Table headers={["Name", "Status", "Country", "Primary contact"]}>
              {safeLenders.map((lender, index) => {
                const lenderIdValue = lender.id ?? "";
                const isActive = lender.active === true;
                const lenderName = lender.name?.trim() || "Unnamed lender";
                const rowKey = lenderIdValue || `lender-${index}`;
                return (
                  <tr
                    key={rowKey}
                    className="management-row"
                    role={lenderIdValue ? "button" : undefined}
                    tabIndex={lenderIdValue ? 0 : undefined}
                    onClick={() => lenderIdValue && openEditLenderModal(lenderIdValue)}
                    onKeyDown={(event) => {
                      if (!lenderIdValue) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openEditLenderModal(lenderIdValue);
                      }
                    }}
                  >
                    <td>
                      <span className="management-link">{lenderName}</span>
                    </td>
                    <td>
                      <span className={`status-pill status-pill--${isActive ? "active" : "paused"}`}>
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td>{lender.address?.country || "—"}</td>
                    <td>
                      <div className="text-sm font-semibold">{lender.primaryContact?.name || "—"}</div>
                      <div className="text-xs text-slate-500">{lender.primaryContact?.email || "—"}</div>
                    </td>
                  </tr>
                );
              })}
              {!safeLenders.length && (
                <tr>
                  <td colSpan={4}>
                    No lenders.
                  </td>
                </tr>
              )}
            </Table>
          )}
        </Card>

        <Card
          title="Products"
          actions={
            <ActionGate
              roles={["Admin", "Staff"]}
              fallback={
                <Button type="button" variant="secondary" disabled>
                  Add product
                </Button>
              }
            >
              <Button
                type="button"
                variant="secondary"
                onClick={openCreateProductModal}
                disabled={!selectedLender || isSelectedLenderInactive}
              >
                Add product
              </Button>
            </ActionGate>
          }
        >
          {!selectedLender && (
            <p className="text-sm text-slate-500">Select a lender on the left to view and manage products.</p>
          )}
          {selectedLender && (
            <div className="management-note">
              <span className={`status-pill status-pill--${selectedLender.active ? "active" : "paused"}`}>
                {selectedLender.active ? "Lender active" : "Lender inactive"}
              </span>
              <span>{selectedLender.address?.country || "—"}</span>
              {!selectedLender.active && (
                <span className="text-xs text-amber-600">Inactive lenders cannot publish products.</span>
              )}
            </div>
          )}
          {productsLoading && <AppLoading />}
          {productsError && (
            <div className="space-y-2">
              <ErrorBanner message={getErrorMessage(productsError, "Unable to load products.")} />
              <Button type="button" variant="secondary" onClick={() => void refetchProducts()}>
                Retry
              </Button>
            </div>
          )}
          {!productsLoading && !productsError && (
            <Table headers={["Name", "Category", "Country", "Currency", "Status", "Amount range"]}>
              {productsToRender.map((product, index) => {
                const productIdValue = product.id ?? "";
                const productCategory = product.category ?? LENDER_PRODUCT_CATEGORIES[0];
                const productActive =
                  productCategory === "STARTUP_CAPITAL" ? false : Boolean(product.active);
                const minAmount = Number.isFinite(product.minAmount) ? product.minAmount : 0;
                const maxAmount = Number.isFinite(product.maxAmount) ? product.maxAmount : 0;
                const rowKey = productIdValue || `product-${index}`;
                return (
                  <tr
                    key={rowKey}
                    className={productActive ? "management-row" : "management-row management-row--disabled"}
                  >
                    <td>
                      <button
                        type="button"
                        className="management-link"
                        onClick={() => openEditProductModal(product)}
                        disabled={!productIdValue}
                      >
                        {product.productName || "Untitled product"}
                      </button>
                    </td>
                    <td>
                      <div className="text-sm font-semibold">
                        {LENDER_PRODUCT_CATEGORY_LABELS[productCategory]}
                      </div>
                      {productCategory === "SBA_GOVERNMENT" && (
                        <div className="text-xs text-slate-500">Government Program</div>
                      )}
                      {productCategory === "STARTUP_CAPITAL" && (
                        <div className="text-xs text-amber-600">Not Live</div>
                      )}
                    </td>
                    <td>{product.country || "—"}</td>
                    <td>{product.currency || "—"}</td>
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
              {!productsToRender.length && (
                <tr>
                  <td colSpan={6}>
                    {hasSelectedLender ? "No products for this lender." : "Select a lender to view products."}
                  </td>
                </tr>
              )}
            </Table>
          )}
        </Card>
      </div>

      {isLenderModalOpen && (
        <Modal
          title={editingLender ? "Edit lender" : "Create lender"}
          onClose={closeLenderModal}
        >
          {lenderDetailLoading && editingLenderId && <AppLoading />}
          {lenderDetailError && (
            <ErrorBanner message={getErrorMessage(lenderDetailError, "Unable to load lender details.")} />
          )}
          {mutationError && (
            <ErrorBanner message={getErrorMessage(mutationError, "Unable to save lender.")} />
          )}
          <form
            className="management-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!canManageLenders) return;
              const nextErrors = validateLenderForm(lenderFormValues);
              setLenderFormErrors(nextErrors);
              if (Object.keys(nextErrors).length) return;
              if (editingLender) {
                if (!editingLender.id) {
                  setLenderFormErrors({ name: "Missing lender id. Please refresh and try again." });
                  return;
                }
                updateLenderMutation.mutate({
                  id: editingLender.id,
                  payload: buildLenderPayload(lenderFormValues)
                });
                return;
              }
              createLenderMutation.mutate(buildLenderPayload(lenderFormValues));
            }}
          >
            <div className="management-field">
              <span className="management-field__label">Lender details</span>
              <Input
                label="Lender name"
                value={lenderFormValues.name}
                onChange={(event) => setLenderFormValues((prev) => ({ ...prev, name: event.target.value }))}
                error={lenderFormErrors.name}
              />
              <Select
                label="Country"
                value={lenderFormValues.country}
                onChange={(event) =>
                  setLenderFormValues((prev) => ({
                    ...prev,
                    country: event.target.value
                  }))
                }
              >
                {COUNTRIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </Select>
              {lenderFormErrors.country && <span className="ui-field__error">{lenderFormErrors.country}</span>}
              <label className="management-toggle">
                <input
                  type="checkbox"
                  checked={lenderFormValues.active}
                  onChange={(event) =>
                    setLenderFormValues((prev) => ({ ...prev, active: event.target.checked }))
                  }
                />
                <span>Active lender</span>
              </label>
            </div>

            <div className="management-field">
              <span className="management-field__label">Primary contact</span>
              <Input
                label="Contact name"
                value={lenderFormValues.primaryContactName}
                onChange={(event) =>
                  setLenderFormValues((prev) => ({ ...prev, primaryContactName: event.target.value }))
                }
                error={lenderFormErrors.primaryContactName}
              />
              <Input
                label="Contact email"
                value={lenderFormValues.primaryContactEmail}
                onChange={(event) =>
                  setLenderFormValues((prev) => ({ ...prev, primaryContactEmail: event.target.value }))
                }
                error={lenderFormErrors.primaryContactEmail}
              />
              <div className="management-grid__row">
                <Input
                  label="Contact phone"
                  value={lenderFormValues.primaryContactPhone}
                  onChange={(event) =>
                    setLenderFormValues((prev) => ({ ...prev, primaryContactPhone: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="management-field">
              <span className="management-field__label">Submission configuration</span>
              <Select
                label="Submission method"
                value={lenderFormValues.submissionMethod}
                onChange={(event) =>
                  setLenderFormValues((prev) => ({
                    ...prev,
                    submissionMethod: event.target.value as SubmissionMethod
                  }))
                }
              >
                {SUBMISSION_METHODS.filter((method) => method !== "MANUAL").map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>
              {lenderFormErrors.submissionMethod && (
                <span className="ui-field__error">{lenderFormErrors.submissionMethod}</span>
              )}
              {lenderFormValues.submissionMethod === "EMAIL" && (
                <Input
                  label="Submission email"
                  value={lenderFormValues.submissionEmail}
                  onChange={(event) =>
                    setLenderFormValues((prev) => ({ ...prev, submissionEmail: event.target.value }))
                  }
                  error={lenderFormErrors.submissionEmail}
                />
              )}
            </div>

            <div className="management-actions">
              <Button type="submit" disabled={mutationLoading}>
                {editingLender ? "Save changes" : "Create lender"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {isProductModalOpen && selectedLender && (
        <LenderProductModal
          isOpen={isProductModalOpen}
          title={editingProduct ? "Edit product" : "Add product"}
          isSaving={productMutationLoading}
          errorMessage={
            productMutationError ? getErrorMessage(productMutationError, "Unable to save product.") : null
          }
          isSelectedLenderInactive={isSelectedLenderInactive}
          lenderOptions={[{ value: selectedLender.id, label: selectedLender.name }]}
          formValues={productFormValues}
          formErrors={productFormErrors}
          categoryOptions={buildCategoryOptions(productFormValues.country)}
          rateTypes={rateTypeOptions}
          documentOptions={PRODUCT_DOCUMENT_OPTIONS}
          formatRateType={formatRateType}
          onChange={updateProductForm}
          onSubmit={() => {
            if (!canManageLenders) return;
            const errors = validateProductForm(productFormValues);
            setProductFormErrors(errors);
            if (Object.keys(errors).length) return;
            const payload = buildProductPayload(productFormValues, editingProduct);
              if (editingProduct) {
                if (!editingProduct.id) {
                  setProductFormErrors({ category: "Missing product id. Please refresh and try again." });
                  return;
                }
              updateProductMutation.mutate({ productId: editingProduct.id, payload });
              return;
            }
            createProductMutation.mutate(payload);
          }}
          onClose={closeProductModal}
          onCancel={closeProductModal}
          requiredDocuments={editingProduct?.requiredDocuments ?? []}
          statusNote={
            isSelectedLenderInactive ? (
              <p className="text-xs text-amber-600">
                This lender is inactive. Products will remain inactive until the lender is active again.
              </p>
            ) : null
          }
        />
      )}
    </div>
  );
};

const LendersPage = () => (
  <RequireRole roles={["Admin", "Staff"]}>
    <ErrorBoundary>
      <LendersContent />
    </ErrorBoundary>
  </RequireRole>
);

export default LendersPage;
