import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import type { LenderProductCategory, RateType } from "@/types/lenderManagement.types";

export type ProductFormValues = {
  lenderId: string;
  category: LenderProductCategory;
  country: string;
  minAmount: string;
  maxAmount: string;
  rateType: RateType;
  fixedRate: string;
  primeRate: string;
  rateSpread: string;
  termMonths: string;
  requiredDocuments: string[];
  active: boolean;
};

type LenderProductModalProps = {
  isOpen: boolean;
  title: string;
  isSaving: boolean;
  isSubmitDisabled?: boolean;
  errorMessage?: string | null;
  formValues: ProductFormValues;
  formErrors: Record<string, string>;
  lenderOptions: Array<{ value: string; label: string }>;
  isSelectedLenderInactive: boolean;
  categoryOptions: Array<{ value: LenderProductCategory; label: string; disabled?: boolean }>;
  rateTypes: RateType[];
  documentOptions: Array<{ value: string; label: string; locked?: boolean }>;
  formatRateType: (value: RateType) => string;
  onChange: (updates: Partial<ProductFormValues>) => void;
  onSubmit: () => void;
  onClose: () => void;
  onCancel: () => void;
  statusNote?: ReactNode;
};

const LenderProductModal = ({
  isOpen,
  title,
  isSaving,
  isSubmitDisabled = false,
  errorMessage,
  isSelectedLenderInactive,
  formValues,
  formErrors,
  lenderOptions,
  categoryOptions,
  rateTypes,
  documentOptions,
  formatRateType,
  onChange,
  onSubmit,
  onClose,
  onCancel,
  statusNote
}: LenderProductModalProps) => {
  if (!isOpen) return null;

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
          <Select
            label="Lender"
            value={formValues.lenderId}
            onChange={(event) => onChange({ lenderId: event.target.value })}
          >
            <option value="">Select lender</option>
            {lenderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {formErrors.lenderId && <span className="ui-field__error">{formErrors.lenderId}</span>}
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
            <Select
              label="Country"
              value={formValues.country}
              onChange={(event) => onChange({ country: event.target.value })}
            >
              <option value="">Select country</option>
              <option value="CA">CA</option>
              <option value="US">US</option>
              <option value="BOTH">Both</option>
            </Select>
          </div>
          {formErrors.country && <span className="ui-field__error">{formErrors.country}</span>}
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
          <span className="management-field__label">Amount</span>
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
        </div>

        <div className="management-field">
          <span className="management-field__label">Pricing &amp; terms</span>
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
          {formValues.rateType === "variable" ? (
            <div className="management-grid__row">
              <Input
                label="Prime rate (%)"
                value={formValues.primeRate}
                onChange={(event) => onChange({ primeRate: event.target.value })}
                error={formErrors.primeRate}
              />
              <Input
                label="+ Spread (%)"
                value={formValues.rateSpread}
                onChange={(event) => onChange({ rateSpread: event.target.value })}
                error={formErrors.rateSpread}
              />
            </div>
          ) : (
            <Input
              label="Fixed rate (%)"
              value={formValues.fixedRate}
              onChange={(event) => onChange({ fixedRate: event.target.value })}
              error={formErrors.fixedRate}
            />
          )}
          <div className="management-grid__row">
            <Input
              label="Term (months)"
              value={formValues.termMonths}
              onChange={(event) => onChange({ termMonths: event.target.value })}
              error={formErrors.termMonths}
            />
          </div>
        </div>

        <div className="management-field">
          <span className="management-field__label">Required documents</span>
          <div className="management-docs">
            {documentOptions.map((doc) => {
              const checked = formValues.requiredDocuments.includes(doc.value);
              return (
                <label key={doc.value} className="management-toggle">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      if (doc.locked) return;
                      const next = event.target.checked
                        ? [...formValues.requiredDocuments, doc.value]
                        : formValues.requiredDocuments.filter((value) => value !== doc.value);
                      onChange({ requiredDocuments: next });
                    }}
                    disabled={doc.locked}
                  />
                  <span>{doc.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="management-actions">
          <Button type="submit" disabled={isSaving || isSubmitDisabled}>
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
