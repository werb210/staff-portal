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
import { ApiError } from "@/lib/api";
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
  formatInterestPayload,
  getDefaultRequiredDocuments,
  getRateDefaults,
  isValidVariableRate,
  mapRequiredDocumentsToValues,
  normalizeInterestInput,
  resolveRateType
} from "./lenderProductForm";

type LenderFormValues = {
  name: string;
  active: boolean;
  country: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  website: string;
  internalNotes: string;
  submissionMethod: SubmissionMethod;
  submissionEmail: string;
};

const emptyLenderForm: LenderFormValues = {
  name: "",
  active: true,
  country: "Canada",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  website: "",
  internalNotes: "",
  submissionMethod: "EMAIL",
  submissionEmail: ""
};

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

const isValidEmail = (value: string) => value.includes("@");

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

const COUNTRIES = [
  { value: "Canada", label: "Canada" },
  { value: "United States", label: "United States" },
  { value: "Both", label: "Both" }
];

const normalizeLenderCountryValue = (value?: string | null) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return COUNTRIES[0].value;
  const normalized = trimmed.toUpperCase();
  if (normalized === "CA" || normalized === "CANADA") return "Canada";
  if (normalized === "US" || normalized === "USA" || normalized === "UNITED STATES") return "United States";
  if (normalized === "BOTH") return "Both";
  return trimmed;
};

const toFormString = (value?: number | string | null) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const formatRateType = (value: RateType) => value.charAt(0).toUpperCase() + value.slice(1);

