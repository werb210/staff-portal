import type { PropsWithChildren, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hideLabel?: boolean;
  options?: { value: string; label: string }[];
}

const Select = ({ label, hideLabel = false, options, children, ...props }: PropsWithChildren<SelectProps>) => (
  <label className="ui-field">
    {label && <span className={`ui-field__label ${hideLabel ? "ui-field__label--hidden" : ""}`}>{label}</span>}
    <select className="ui-select" {...props}>
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {children}
    </select>
  </label>
);

export default Select;
