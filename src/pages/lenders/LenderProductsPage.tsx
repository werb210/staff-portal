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
  PRODUCT_TYPES,
  type DocumentType,
  type LenderStatus,
  type ProductType
} from "@/types/lenderManagement.types";

type ProductFormValues = {
  lenderId: string;
  status: LenderStatus;
  productType: ProductType;
  name: string;
  minAmount: string;
  maxAmount: string;
  rateRange: string;
  feeStructure: string;
  eligibilityRules: string;
  rankingScore: string;
  clientVisible: boolean;
  requiredDocuments: DocumentType[];
  optionalDocuments: DocumentType[];
  conditionalRules: string;
};

const emptyProductForm = (lenderId: string): ProductFormValues => ({
  lenderId,
  status: "active",
  productType: PRODUCT_TYPES[0],
  name: "",
  minAmount: "",
  maxAmount: "",
  rateRange: "",
  feeStructure: "",
  eligibilityRules: "",
  rankingScore: "",
  clientVisible: true,
  requiredDocuments: [],
  optionalDocuments: [],
  conditionalRules: ""
});

const toggleDocument = (values: DocumentType[], doc: DocumentType) =>
  values.includes(doc) ? values.filter((item) => item !== doc) : [...values, doc];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseJsonField = (value: string): { value: Record<string, unknown> | null; error?: string } => {
  if (!value.trim()) return { value: null };
  try {
    const parsed: unknown = JSON.parse(value);
    if (isRecord(parsed)) {
      return { value: parsed };
    }
    return { value: null, error: "JSON must be an object." };
  } catch {
    return { value: null, error: "Invalid JSON." };
  }
};

const toLenderStatus = (value: string): LenderStatus => (value === "paused" ? "paused" : "active");

const toProductType = (value: string): ProductType =>
  PRODUCT_TYPES.find((type) => type === value) ?? PRODUCT_TYPES[0];