const buildCategoryOptions = (country: string) => {
  return LENDER_PRODUCT_CATEGORIES.map((category) => ({
    value: category,
    label: LENDER_PRODUCT_CATEGORY_LABELS[category]
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
    country: normalizeLenderCountryValue(lender.address?.country ?? ""),
    primaryContactName: primaryContact.name ?? "",
    primaryContactEmail: primaryContact.email ?? "",
    primaryContactPhone: primaryContact.phone ?? "",
    website: lender.website ?? "",
    internalNotes: lender.internalNotes ?? "",
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
  const [lenderSubmitError, setLenderSubmitError] = useState<string | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LenderProduct | null>(null);
  const [productFormValues, setProductFormValues] = useState<ProductFormValues>(emptyProductForm(""));
  const [productFormErrors, setProductFormErrors] = useState<Record<string, string>>({});
  const [productSubmitError, setProductSubmitError] = useState<string | null>(null);
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
    if (!isLenderModalOpen) return;
    if (editingLenderId) {
      if (!lenderDetail) return;
      setLenderFormValues(mapLenderToFormValues(lenderDetail));
      setLenderFormErrors({});
      setLenderSubmitError(null);
      return;
    }
    setLenderFormValues(emptyLenderForm);
    setLenderFormErrors({});
    setLenderSubmitError(null);
  }, [editingLenderId, isLenderModalOpen, lenderDetail]);

  const lenderFieldMap = useMemo(
    () => ({
      name: "name",
      country: "country",
      active: "active",
      submission_method: "submissionMethod",
      submission_email: "submissionEmail",
      contact_name: "primaryContactName",
      contact_email: "primaryContactEmail",
      contact_phone: "primaryContactPhone",
      website: "website"
    }),
    []
  );

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

  const createLenderMutation = useMutation({
    mutationFn: (payload: LenderPayload) => createLender(payload),
    onMutate: async (payload) => {
      setLenderSubmitError(null);
      setLenderFormErrors({});
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
          website: payload.website,
          description: null,
          internalNotes: payload.internal_notes ?? null,
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
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lenders"], context.previous);
      }
      const validationErrors = extractValidationErrors(error, lenderFieldMap);
      if (validationErrors && Object.keys(validationErrors).length) {
        setLenderFormErrors(validationErrors);
        return;
      }
      setLenderSubmitError(getErrorMessage(error, "Unable to save lender. Please retry."));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lenders"] });
      await refetchLenders();
      setIsLenderModalOpen(false);
      setEditingLender(null);
      setLenderSubmitError(null);
      navigate("/lenders");
    }
  });

  const updateLenderMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LenderPayload> }) =>
      updateLender(id, payload),
    onMutate: async ({ id, payload }) => {
      setLenderSubmitError(null);
      setLenderFormErrors({});
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
                website: payload.website ?? lender.website,
                internalNotes: payload.internal_notes ?? lender.internalNotes,
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
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lenders"], context.previous);
      }
      const validationErrors = extractValidationErrors(error, lenderFieldMap);
      if (validationErrors && Object.keys(validationErrors).length) {
        setLenderFormErrors(validationErrors);
        return;
      }
      setLenderSubmitError(getErrorMessage(error, "Unable to save lender. Please retry."));
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
      setLenderSubmitError(null);
      navigate("/lenders");
    }
  });


  const createProductMutation = useMutation({
    mutationFn: (payload: LenderProductPayload) => createLenderProduct(payload),
    onMutate: async (payload) => {
      setProductSubmitError(null);
      setProductFormErrors({});
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
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lender-products", selectedLenderId ?? "none"], context.previous);
      }
      const validationErrors = extractValidationErrors(error, productFieldMap);
      if (validationErrors && Object.keys(validationErrors).length) {
        setProductFormErrors(validationErrors);
        return;
      }
      setProductSubmitError(getErrorMessage(error, "Unable to save product. Please retry."));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lender-products"] });
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductSubmitError(null);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: Partial<LenderProductPayload> }) =>
      updateLenderProduct(productId, payload),
    onMutate: async ({ productId, payload }) => {
      setProductSubmitError(null);
      setProductFormErrors({});
      await queryClient.cancelQueries({ queryKey: ["lender-products"] });
      const previous = queryClient.getQueryData<LenderProduct[]>(["lender-products", selectedLenderId ?? "none"]);
      queryClient.setQueryData<LenderProduct[]>(["lender-products", selectedLenderId ?? "none"], (current = []) =>
        current.map((product) => (product.id === productId ? { ...product, ...payload } : product))
      );
      return { previous };
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lender-products", selectedLenderId ?? "none"], context.previous);
      }
      const validationErrors = extractValidationErrors(error, productFieldMap);
      if (validationErrors && Object.keys(validationErrors).length) {
        setProductFormErrors(validationErrors);
        return;
      }
      setProductSubmitError(getErrorMessage(error, "Unable to save product. Please retry."));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lender-products"] });
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductSubmitError(null);
    }
  });

  const mutationLoading = createLenderMutation.isPending || updateLenderMutation.isPending;
  const productMutationLoading = createProductMutation.isPending || updateProductMutation.isPending;
  const rateTypeOptions: RateType[] = ["fixed", "variable"];
  const apiConfig = editingLender?.submissionConfig ?? lenderDetail?.submissionConfig ?? null;

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
    website: values.website.trim() ? values.website.trim() : null,
    description: null,
    internal_notes: values.internalNotes.trim() ? values.internalNotes.trim() : null,
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

  const buildProductPayload = (values: ProductFormValues, existing?: LenderProduct | null): LenderProductPayload => {
    const normalizedCountry = values.country.trim();
    const resolvedRateType = resolveRateType(values.rateType);
    const interestRateMin = formatInterestPayload(resolvedRateType, values.interestMin);
    const interestRateMax = formatInterestPayload(resolvedRateType, values.interestMax);
    const minTerm = Number(values.minTerm);
    const maxTerm = Number(values.maxTerm);
    const resolvedCurrency = deriveCurrency(normalizedCountry, existing?.currency ?? null);
    return {
      lenderId: values.lenderId,
      productName: values.productName.trim() || existing?.productName || deriveProductName(values.category),
      active: values.active,
      category: values.category,
      country: normalizedCountry,
      currency: resolvedCurrency,
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

  const updateProductForm = (updates: Partial<ProductFormValues>) => {
    setProductFormValues((prev) => {
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
  };

  const handleLenderSubmit = () => {
    if (!canManageLenders) return;
    const nextErrors = validateLenderForm(lenderFormValues);
    setLenderFormErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = buildLenderPayload(lenderFormValues);
    if (editingLender) {
      if (!editingLender.id) {
        setLenderFormErrors({ name: "Missing lender id. Please refresh and try again." });
        return;
      }
      updateLenderMutation.mutate({ id: editingLender.id, payload });
      return;
    }
    createLenderMutation.mutate(payload);
  };

  const handleProductSubmit = () => {
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
  };

  const openCreateLenderModal = () => {
    setEditingLender(null);
    setEditingLenderId(null);
    setLenderFormValues(emptyLenderForm);
    setLenderFormErrors({});
    setLenderSubmitError(null);
    setIsLenderModalOpen(true);
  };

  const openEditLenderModal = (lenderIdValue: string) => {
    if (!lenderIdValue) return;
    setSelectedLenderId(lenderIdValue);
    setEditingLenderId(lenderIdValue);
    setEditingLender(null);
    setLenderFormErrors({});
    setLenderSubmitError(null);
    setIsLenderModalOpen(true);
  };

  const closeLenderModal = () => {
    setIsLenderModalOpen(false);
    setEditingLenderId(null);
    setEditingLender(null);
    setLenderFormErrors({});
    setLenderSubmitError(null);
    if (isNewRoute || lenderId) {
      navigate("/lenders");
    }
  };

  const openCreateProductModal = () => {
    if (!selectedLender?.id) return;
    setEditingProduct(null);
    setProductFormValues(emptyProductForm(selectedLender.id));
    setProductFormErrors({});
    setProductSubmitError(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: LenderProduct) => {
    if (!product?.id) return;
    const resolvedCategory = product.category ?? LENDER_PRODUCT_CATEGORIES[0];
    const rateDefaults = getRateDefaults(product);
    setEditingProduct(product);
    setProductFormValues({
      lenderId: product.lenderId ?? "",
      active: product.active,
      productName: product.productName ?? "",
      category: resolvedCategory,
      country: product.country ?? "",
      minAmount: toFormString(product.minAmount),
      maxAmount: toFormString(product.maxAmount),
      rateType: rateDefaults.rateType,
      interestMin: rateDefaults.interestMin,
      interestMax: rateDefaults.interestMax,
      minTerm: toFormString(product.termLength?.min),
      maxTerm: toFormString(product.termLength?.max),
      fees: product.fees ?? "",
      requiredDocuments: mapRequiredDocumentsToValues(product.requiredDocuments)
    });
    setProductFormErrors({});
    setProductSubmitError(null);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setProductFormErrors({});
    setProductSubmitError(null);
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
                const lenderName = lender.name?.trim() || "Unnamed lender";
                const statusLabel = lender.status ?? "—";
                const statusVariant = statusLabel === "ACTIVE" ? "active" : "paused";
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
                      <span className={`status-pill status-pill--${statusVariant}`}>
                        {statusLabel}
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
            <Table headers={["Name", "Category", "Country", "Status", "Amount range"]}>
              {productsToRender.map((product, index) => {
                const productIdValue = product.id ?? "";
                const productCategory = product.category ?? LENDER_PRODUCT_CATEGORIES[0];
                const productActive = Boolean(product.active);
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
              {!productsToRender.length && (
                <tr>
                  <td colSpan={5}>
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
          {lenderSubmitError && (
            <div className="space-y-2">
              <ErrorBanner message={lenderSubmitError} />
              <Button type="button" variant="secondary" onClick={handleLenderSubmit} disabled={mutationLoading}>
                Retry save
              </Button>
            </div>
          )}
          <form
            className="management-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleLenderSubmit();
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
              <span className="management-field__label">Additional details</span>
              <Input
                label="Website"
                value={lenderFormValues.website}
                onChange={(event) => setLenderFormValues((prev) => ({ ...prev, website: event.target.value }))}
              />
              <label className="ui-field">
                <span className="ui-field__label">Notes (internal only)</span>
                <textarea
                  className="ui-input ui-textarea"
                  value={lenderFormValues.internalNotes}
                  onChange={(event) =>
                    setLenderFormValues((prev) => ({ ...prev, internalNotes: event.target.value }))
                  }
                />
              </label>
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
              {lenderFormValues.submissionMethod === "API" && (
                <div className="space-y-3">
                  <Input
                    label="API Base URL"
                    value={apiConfig?.apiBaseUrl ?? ""}
                    placeholder="Not configured"
                    disabled
                  />
                  <Input
                    label="API Client ID"
                    value={apiConfig?.apiClientId ?? ""}
                    placeholder="Not configured"
                    disabled
                  />
                  <Input
                    label="API Username"
                    value={apiConfig?.apiUsername ?? ""}
                    placeholder="Not configured"
                    disabled
                  />
                  <p className="text-xs text-slate-500">
                    API configuration is managed in the backend and is display-only here.
                  </p>
                </div>
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
          errorMessage={productSubmitError}
          lenderOptions={[{ value: selectedLender.id, label: selectedLender.name }]}
          formValues={productFormValues}
          formErrors={productFormErrors}
          categoryOptions={buildCategoryOptions(productFormValues.country)}
          rateTypes={rateTypeOptions}
          documentOptions={PRODUCT_DOCUMENT_OPTIONS}
          formatRateType={formatRateType}
          onChange={updateProductForm}
          onSubmit={handleProductSubmit}
          onClose={closeProductModal}
          onCancel={closeProductModal}
          requiredDocuments={editingProduct?.requiredDocuments ?? []}
          statusNote={
            <div className="space-y-2">
              {isSelectedLenderInactive && (
                <p className="text-xs text-amber-600">
                  This lender is inactive. Products will remain inactive until the lender is active again.
                </p>
              )}
              {productSubmitError && (
                <Button type="button" variant="secondary" onClick={handleProductSubmit} disabled={productMutationLoading}>
                  Retry save
                </Button>
              )}
            </div>
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
