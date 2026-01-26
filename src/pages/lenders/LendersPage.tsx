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
  RATE_TYPES,
  TERM_UNITS,
  type LenderProductCategory,
  type RateType,
  type TermUnit
} from "@/types/lenderManagement.types";

type LenderFormValues = {
  name: string;
  active: boolean;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  website: string;
  description: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  submissionMethod: SubmissionMethod;
  submissionEmail: string;
};

const emptyLenderForm: LenderFormValues = {
  name: "",
  active: true,
  street: "",
  city: "",
  region: "",
  postalCode: "",
  country: "CA",
  phone: "",
  website: "",
  description: "",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  submissionMethod: "MANUAL",
  submissionEmail: ""
};

const emptyProductForm = (lenderId: string): ProductFormValues => ({
  lenderId,
  productName: "",
  active: true,
  category: LENDER_PRODUCT_CATEGORIES[0],
  country: "",
  currency: "",
  minAmount: "",
  maxAmount: "",
  interestRateMin: "",
  interestRateMax: "",
  rateType: RATE_TYPES[0],
  termMin: "",
  termMax: "",
  termUnit: TERM_UNITS[0],
  minimumCreditScore: "",
  ltv: "",
  eligibilityRules: "",
  minimumRevenue: "",
  timeInBusinessMonths: "",
  industryRestrictions: ""
});

const optionalString = (value: string) => (value.trim() ? value.trim() : null);
const isValidEmail = (value: string) => value.includes("@");

const COUNTRIES = [
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" }
];

const PROVINCES = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" }
];

const STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" }
];

const toOptionalNumber = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const toFormString = (value?: number | string | null) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const formatRateType = (value: RateType) => value.charAt(0).toUpperCase() + value.slice(1);

