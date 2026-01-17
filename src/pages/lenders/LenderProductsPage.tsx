import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import RequireRole from "@/components/auth/RequireRole";
import AppLoading from "@/components/layout/AppLoading";
import { getErrorMessage } from "@/utils/errors";
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
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  LENDER_PRODUCT_CATEGORIES,
  LENDER_PRODUCT_CATEGORY_LABELS,
  RATE_TYPES,
  TERM_UNITS,
  type DocumentType,
  type LenderProductCategory,
  type RateType,
  type TermUnit
} from "@/types/lenderManagement.types";

type ProductFormValues = {
  lenderId: string;
  productName: string;
  active: boolean;
  category: LenderProductCategory;
  country: string;
  currency: string;
  minAmount: string;
  maxAmount: string;
  interestRateMin: string;
  interestRateMax: string;
  rateType: RateType;
  termMin: string;
  termMax: string;
  termUnit: TermUnit;
  minimumCreditScore: string;
  ltv: string;
  eligibilityRules: string;
  minimumRevenue: string;
  timeInBusinessMonths: string;
  industryRestrictions: string;
  requiredDocuments: DocumentType[];
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
  industryRestrictions: "",
  requiredDocuments: []
});

const toggleDocument = (values: DocumentType[], doc: DocumentType) =>
  values.includes(doc) ? values.filter((item) => item !== doc) : [...values, doc];

const toOptionalNumber = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const formatRateType = (value: RateType) => value.charAt(0).toUpperCase() + value.slice(1);

const buildCategoryOptions = (country: string, currentCategory?: LenderProductCategory | null) => {
  const normalizedCountry = country.trim().toUpperCase();
  const isUs = normalizedCountry === "US";
  return LENDER_PRODUCT_CATEGORIES.map((category) => {
    if (category === "SBA_GOVERNMENT" && !isUs && currentCategory !== "SBA_GOVERNMENT") {
      return null;
    }
    const disabled =
      (category === "STARTUP_CAPITAL" && currentCategory !== "STARTUP_CAPITAL") ||
      (category === "SBA_GOVERNMENT" && !isUs);
    return {
      value: category,
      label: LENDER_PRODUCT_CATEGORY_LABELS[category],
      disabled
    };
  }).filter((option): option is { value: LenderProductCategory; label: string; disabled: boolean } => Boolean(option));
};