const LenderProductsContent = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [activeLenderId, setActiveLenderId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ProductFormValues>(emptyProductForm(""));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    if (!activeLenderId) return;
    if (selectedProduct) {
      setFormValues({
        lenderId: activeLenderId,
        status: selectedProduct.status,
        productType: selectedProduct.productType,
        name: selectedProduct.name,
        minAmount: String(selectedProduct.minAmount),
        maxAmount: String(selectedProduct.maxAmount),
        rateRange: selectedProduct.rateRange,
        feeStructure: selectedProduct.feeStructure,
        eligibilityRules: selectedProduct.eligibilityRules ? JSON.stringify(selectedProduct.eligibilityRules, null, 2) : "",
        rankingScore: String(selectedProduct.rankingScore),
        clientVisible: selectedProduct.clientVisible,
        requiredDocuments: selectedProduct.requiredDocuments,
        optionalDocuments: selectedProduct.optionalDocuments,
        conditionalRules: selectedProduct.conditionalRules ? JSON.stringify(selectedProduct.conditionalRules, null, 2) : ""
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
    if (!values.name.trim()) errors.name = "Product name is required.";
    if (!values.productType) errors.productType = "Product type is required.";
    if (!values.minAmount) errors.minAmount = "Minimum amount is required.";
    if (!values.maxAmount) errors.maxAmount = "Maximum amount is required.";
    const minAmount = Number(values.minAmount);
    const maxAmount = Number(values.maxAmount);
    if (Number.isNaN(minAmount)) errors.minAmount = "Minimum amount must be a number.";
    if (Number.isNaN(maxAmount)) errors.maxAmount = "Maximum amount must be a number.";
    if (!Number.isNaN(minAmount) && !Number.isNaN(maxAmount) && minAmount > maxAmount) {
      errors.maxAmount = "Maximum amount must be greater than minimum.";
    }
    if (!values.rateRange.trim()) errors.rateRange = "Rate range is required.";
    if (!values.feeStructure.trim()) errors.feeStructure = "Fee structure is required.";
    if (!values.rankingScore) errors.rankingScore = "Ranking score is required.";
    const rankingScore = Number(values.rankingScore);
    if (Number.isNaN(rankingScore)) errors.rankingScore = "Ranking score must be a number.";
    if (!values.requiredDocuments.length) errors.requiredDocuments = "Select at least one required document.";
    const eligibility = parseJsonField(values.eligibilityRules);
    if (eligibility.error) errors.eligibilityRules = eligibility.error;
    const conditional = parseJsonField(values.conditionalRules);
    if (conditional.error) errors.conditionalRules = conditional.error;
    return errors;
  };

  const buildPayload = (values: ProductFormValues): LenderProductPayload => ({
    status: values.status,
    productType: values.productType,
    name: values.name.trim(),
    minAmount: Number(values.minAmount),
    maxAmount: Number(values.maxAmount),
    rateRange: values.rateRange.trim(),
    feeStructure: values.feeStructure.trim(),
    eligibilityRules: parseJsonField(values.eligibilityRules).value,
    rankingScore: Number(values.rankingScore),
    clientVisible: values.clientVisible,
    requiredDocuments: values.requiredDocuments,
    optionalDocuments: values.optionalDocuments,
    conditionalRules: parseJsonField(values.conditionalRules).value
  });

  return (
    <div className="page">
      <Card title="Lender Products">
        {lendersLoading && <AppLoading />}
        {lendersError && (
          <p className="text-red-700">{getErrorMessage(lendersError, "Unable to load lenders.")}</p>
        )}
        {!lendersLoading && !lendersError && (
          <Select
            label="Select lender"
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
            <span className={`status-pill status-pill--${activeLender.status}`}>
              {activeLender.status === "paused" ? "Lender paused" : "Lender active"}
            </span>
            <span>{activeLender.clientVisible ? "Client-visible lender" : "Hidden from clients"}</span>
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
          {productsLoading && <AppLoading />}
          {productsError && (
            <p className="text-red-700">{getErrorMessage(productsError, "Unable to load products.")}</p>
          )}
          {!productsLoading && !productsError && activeLenderId && (
            <Table headers={["Name", "Type", "Status", "Client visible", "Amount range"]}>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className={
                    product.status === "paused" ? "management-row management-row--disabled" : "management-row"
                  }
                >
                  <td>
                    <button
                      type="button"
                      className="management-link"
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      {product.name}
                    </button>
                  </td>
                  <td>{product.productType}</td>
                  <td>
                    <span className={`status-pill status-pill--${product.status}`}>
                      {product.status === "paused" ? "Paused" : "Active"}
                    </span>
                  </td>
                  <td>{product.clientVisible ? "Visible" : "Hidden"}</td>
                  <td>
                    ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {!products.length && (
                <tr>
                  <td colSpan={5}>No products for this lender.</td>
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
              if (!activeLenderId) return;
              const payload = buildPayload(formValues);
              if (selectedProduct) {
                updateMutation.mutate({ lenderId: activeLenderId, productId: selectedProduct.id, payload });
                return;
              }
              createMutation.mutate({ lenderId: activeLenderId, payload });
            }}
          >
            <Select
              label="Product type"
              value={formValues.productType}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, productType: toProductType(event.target.value) }))
              }
            >
              {PRODUCT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            {formErrors.productType && <span className="ui-field__error">{formErrors.productType}</span>}
            <Input
              label="Product name"
              value={formValues.name}
              onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              error={formErrors.name}
            />
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
            <Input
              label="Rate range"
              value={formValues.rateRange}
              onChange={(event) => setFormValues((prev) => ({ ...prev, rateRange: event.target.value }))}
              error={formErrors.rateRange}
            />
            <Input
              label="Fee structure"
              value={formValues.feeStructure}
              onChange={(event) => setFormValues((prev) => ({ ...prev, feeStructure: event.target.value }))}
              error={formErrors.feeStructure}
            />
            <Input
              label="Ranking score"
              value={formValues.rankingScore}
              onChange={(event) => setFormValues((prev) => ({ ...prev, rankingScore: event.target.value }))}
              error={formErrors.rankingScore}
            />
            <label className="ui-field">
              <span className="ui-field__label">Eligibility rules (JSON)</span>
              <textarea
                className="ui-input ui-textarea"
                value={formValues.eligibilityRules}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, eligibilityRules: event.target.value }))
                }
                rows={4}
              />
              {formErrors.eligibilityRules && <span className="ui-field__error">{formErrors.eligibilityRules}</span>}
            </label>
            <div className="management-field">
              <span className="management-field__label">Document rules</span>
              <div className="management-docs">
                <div>
                  <span className="management-docs__title">Required documents</span>
                  <div className="management-checkbox-grid">
                    {DOCUMENT_TYPES.map((doc) => (
                      <label key={`required-${doc}`} className="management-checkbox">
                        <input
                          type="checkbox"
                          checked={formValues.requiredDocuments.includes(doc)}
                          onChange={() =>
                            setFormValues((prev) => ({
                              ...prev,
                              requiredDocuments: toggleDocument(prev.requiredDocuments, doc),
                              optionalDocuments: prev.optionalDocuments.filter((item) => item !== doc)
                            }))
                          }
                        />
                        <span>{doc}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.requiredDocuments && (
                    <span className="ui-field__error">{formErrors.requiredDocuments}</span>
                  )}
                </div>
                <div>
                  <span className="management-docs__title">Optional documents</span>
                  <div className="management-checkbox-grid">
                    {DOCUMENT_TYPES.map((doc) => (
                      <label key={`optional-${doc}`} className="management-checkbox">
                        <input
                          type="checkbox"
                          checked={formValues.optionalDocuments.includes(doc)}
                          disabled={formValues.requiredDocuments.includes(doc)}
                          onChange={() =>
                            setFormValues((prev) => ({
                              ...prev,
                              optionalDocuments: toggleDocument(prev.optionalDocuments, doc)
                            }))
                          }
                        />
                        <span>{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <label className="ui-field">
              <span className="ui-field__label">Conditional rules (JSON)</span>
              <textarea
                className="ui-input ui-textarea"
                value={formValues.conditionalRules}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, conditionalRules: event.target.value }))
                }
                rows={4}
              />
              {formErrors.conditionalRules && <span className="ui-field__error">{formErrors.conditionalRules}</span>}
            </label>
            <Select
              label="Status"
              value={formValues.status}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, status: toLenderStatus(event.target.value) }))
              }
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </Select>
            <label className="management-toggle">
              <input
                type="checkbox"
                checked={formValues.clientVisible}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, clientVisible: event.target.checked }))
                }
              />
              <span>Client-visible product</span>
            </label>
            <div className="management-actions">
              {selectedProduct && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (!activeLenderId) return;
                    updateMutation.mutate({
                      lenderId: activeLenderId,
                      productId: selectedProduct.id,
                      payload: { status: selectedProduct.status === "active" ? "paused" : "active" }
                    });
                  }}
                  disabled={mutationLoading}
                >
                  {selectedProduct.status === "active" ? "Disable product" : "Enable product"}
                </Button>
              )}
              <Button type="submit" disabled={mutationLoading || !activeLenderId}>
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
