import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

const Select = ({ label, options, ...props }: SelectProps) => (
  <label className="ui-field">
    {label && <span className="ui-field__label">{label}</span>}
    <select className="ui-select" {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export default Select;