const LenderProductsContent = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [activeLenderId, setActiveLenderId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ProductFormValues>(emptyProductForm(""));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");

  const { data: lenders = [], isLoading: lendersLoading, error: lendersError } = useQuery<Lender[], Error>({
    queryKey: ["lenders"],
    queryFn: fetchLenders
  });

  useEffect(() => {
    if (!lenders.length) return;
    if (activeLenderId) return;
    const requestedLenderId = searchParams.get("lenderId");
    const match = lenders.find((lender) => lender.id === requestedLenderId);
    if (match) {
      setActiveLenderId(match.id);
      return;
    }
    setActiveLenderId(lenders[0].id);
  }, [activeLenderId, lenders, searchParams]);

  const activeLender = useMemo(
    () => lenders.find((lender) => lender.id === activeLenderId) ?? null,
    [activeLenderId, lenders]
  );

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError
  } = useQuery<LenderProduct[], Error>({
    queryKey: ["lenders", activeLenderId, "products"],
    queryFn: () => fetchLenderProducts(activeLenderId),
    enabled: Boolean(activeLenderId)
  });

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = categoryFilter === "all" || product.category === categoryFilter;
      const countryMatch = countryFilter === "all" || product.country === countryFilter;
      return categoryMatch && countryMatch;
    });
  }, [categoryFilter, countryFilter, products]);

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    products.forEach((product) => {
      if (product.country) countries.add(product.country);
    });
    return Array.from(countries).sort();
  }, [products]);

  useEffect(() => {
    if (!activeLenderId) return;
    if (selectedProduct) {
      setFormValues({
        lenderId: selectedProduct.lenderId,
        productName: selectedProduct.productName,
        active: selectedProduct.active,
        category: selectedProduct.category,
        country: selectedProduct.country,
        currency: selectedProduct.currency,
        minAmount: selectedProduct.minAmount.toString(),
        maxAmount: selectedProduct.maxAmount.toString(),
        interestRateMin: selectedProduct.interestRateMin.toString(),
        interestRateMax: selectedProduct.interestRateMax.toString(),
        rateType: selectedProduct.rateType,
        termMin: selectedProduct.termLength.min.toString(),
        termMax: selectedProduct.termLength.max.toString(),
        termUnit: selectedProduct.termLength.unit,
        minimumCreditScore: selectedProduct.minimumCreditScore?.toString() ?? "",
        ltv: selectedProduct.ltv?.toString() ?? "",
        eligibilityRules: selectedProduct.eligibilityRules ?? "",
        minimumRevenue: selectedProduct.eligibilityFlags.minimumRevenue?.toString() ?? "",
        timeInBusinessMonths: selectedProduct.eligibilityFlags.timeInBusinessMonths?.toString() ?? "",
        industryRestrictions: selectedProduct.eligibilityFlags.industryRestrictions ?? "",
        requiredDocuments: selectedProduct.requiredDocuments
      });
      setFormErrors({});
      return;
    }
    setFormValues(emptyProductForm(activeLenderId));
    setFormErrors({});
  }, [activeLenderId, selectedProduct]);

  const createMutation = useMutation({
    mutationFn: ({ lenderId, payload }: { lenderId: string; payload: LenderProductPayload }) =>
      createLenderProduct(lenderId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lenders", activeLenderId, "products"] });
      setSelectedProductId(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({
      lenderId,
      productId,
      payload
    }: {
      lenderId: string;
      productId: string;
      payload: Partial<LenderProductPayload>;
    }) => updateLenderProduct(lenderId, productId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lenders", activeLenderId, "products"] });
    }
  });

  const mutationError = createMutation.error ?? updateMutation.error;
  const mutationLoading = createMutation.isPending || updateMutation.isPending;

  const validateForm = (values: ProductFormValues) => {
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
    if (!values.requiredDocuments.length) errors.requiredDocuments = "Select at least one required document.";
    const normalizedCountry = values.country.trim().toUpperCase();
    if (values.category === "SBA_GOVERNMENT" && normalizedCountry !== "US") {
      errors.category = "SBA products must be limited to US lenders.";
    }
    if (!selectedProduct && values.category === "STARTUP_CAPITAL") {
      errors.category = "Startup capital is disabled for new products.";
    }
    return errors;
  };

  const buildPayload = (values: ProductFormValues): LenderProductPayload => ({
    lenderId: values.lenderId,
    productName: values.productName.trim(),
    active: values.active,
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
    },
    requiredDocuments: values.requiredDocuments
  });

  const categoryOptions = buildCategoryOptions(formValues.country, selectedProduct?.category ?? null);

  return (
    <div className="page">
      <Card title="Lender Products">
        {lendersLoading && <AppLoading />}
        {lendersError && (
          <p className="text-red-700">{getErrorMessage(lendersError, "Unable to load lenders.")}</p>
        )}
        {!lendersLoading && !lendersError && (
          <Select
            label="Filter by lender"
            value={activeLenderId}
            onChange={(event) => {
              setActiveLenderId(event.target.value);
              setSelectedProductId(null);
            }}
          >
            {lenders.map((lender) => (
              <option key={lender.id} value={lender.id}>
                {lender.name}
              </option>
            ))}
          </Select>
        )}
        {activeLender && (
          <div className="management-note">
            <span className={`status-pill status-pill--${activeLender.active ? "active" : "paused"}`}>
              {activeLender.active ? "Lender active" : "Lender inactive"}
            </span>
            <span>{activeLender.address.country}</span>
          </div>
        )}
      </Card>

      <div className="management-grid">
        <Card
          title="Products"
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!activeLenderId) return;
                setSelectedProductId(null);
                setFormValues(emptyProductForm(activeLenderId));
                setFormErrors({});
              }}
              disabled={!activeLenderId}
            >
              Add Product
            </Button>
          }
        >
          <div className="management-grid__row" style={{ marginBottom: 12 }}>
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All categories</option>
              {LENDER_PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {LENDER_PRODUCT_CATEGORY_LABELS[category]}
                </option>
              ))}
            </Select>
            <Select
              label="Country"
              value={countryFilter}
              onChange={(event) => setCountryFilter(event.target.value)}
            >
              <option value="all">All countries</option>
              {availableCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </div>
          {productsLoading && <AppLoading />}
          {productsError && (
            <p className="text-red-700">{getErrorMessage(productsError, "Unable to load products.")}</p>
          )}
          {!productsLoading && !productsError && activeLenderId && (
            <Table headers={["Name", "Category", "Country", "Currency", "Status", "Amount range"]}>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={product.active ? "management-row" : "management-row management-row--disabled"}
                >
                  <td>
                    <button
                      type="button"
                      className="management-link"
                      onClick={() => setSelectedProductId(product.id)}
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
                      <div className="text-xs text-slate-500">Admin only</div>
                    )}
                  </td>
                  <td>{product.country}</td>
                  <td>{product.currency}</td>
                  <td>
                    <span className={`status-pill status-pill--${product.active ? "active" : "paused"}`}>
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {!filteredProducts.length && (
                <tr>
                  <td colSpan={6}>No products for this lender.</td>
                </tr>
              )}
            </Table>
          )}
        </Card>

        <Card title={selectedProduct ? "Edit product" : "Create product"}>
          {mutationError && (
            <p className="text-red-700">{getErrorMessage(mutationError, "Unable to save product.")}</p>
          )}
          <form
            className="management-form"
            onSubmit={(event) => {
              event.preventDefault();
              const errors = validateForm(formValues);
              setFormErrors(errors);
              if (Object.keys(errors).length) return;
              if (!formValues.lenderId) return;
              const payload = buildPayload(formValues);
              if (selectedProduct) {
                updateMutation.mutate({
                  lenderId: selectedProduct.lenderId,
                  productId: selectedProduct.id,
                  payload
                });
                return;
              }
              createMutation.mutate({ lenderId: formValues.lenderId, payload });
            }}
          >
            <div className="management-field">
              <span className="management-field__label">Core details</span>
              <Select
                label="Lender"
                value={formValues.lenderId}
                onChange={(event) => {
                  const lenderId = event.target.value;
                  setFormValues((prev) => ({ ...prev, lenderId }));
                  if (!selectedProduct) {
                    setActiveLenderId(lenderId);
                  }
                }}
                disabled={Boolean(selectedProduct)}
              >
                <option value="">Select lender</option>
                {lenders.map((lender) => (
                  <option key={lender.id} value={lender.id}>
                    {lender.name}
                  </option>
                ))}
              </Select>
              {formErrors.lenderId && <span className="ui-field__error">{formErrors.lenderId}</span>}
              <Input
                label="Product name"
                value={formValues.productName}
                onChange={(event) => setFormValues((prev) => ({ ...prev, productName: event.target.value }))}
                error={formErrors.productName}
              />
              <label className="management-toggle">
                <input
                  type="checkbox"
                  checked={formValues.active}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, active: event.target.checked }))}
                />
                <span>Active product</span>
              </label>
              <Select
                label="Product category"
                value={formValues.category}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, category: event.target.value as LenderProductCategory }))
                }
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {formErrors.category && <span className="ui-field__error">{formErrors.category}</span>}
              <div className="management-grid__row">
                <Input
                  label="Country"
                  value={formValues.country}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, country: event.target.value }))}
                  error={formErrors.country}
                />
                <Input
                  label="Currency"
                  value={formValues.currency}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, currency: event.target.value }))}
                  error={formErrors.currency}
                />
              </div>
              {formValues.category === "SBA_GOVERNMENT" && (
                <div className="text-xs text-slate-500">Government Program (US only)</div>
              )}
              {formValues.category === "STARTUP_CAPITAL" && (
                <div className="text-xs text-slate-500">Startup capital is admin-visible only.</div>
              )}
            </div>

            <div className="management-field">
              <span className="management-field__label">Amount & pricing</span>
              <div className="management-grid__row">
                <Input
                  label="Minimum amount"
                  value={formValues.minAmount}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, minAmount: event.target.value }))}
                  error={formErrors.minAmount}
                />
                <Input
                  label="Maximum amount"
                  value={formValues.maxAmount}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, maxAmount: event.target.value }))}
                  error={formErrors.maxAmount}
                />
              </div>
              <div className="management-grid__row">
                <Input
                  label="Interest rate min (%)"
                  value={formValues.interestRateMin}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, interestRateMin: event.target.value }))
                  }
                  error={formErrors.interestRateMin}
                />
                <Input
                  label="Interest rate max (%)"
                  value={formValues.interestRateMax}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, interestRateMax: event.target.value }))
                  }
                  error={formErrors.interestRateMax}
                />
              </div>
              <Select
                label="Rate type"
                value={formValues.rateType}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, rateType: event.target.value as RateType }))
                }
              >
                {RATE_TYPES.map((rateType) => (
                  <option key={rateType} value={rateType}>
                    {formatRateType(rateType)}
                  </option>
                ))}
              </Select>
              {formErrors.rateType && <span className="ui-field__error">{formErrors.rateType}</span>}
              <div className="management-grid__row">
                <Input
                  label="Term length min"
                  value={formValues.termMin}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, termMin: event.target.value }))}
                  error={formErrors.termMin}
                />
                <Input
                  label="Term length max"
                  value={formValues.termMax}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, termMax: event.target.value }))}
                  error={formErrors.termMax}
                />
              </div>
              <Select
                label="Term unit"
                value={formValues.termUnit}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, termUnit: event.target.value as TermUnit }))
                }
              >
                {TERM_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </Select>
              <div className="management-grid__row">
                <Input
                  label="Minimum credit score"
                  value={formValues.minimumCreditScore}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, minimumCreditScore: event.target.value }))
                  }
                  error={formErrors.minimumCreditScore}
                />
                <Input
                  label="LTV (%)"
                  value={formValues.ltv}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, ltv: event.target.value }))}
                  error={formErrors.ltv}
                />
              </div>
            </div>

            <div className="management-field">
              <span className="management-field__label">Eligibility requirements</span>
              <label className="ui-field">
                <span className="ui-field__label">Eligibility rules</span>
                <textarea
                  className="ui-input ui-textarea"
                  value={formValues.eligibilityRules}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, eligibilityRules: event.target.value }))
                  }
                  rows={3}
                />
              </label>
              <div className="management-grid__row">
                <Input
                  label="Minimum revenue"
                  value={formValues.minimumRevenue}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, minimumRevenue: event.target.value }))
                  }
                  error={formErrors.minimumRevenue}
                />
                <Input
                  label="Time in business (months)"
                  value={formValues.timeInBusinessMonths}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, timeInBusinessMonths: event.target.value }))
                  }
                  error={formErrors.timeInBusinessMonths}
                />
              </div>
              <label className="ui-field">
                <span className="ui-field__label">Industry restrictions</span>
                <textarea
                  className="ui-input ui-textarea"
                  value={formValues.industryRestrictions}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, industryRestrictions: event.target.value }))
                  }
                  rows={2}
                />
              </label>
            </div>

            <div className="management-field">
              <span className="management-field__label">Required documents</span>
              <div className="management-checkbox-grid">
                {DOCUMENT_TYPES.map((doc) => (
                  <label key={doc} className="management-checkbox">
                    <input
                      type="checkbox"
                      checked={formValues.requiredDocuments.includes(doc)}
                      onChange={() =>
                        setFormValues((prev) => ({
                          ...prev,
                          requiredDocuments: toggleDocument(prev.requiredDocuments, doc)
                        }))
                      }
                    />
                    <span>{DOCUMENT_TYPE_LABELS[doc]}</span>
                  </label>
                ))}
              </div>
              {formErrors.requiredDocuments && (
                <span className="ui-field__error">{formErrors.requiredDocuments}</span>
              )}
            </div>

            <div className="management-actions">
              <Button type="submit" disabled={mutationLoading || !formValues.lenderId}>
                {selectedProduct ? "Save changes" : "Create product"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

const LenderProductsPage = () => (
  <RequireRole roles={["Admin", "Staff"]}>
    <LenderProductsContent />
  </RequireRole>
);

export default LenderProductsPage;