const buildCategoryOptions = (country: string) => {
  const normalizedCountry = country.trim().toUpperCase();
  const isUs = normalizedCountry === "US";
  const isCa = normalizedCountry === "CA";
  return LENDER_PRODUCT_CATEGORIES.map((category) => ({
    value: category,
    label: LENDER_PRODUCT_CATEGORY_LABELS[category],
    disabled: (category === "SBA_GOVERNMENT" && !isUs) || (category === "STARTUP_CAPITAL" && !isCa)
  }));
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
  const [editingLender, setEditingLender] = useState<Lender | null>(null);
  const [lenderFormValues, setLenderFormValues] = useState<LenderFormValues>(emptyLenderForm);
  const [lenderFormErrors, setLenderFormErrors] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("active");
  const [togglingLenderId, setTogglingLenderId] = useState<string | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LenderProduct | null>(null);
  const [productFormValues, setProductFormValues] = useState<ProductFormValues>(emptyProductForm(""));
  const [productFormErrors, setProductFormErrors] = useState<Record<string, string>>({});
  const canManageLenders = useAuthorization({ roles: ["Admin", "Staff"] });

  const filteredLenders = useMemo(() => {
    if (statusFilter === "all") return safeLenders;
    const shouldBeActive = statusFilter === "active";
    return safeLenders.filter((lender) => Boolean(lender.active ?? true) === shouldBeActive);
  }, [safeLenders, statusFilter]);

  const selectedLender = useMemo(
    () => safeLenders.find((lender) => lender.id === selectedLenderId) ?? null,
    [safeLenders, selectedLenderId]
  );

  const isSelectedLenderInactive = Boolean(selectedLender && selectedLender.active === false);

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

  useEffect(() => {
    if (isNewRoute) {
      setEditingLender(null);
      setLenderFormValues(emptyLenderForm);
      setLenderFormErrors({});
      setIsLenderModalOpen(true);
      return;
    }
    if (!lenderId) return;
    const matching = safeLenders.find((lender) => lender.id === lenderId);
    if (!matching) return;
    setSelectedLenderId(matching.id);
    setEditingLender(matching);
    setIsLenderModalOpen(true);
  }, [isNewRoute, lenderId, safeLenders]);

  useEffect(() => {
    if (!filteredLenders.length) return;
    if (!selectedLenderId || !filteredLenders.some((lender) => lender.id === selectedLenderId)) {
      setSelectedLenderId(filteredLenders[0].id ?? null);
    }
  }, [filteredLenders, selectedLenderId]);

  useEffect(() => {
    if (editingLender) {
      const address = editingLender.address ?? {
        street: "",
        city: "",
        stateProvince: "",
        postalCode: "",
        country: "CA"
      };
      const primaryContact = editingLender.primaryContact ?? {
        name: "",
        email: "",
        phone: ""
      };
      const submissionConfig = editingLender.submissionConfig ?? {
        method: "MANUAL",
        submissionEmail: ""
      };
      setLenderFormValues({
        ...emptyLenderForm,
        name: editingLender.name ?? "",
        active: editingLender.active ?? true,
        street: address.street ?? "",
        city: address.city ?? "",
        region: address.stateProvince ?? "",
        postalCode: address.postalCode ?? "",
        country: address.country ?? "CA",
        phone: editingLender.phone ?? "",
        website: editingLender.website ?? "",
        description: editingLender.description ?? "",
        primaryContactName: primaryContact.name ?? "",
        primaryContactEmail: primaryContact.email ?? "",
        primaryContactPhone: primaryContact.phone ?? "",
        submissionMethod: submissionConfig.method ?? "MANUAL",
        submissionEmail: submissionConfig.submissionEmail ?? ""
      });
      setLenderFormErrors({});
      return;
    }
    if (!isLenderModalOpen) return;
    setLenderFormValues(emptyLenderForm);
    setLenderFormErrors({});
  }, [editingLender, isLenderModalOpen]);

  const createLenderMutation = useMutation({
    mutationFn: (payload: LenderPayload) => createLender(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lenders"] });
      setIsLenderModalOpen(false);
      setEditingLender(null);
      navigate("/lenders");
    }
  });

  const updateLenderMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LenderPayload> }) =>
      updateLender(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lenders"] });
      setIsLenderModalOpen(false);
      setEditingLender(null);
      navigate("/lenders");
    }
  });

  const toggleLenderStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => updateLender(id, { active }),
    onMutate: async ({ id, active }) => {
      setTogglingLenderId(id);
      await queryClient.cancelQueries({ queryKey: ["lenders"] });
      const previous = queryClient.getQueryData<Lender[]>(["lenders"]);
      queryClient.setQueryData<Lender[]>(["lenders"], (current = []) =>
        current.map((lender) => (lender.id === id ? { ...lender, active } : lender))
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lenders"], context.previous);
      }
    },
    onSettled: async () => {
      setTogglingLenderId(null);
      await queryClient.invalidateQueries({ queryKey: ["lenders"] });
    }
  });

  const createProductMutation = useMutation({
    mutationFn: (payload: LenderProductPayload) => createLenderProduct(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lender-products"] });
      setIsProductModalOpen(false);
      setEditingProduct(null);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: Partial<LenderProductPayload> }) =>
      updateLenderProduct(productId, payload),
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
  const statusToggleError = toggleLenderStatusMutation.error;

  const validateLenderForm = (values: LenderFormValues) => {
    const nextErrors: Record<string, string> = {};
    if (!values.name.trim()) nextErrors.name = "Name is required.";
    if (!values.street.trim()) nextErrors.street = "Street is required.";
    if (!values.city.trim()) nextErrors.city = "City is required.";
    if (!values.region.trim()) nextErrors.region = "State/province is required.";
    if (!values.postalCode.trim()) nextErrors.postalCode = "Postal code is required.";
    if (!values.country.trim()) nextErrors.country = "Country is required.";
    if (!values.phone.trim()) nextErrors.phone = "Phone is required.";
    if (!values.primaryContactName.trim()) nextErrors.primaryContactName = "Primary contact name is required.";
    if (!values.primaryContactEmail.trim()) {
      nextErrors.primaryContactEmail = "Primary contact email is required.";
    } else if (!isValidEmail(values.primaryContactEmail)) {
      nextErrors.primaryContactEmail = "Enter a valid email.";
    }
    if (!values.submissionMethod) nextErrors.submissionMethod = "Submission method is required.";
    if (values.submissionMethod === "EMAIL" && !values.submissionEmail.trim()) {
      nextErrors.submissionEmail = "Submission email is required.";
    }
    return nextErrors;
  };

  const buildLenderPayload = (values: LenderFormValues): LenderPayload => ({
    name: values.name.trim(),
    active: values.active,
    phone: values.phone.trim(),
    website: optionalString(values.website),
    description: optionalString(values.description),
    street: values.street.trim(),
    city: values.city.trim(),
    region: values.region.trim(),
    country: values.country.trim(),
    postal_code: values.postalCode.trim(),
    contact_name: values.primaryContactName.trim(),
    contact_email: values.primaryContactEmail.trim(),
    contact_phone: values.primaryContactPhone.trim(),
    submission_method: values.submissionMethod,
    submission_email:
      values.submissionMethod === "EMAIL" ? optionalString(values.submissionEmail) : null
  });

  const validateProductForm = (values: ProductFormValues) => {
    const errors: Record<string, string> = {};
    if (!values.lenderId) errors.lenderId = "Lender is required.";
    if (!values.productName.trim()) errors.productName = "Product name is required.";
    if (!values.category) errors.category = "Product category is required.";
    if (!values.country.trim()) errors.country = "Country is required.";
    if (!values.currency.trim()) errors.currency = "Currency is required.";
    if (!values.minAmount) errors.minAmount = "Minimum amount is required.";
    if (!values.maxAmount) errors.maxAmount = "Maximum amount is required.";
    const minAmount = Number(values.minAmount);
    const maxAmount = Number(values.maxAmount);
    if (Number.isNaN(minAmount)) errors.minAmount = "Minimum amount must be a number.";
    if (Number.isNaN(maxAmount)) errors.maxAmount = "Maximum amount must be a number.";
    if (!Number.isNaN(minAmount) && !Number.isNaN(maxAmount) && minAmount > maxAmount) {
      errors.maxAmount = "Maximum amount must be greater than minimum.";
    }
    const rateMin = Number(values.interestRateMin);
    const rateMax = Number(values.interestRateMax);
    if (!values.interestRateMin) errors.interestRateMin = "Minimum rate is required.";
    if (!values.interestRateMax) errors.interestRateMax = "Maximum rate is required.";
    if (Number.isNaN(rateMin)) errors.interestRateMin = "Minimum rate must be a number.";
    if (Number.isNaN(rateMax)) errors.interestRateMax = "Maximum rate must be a number.";
    if (!Number.isNaN(rateMin) && !Number.isNaN(rateMax) && rateMin > rateMax) {
      errors.interestRateMax = "Maximum rate must be greater than minimum.";
    }
    if (rateMin < 0 || rateMax < 0) {
      errors.interestRateMin = "Rates must be positive.";
    }
    if (!values.rateType) errors.rateType = "Rate type is required.";
    if (!values.termMin) errors.termMin = "Minimum term is required.";
    if (!values.termMax) errors.termMax = "Maximum term is required.";
    const termMin = Number(values.termMin);
    const termMax = Number(values.termMax);
    if (Number.isNaN(termMin)) errors.termMin = "Minimum term must be a number.";
    if (Number.isNaN(termMax)) errors.termMax = "Maximum term must be a number.";
    if (!Number.isNaN(termMin) && !Number.isNaN(termMax) && termMin > termMax) {
      errors.termMax = "Maximum term must be greater than minimum.";
    }
    const creditScore = toOptionalNumber(values.minimumCreditScore);
    if (values.minimumCreditScore.trim() && creditScore === null) {
      errors.minimumCreditScore = "Minimum credit score must be a number.";
    }
    const ltv = toOptionalNumber(values.ltv);
    if (values.ltv.trim() && ltv === null) {
      errors.ltv = "LTV must be a number.";
    }
    if (ltv !== null && (ltv < 0 || ltv > 100)) {
      errors.ltv = "LTV must be between 0 and 100.";
    }
    const minRevenue = toOptionalNumber(values.minimumRevenue);
    if (values.minimumRevenue.trim() && minRevenue === null) {
      errors.minimumRevenue = "Minimum revenue must be a number.";
    }
    const timeInBusiness = toOptionalNumber(values.timeInBusinessMonths);
    if (values.timeInBusinessMonths.trim() && timeInBusiness === null) {
      errors.timeInBusinessMonths = "Time in business must be a number.";
    }
    const normalizedCountry = values.country.trim().toUpperCase();
    if (values.category === "SBA_GOVERNMENT" && normalizedCountry !== "US") {
      errors.category = "SBA products must be limited to US lenders.";
    }
    if (values.category === "STARTUP_CAPITAL" && normalizedCountry !== "CA") {
      errors.category = "Startup capital is limited to Canada.";
    }
    if (values.category === "STARTUP_CAPITAL" && values.active) {
      errors.active = "Startup capital products must remain inactive.";
    }
    return errors;
  };

  const buildProductPayload = (values: ProductFormValues): LenderProductPayload => ({
    lenderId: values.lenderId,
    productName: values.productName.trim(),
    active: values.category === "STARTUP_CAPITAL" || isSelectedLenderInactive ? false : values.active,
    category: values.category,
    country: values.country.trim(),
    currency: values.currency.trim(),
    minAmount: Number(values.minAmount),
    maxAmount: Number(values.maxAmount),
    interestRateMin: Number(values.interestRateMin),
    interestRateMax: Number(values.interestRateMax),
    rateType: values.rateType,
    termLength: {
      min: Number(values.termMin),
      max: Number(values.termMax),
      unit: values.termUnit
    },
    minimumCreditScore: toOptionalNumber(values.minimumCreditScore),
    ltv: toOptionalNumber(values.ltv),
    eligibilityRules: values.eligibilityRules.trim() ? values.eligibilityRules.trim() : null,
    eligibilityFlags: {
      minimumRevenue: toOptionalNumber(values.minimumRevenue),
      timeInBusinessMonths: toOptionalNumber(values.timeInBusinessMonths),
      industryRestrictions: values.industryRestrictions.trim() ? values.industryRestrictions.trim() : null
    }
  });

  const updateProductForm = (updates: Partial<ProductFormValues>) => {
    setProductFormValues((prev) => ({ ...prev, ...updates }));
  };

  const openCreateLenderModal = () => {
    setEditingLender(null);
    setLenderFormValues(emptyLenderForm);
    setLenderFormErrors({});
    setIsLenderModalOpen(true);
  };

  const openEditLenderModal = (lender: Lender) => {
    if (!lender?.id) return;
    setEditingLender(lender);
    setIsLenderModalOpen(true);
  };

  const closeLenderModal = () => {
    setIsLenderModalOpen(false);
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
    const eligibilityFlags = product.eligibilityFlags ?? {
      minimumRevenue: null,
      timeInBusinessMonths: null,
      industryRestrictions: null
    };
    const termLength = product.termLength ?? {
      min: 0,
      max: 0,
      unit: TERM_UNITS[0]
    };
    const resolvedCategory = product.category ?? LENDER_PRODUCT_CATEGORIES[0];
    setEditingProduct(product);
    setProductFormValues({
      lenderId: product.lenderId ?? "",
      productName: product.productName ?? "",
      active: resolvedCategory === "STARTUP_CAPITAL" || isSelectedLenderInactive ? false : product.active,
      category: resolvedCategory,
      country: product.country ?? "",
      currency: product.currency ?? "",
      minAmount: toFormString(product.minAmount),
      maxAmount: toFormString(product.maxAmount),
      interestRateMin: toFormString(product.interestRateMin),
      interestRateMax: toFormString(product.interestRateMax),
      rateType: product.rateType ?? RATE_TYPES[0],
      termMin: toFormString(termLength.min),
      termMax: toFormString(termLength.max),
      termUnit: termLength.unit ?? TERM_UNITS[0],
      minimumCreditScore: toFormString(product.minimumCreditScore),
      ltv: toFormString(product.ltv),
      eligibilityRules: product.eligibilityRules ?? "",
      minimumRevenue: toFormString(eligibilityFlags.minimumRevenue),
      timeInBusinessMonths: toFormString(eligibilityFlags.timeInBusinessMonths),
      industryRestrictions: eligibilityFlags.industryRestrictions ?? ""
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
          {statusToggleError && !error && (
            <ErrorBanner message={getErrorMessage(statusToggleError, "Unable to update lender status.")} />
          )}
          {!isLoading && !error && safeLenders.length > 0 && (
            <div className="management-grid__row" style={{ marginBottom: 12 }}>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "active" | "inactive" | "all")}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="all">All</option>
              </Select>
            </div>
          )}
          {!isLoading && !error && (
            <Table headers={["Name", "Status", "Country", "Primary contact", "Submission", "Actions"]}>
              {filteredLenders.map((lender, index) => {
                const lenderIdValue = lender.id ?? "";
                const isActive = lender.active ?? true;
                const lenderName = lender.name?.trim() || "Unnamed lender";
                const rowKey = lenderIdValue || `lender-${index}`;
                return (
                  <tr
                    key={rowKey}
                    className={isActive ? "management-row" : "management-row management-row--disabled"}
                  >
                  <td>
                    <button
                      type="button"
                      className="management-link"
                      onClick={() => lenderIdValue && setSelectedLenderId(lenderIdValue)}
                      disabled={!lenderIdValue}
                    >
                      {lenderName}
                    </button>
                  </td>
                  <td>
                    <span className={`status-pill status-pill--${isActive ? "active" : "paused"}`}>
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{lender.address?.country || "—"}</td>
                  <td>
                    <div className="text-sm font-semibold">{lender.primaryContact?.name || "—"}</div>
                    <div className="text-xs text-slate-500">{lender.primaryContact?.email || "—"}</div>
                  </td>
                  <td>{lender.submissionConfig?.method || "—"}</td>
                  <td>
                    <ActionGate
                      roles={["Admin"]}
                      fallback={
                        <Button type="button" variant="ghost" disabled>
                          {isActive ? "Deactivate" : "Activate"}
                        </Button>
                      }
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={!lenderIdValue || togglingLenderId === lenderIdValue}
                        onClick={() =>
                          lenderIdValue &&
                          toggleLenderStatusMutation.mutate({ id: lenderIdValue, active: !isActive })
                        }
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </ActionGate>
                    <ActionGate
                      roles={["Admin", "Staff"]}
                      fallback={
                        <Button type="button" variant="ghost" disabled>
                          Edit lender
                        </Button>
                      }
                    >
                      <Button type="button" variant="ghost" onClick={() => openEditLenderModal(lender)}>
                        Edit lender
                      </Button>
                    </ActionGate>
                  </td>
                </tr>
                );
              })}
              {!filteredLenders.length && (
                <tr>
                  <td colSpan={6}>
                    {statusFilter === "active"
                      ? "No active lenders."
                      : statusFilter === "inactive"
                        ? "No inactive lenders."
                        : "No lenders"}
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
          {selectedLender && !productsLoading && !productsError && (
            <Table headers={["Name", "Category", "Country", "Currency", "Status", "Amount range"]}>
              {safeProducts.map((product, index) => {
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
              {!safeProducts.length && (
                <tr>
                  <td colSpan={6}>No products for this lender.</td>
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
              <span className="management-field__label">Lender profile</span>
              <Input
                label="Name"
                value={lenderFormValues.name}
                onChange={(event) => setLenderFormValues((prev) => ({ ...prev, name: event.target.value }))}
                error={lenderFormErrors.name}
              />
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
              <Input
                label="Phone"
                value={lenderFormValues.phone}
                onChange={(event) => setLenderFormValues((prev) => ({ ...prev, phone: event.target.value }))}
                error={lenderFormErrors.phone}
              />
              <Input
                label="Website"
                value={lenderFormValues.website}
                onChange={(event) => setLenderFormValues((prev) => ({ ...prev, website: event.target.value }))}
              />
              <label className="ui-field">
                <span className="ui-field__label">Description</span>
                <textarea
                  className="ui-input ui-textarea"
                  value={lenderFormValues.description}
                  onChange={(event) =>
                    setLenderFormValues((prev) => ({ ...prev, description: event.target.value }))
                  }
                  rows={3}
                />
              </label>
            </div>

            <div className="management-field">
              <span className="management-field__label">Address</span>
              <Input
                label="Street"
                value={lenderFormValues.street}
                onChange={(event) => setLenderFormValues((prev) => ({ ...prev, street: event.target.value }))}
                error={lenderFormErrors.street}
              />
              <div className="management-grid__row">
                <Input
                  label="City"
                  value={lenderFormValues.city}
                  onChange={(event) => setLenderFormValues((prev) => ({ ...prev, city: event.target.value }))}
                  error={lenderFormErrors.city}
                />
                <Select
                  label="State / Province"
                  value={lenderFormValues.region}
                  onChange={(event) => setLenderFormValues((prev) => ({ ...prev, region: event.target.value }))}
                >
                  <option value="">
                    Select {lenderFormValues.country === "US" ? "state" : "province"}
                  </option>
                  {(lenderFormValues.country === "US" ? STATES : PROVINCES).map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </Select>
                {lenderFormErrors.region && <span className="ui-field__error">{lenderFormErrors.region}</span>}
              </div>
              <div className="management-grid__row">
                <Input
                  label="Postal code"
                  value={lenderFormValues.postalCode}
                  onChange={(event) =>
                    setLenderFormValues((prev) => ({ ...prev, postalCode: event.target.value }))
                  }
                  error={lenderFormErrors.postalCode}
                />
                <Select
                  label="Country"
                  value={lenderFormValues.country}
                  onChange={(event) =>
                    setLenderFormValues((prev) => ({
                      ...prev,
                      country: event.target.value,
                      region: prev.country === event.target.value ? prev.region : ""
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
              </div>
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
                {SUBMISSION_METHODS.map((method) => (
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
          selectedLender={selectedLender}
          isSaving={productMutationLoading}
          errorMessage={
            productMutationError ? getErrorMessage(productMutationError, "Unable to save product.") : null
          }
          isSelectedLenderInactive={isSelectedLenderInactive}
          formValues={productFormValues}
          formErrors={productFormErrors}
          categoryOptions={buildCategoryOptions(productFormValues.country)}
          rateTypes={RATE_TYPES}
          termUnits={TERM_UNITS}
          formatRateType={formatRateType}
          onChange={updateProductForm}
          onSubmit={() => {
            if (!canManageLenders) return;
            const errors = validateProductForm(productFormValues);
            setProductFormErrors(errors);
            if (Object.keys(errors).length) return;
            const payload = buildProductPayload(productFormValues);
            if (editingProduct) {
              if (!editingProduct.id) {
                setProductFormErrors({ productName: "Missing product id. Please refresh and try again." });
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
