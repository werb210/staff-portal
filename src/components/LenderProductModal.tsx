import { useMemo, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import type { Lender, ProductDocumentRequirement } from "@/types/lenderManagement.models";
import type {
  LenderProductCategory,
  RateType,
  TermUnit
} from "@/types/lenderManagement.types";

export type ProductFormValues = {
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
};

type LenderProductModalProps = {
  isOpen: boolean;
  title: string;
  selectedLender: Lender;
  isSaving: boolean;
  errorMessage?: string | null;
  isSelectedLenderInactive: boolean;
  formValues: ProductFormValues;
  formErrors: Record<string, string>;
  categoryOptions: Array<{ value: LenderProductCategory; label: string; disabled?: boolean }>;
  rateTypes: RateType[];
  termUnits: TermUnit[];
  formatRateType: (value: RateType) => string;
  onChange: (updates: Partial<ProductFormValues>) => void;
  onSubmit: () => void;
  onClose: () => void;
  onCancel: () => void;
  requiredDocuments?: ProductDocumentRequirement[];
  statusNote?: ReactNode;
};

const LenderProductModal = ({
  isOpen,
  title,
  selectedLender,
  isSaving,
  errorMessage,
  isSelectedLenderInactive,
  formValues,
  formErrors,
  categoryOptions,
  rateTypes,
  termUnits,
  formatRateType,
  onChange,
  onSubmit,
  onClose,
  onCancel,
  requiredDocuments = [],
  statusNote
}: LenderProductModalProps) => {
  if (!isOpen) return null;

  const submissionConfig = selectedLender.submissionConfig;
  const normalizedDocuments = useMemo(() => {
    const unique = new Map<string, ProductDocumentRequirement>();
    requiredDocuments.forEach((doc) => {
      if (!doc) return;
      const categoryName = doc.category?.trim() || "Other";
      const key = categoryName.toLowerCase();
      const existing = unique.get(key);
      if (!existing) {
        unique.set(key, {
          ...doc,
          category: categoryName,
          required: Boolean(doc.required),
          description: doc.description ?? ""
        });
        return;
      }
      if (doc.required) {
        existing.required = true;
      }
      if (!existing.description && doc.description) {
        existing.description = doc.description;
      }
    });
    return Array.from(unique.values()).sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1;
      return a.category.localeCompare(b.category);
    });
  }, [requiredDocuments]);

  return (
    <Modal title={title} onClose={onClose}>
      {errorMessage && <ErrorBanner message={errorMessage} />}
      {statusNote}
      <form
        className="management-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="management-field">
          <span className="management-field__label">Core details</span>
          <Select label="Lender" value={formValues.lenderId} onChange={() => {}} disabled>
            <option value={selectedLender.id}>{selectedLender.name}</option>
          </Select>
          {formErrors.lenderId && <span className="ui-field__error">{formErrors.lenderId}</span>}
          <Input
            label="Product name"
            value={formValues.productName}
            onChange={(event) => onChange({ productName: event.target.value })}
            error={formErrors.productName}
          />
          <label className="management-toggle">
            <input
              type="checkbox"
              checked={formValues.active}
              onChange={(event) => onChange({ active: event.target.checked })}
              disabled={formValues.category === "STARTUP_CAPITAL" || isSelectedLenderInactive}
            />
            <span>Active product</span>
          </label>
          {formErrors.active && <span className="ui-field__error">{formErrors.active}</span>}
          <Select
            label="Product category"
            value={formValues.category}
            onChange={(event) =>
              onChange({ category: event.target.value as LenderProductCategory })
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
              onChange={(event) => onChange({ country: event.target.value })}
              error={formErrors.country}
            />
            <Input
              label="Currency"
              value={formValues.currency}
              onChange={(event) => onChange({ currency: event.target.value })}
              error={formErrors.currency}
            />
          </div>
          {formValues.category === "SBA_GOVERNMENT" && (
            <div className="text-xs text-slate-500">Government Program (US only)</div>
          )}
          {formValues.category === "STARTUP_CAPITAL" && (
            <div className="text-xs text-amber-600">
              Not Live — startup capital products remain inactive and internal-only.
            </div>
          )}
        </div>

        <div className="management-field">
          <span className="management-field__label">Amount &amp; limits</span>
          <div className="management-grid__row">
            <Input
              label="Minimum amount"
              value={formValues.minAmount}
              onChange={(event) => onChange({ minAmount: event.target.value })}
              error={formErrors.minAmount}
            />
            <Input
              label="Maximum amount"
              value={formValues.maxAmount}
              onChange={(event) => onChange({ maxAmount: event.target.value })}
              error={formErrors.maxAmount}
            />
          </div>
          <div className="management-grid__row">
            <Input
              label="Minimum credit score"
              value={formValues.minimumCreditScore}
              onChange={(event) => onChange({ minimumCreditScore: event.target.value })}
              error={formErrors.minimumCreditScore}
            />
            <Input
              label="LTV (%)"
              value={formValues.ltv}
              onChange={(event) => onChange({ ltv: event.target.value })}
              error={formErrors.ltv}
            />
          </div>
        </div>

        <div className="management-field">
          <span className="management-field__label">Pricing &amp; terms</span>
          <div className="management-grid__row">
            <Input
              label="Interest rate min (%)"
              value={formValues.interestRateMin}
              onChange={(event) => onChange({ interestRateMin: event.target.value })}
              error={formErrors.interestRateMin}
            />
            <Input
              label="Interest rate max (%)"
              value={formValues.interestRateMax}
              onChange={(event) => onChange({ interestRateMax: event.target.value })}
              error={formErrors.interestRateMax}
            />
          </div>
          <Select
            label="Rate type"
            value={formValues.rateType}
            onChange={(event) => onChange({ rateType: event.target.value as RateType })}
          >
            {rateTypes.map((rateType) => (
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
              onChange={(event) => onChange({ termMin: event.target.value })}
              error={formErrors.termMin}
            />
            <Input
              label="Term length max"
              value={formValues.termMax}
              onChange={(event) => onChange({ termMax: event.target.value })}
              error={formErrors.termMax}
            />
          </div>
          <Select
            label="Term unit"
            value={formValues.termUnit}
            onChange={(event) => onChange({ termUnit: event.target.value as TermUnit })}
          >
            {termUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
        </div>

        <div className="management-field">
          <span className="management-field__label">Eligibility</span>
          <label className="ui-field">
            <span className="ui-field__label">Eligibility rules</span>
            <textarea
              className="ui-input ui-textarea"
              value={formValues.eligibilityRules}
              onChange={(event) => onChange({ eligibilityRules: event.target.value })}
              rows={3}
            />
          </label>
          <div className="management-grid__row">
            <Input
              label="Minimum revenue"
              value={formValues.minimumRevenue}
              onChange={(event) => onChange({ minimumRevenue: event.target.value })}
              error={formErrors.minimumRevenue}
            />
            <Input
              label="Time in business (months)"
              value={formValues.timeInBusinessMonths}
              onChange={(event) => onChange({ timeInBusinessMonths: event.target.value })}
              error={formErrors.timeInBusinessMonths}
            />
          </div>
          <label className="ui-field">
            <span className="ui-field__label">Industry restrictions</span>
            <textarea
              className="ui-input ui-textarea"
              value={formValues.industryRestrictions}
              onChange={(event) => onChange({ industryRestrictions: event.target.value })}
              rows={2}
            />
          </label>
        </div>

        <div className="management-field">
          <span className="management-field__label">Required docs</span>
          {normalizedDocuments.length ? (
            <div className="management-docs">
              {normalizedDocuments.map((doc) => (
                <div key={doc.category}>
                  <span className="management-docs__title">{doc.category}</span>
                  <p className="text-xs text-slate-500">
                    {doc.required ? "Required" : "Optional"}
                    {doc.description ? ` • ${doc.description}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No document requirements have been configured.</p>
          )}
        </div>

        <div className="management-field">
          <span className="management-field__label">Submission config</span>
          <div className="management-grid__row">
            <Input label="Method" value={submissionConfig?.method ?? "MANUAL"} disabled />
            <Input
              label="Submission email"
              value={submissionConfig?.submissionEmail ?? ""}
              disabled
            />
          </div>
        </div>

        <div className="management-actions">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save product"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LenderProductModal;
