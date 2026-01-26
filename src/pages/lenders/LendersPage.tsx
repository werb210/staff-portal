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

  const { data: lenders = [], isLoading, error } = useQuery<Lender[], Error>({
    queryKey: ["lenders"],
    queryFn: ({ signal }) => fetchLenders({ signal })
  });

  const [selectedLenderId, setSelectedLenderId] = useState<string | null>(null);
  const [isLenderModalOpen, setIsLenderModalOpen] = useState(false);
  const [editingLender, setEditingLender] = useState<Lender | null>(null);
  const [lenderFormValues, setLenderFormValues] = useState<LenderFormValues>(emptyLenderForm);
  const [lenderFormErrors, setLenderFormErrors] = useState<Record<string, string>>({});

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LenderProduct | null>(null);
  const [productFormValues, setProductFormValues] = useState<ProductFormValues>(emptyProductForm(""));
  const [productFormErrors, setProductFormErrors] = useState<Record<string, string>>({});

  const selectedLender = useMemo(
    () => lenders.find((lender) => lender.id === selectedLenderId) ?? null,
    [lenders, selectedLenderId]
  );

  const isSelectedLenderInactive = Boolean(selectedLender && !selectedLender.active);

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError
  } = useQuery<LenderProduct[], Error>({
    queryKey: ["lender-products", selectedLenderId ?? "none"],
    queryFn: () => fetchLenderProducts(selectedLenderId ?? ""),
    enabled: Boolean(selectedLenderId),
    placeholderData: (previousData) => previousData ?? []
  });

  useEffect(() => {
    if (isNewRoute) {
      setEditingLender(null);
      setLenderFormValues(emptyLenderForm);
      setLenderFormErrors({});
      setIsLenderModalOpen(true);
      return;
    }
    if (!lenderId) return;
    const matching = lenders.find((lender) => lender.id === lenderId);
    if (!matching) return;
    setSelectedLenderId(matching.id);
    setEditingLender(matching);
    setIsLenderModalOpen(true);
  }, [isNewRoute, lenderId, lenders]);

  useEffect(() => {
    if (selectedLenderId) return;
    if (lenders.length) {
      setSelectedLenderId(lenders[0].id);
    }
  }, [lenders, selectedLenderId]);

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
    if (!selectedLender) return;
    setEditingProduct(null);
    setProductFormValues(emptyProductForm(selectedLender.id));
    setProductFormErrors({});
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: LenderProduct) => {
    const eligibilityFlags = product.eligibilityFlags ?? {
      minimumRevenue: null,
      timeInBusinessMonths: null,
      industryRestrictions: null
    };
    setEditingProduct(product);
    setProductFormValues({
      lenderId: product.lenderId,
      productName: product.productName,
      active: product.category === "STARTUP_CAPITAL" || isSelectedLenderInactive ? false : product.active,
      category: product.category,
      country: product.country,
      currency: product.currency,
      minAmount: product.minAmount.toString(),
      maxAmount: product.maxAmount.toString(),
      interestRateMin: product.interestRateMin.toString(),
      interestRateMax: product.interestRateMax.toString(),
      rateType: product.rateType,
      termMin: product.termLength.min.toString(),
      termMax: product.termLength.max.toString(),
      termUnit: product.termLength.unit,
      minimumCreditScore: product.minimumCreditScore?.toString() ?? "",
      ltv: product.ltv?.toString() ?? "",
      eligibilityRules: product.eligibilityRules ?? "",
      minimumRevenue: eligibilityFlags.minimumRevenue?.toString() ?? "",
      timeInBusinessMonths: eligibilityFlags.timeInBusinessMonths?.toString() ?? "",
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
      emitUiTelemetry("data_loaded", { view: "lenders", count: lenders.length });
    }
  }, [error, isLoading, lenders.length]);

  return (
    <div className="page">
      <div className="management-grid">
        <Card
          title="Lenders"
          actions={
            <Button type="button" variant="secondary" onClick={openCreateLenderModal}>
              Create lender
            </Button>
          }
        >
          {isLoading && <AppLoading />}
          {error && <ErrorBanner message={getErrorMessage(error, "Unable to load lenders.")} />}
          {!isLoading && !error && (
            <Table headers={["Name", "Status", "Country", "Primary contact", "Submission", "Actions"]}>
              {lenders.map((lender) => (
                <tr
                  key={lender.id}
                  className={lender.active ? "management-row" : "management-row management-row--disabled"}
                >
                  <td>
                    <button
                      type="button"
                      className="management-link"
                      onClick={() => setSelectedLenderId(lender.id)}
                    >
                      {lender.name}
                    </button>
                  </td>
                  <td>
                    <span className={`status-pill status-pill--${lender.active ? "active" : "paused"}`}>
                      {lender.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{lender.address?.country || "—"}</td>
                  <td>
                    <div className="text-sm font-semibold">{lender.primaryContact?.name || "—"}</div>
                    <div className="text-xs text-slate-500">{lender.primaryContact?.email || "—"}</div>
                  </td>
                  <td>{lender.submissionConfig?.method || "—"}</td>
                  <td>
                    <Button type="button" variant="ghost" onClick={() => openEditLenderModal(lender)}>
                      Edit lender
                    </Button>
                  </td>
                </tr>
              ))}
              {!lenders.length && (
                <tr>
                  <td colSpan={6}>No lenders</td>
                </tr>
              )}
            </Table>
          )}
        </Card>

        <Card
          title="Products"
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={openCreateProductModal}
              disabled={!selectedLender || isSelectedLenderInactive}
            >
              Add product
            </Button>
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
          {productsError && <ErrorBanner message={getErrorMessage(productsError, "Unable to load products.")} />}
          {selectedLender && !productsLoading && !productsError && (
            <Table headers={["Name", "Category", "Country", "Currency", "Status", "Amount range"]}>
              {products.map((product) => {
                const productActive = product.category === "STARTUP_CAPITAL" ? false : product.active;
                return (
                  <tr
                    key={product.id}
                    className={productActive ? "management-row" : "management-row management-row--disabled"}
                  >
                    <td>
                      <button
                        type="button"
                        className="management-link"
                        onClick={() => openEditProductModal(product)}
                      >
                        {product.productName}
                      </button>
                    </td>
                    <td>
                      <div className="text-sm font-semibold">
                        {LENDER_PRODUCT_CATEGORY_LABELS[product.category]}
                      </div>
                      {product.category === "SBA_GOVERNMENT" && (
                        <div className="text-xs text-slate-500">Government Program</div>
                      )}
                      {product.category === "STARTUP_CAPITAL" && (
                        <div className="text-xs text-amber-600">Not Live</div>
                      )}
                    </td>
                    <td>{product.country}</td>
                    <td>{product.currency}</td>
                    <td>
                      <span className={`status-pill status-pill--${productActive ? "active" : "paused"}`}>
                        {productActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {!products.length && (
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
              const nextErrors = validateLenderForm(lenderFormValues);
              setLenderFormErrors(nextErrors);
              if (Object.keys(nextErrors).length) return;
              if (editingLender) {
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
            const errors = validateProductForm(productFormValues);
            setProductFormErrors(errors);
            if (Object.keys(errors).length) return;
            const payload = buildProductPayload(productFormValues);
            if (editingProduct) {
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
    <LendersContent />
  </RequireRole>
);

export default LendersPage;
