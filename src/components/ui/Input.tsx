import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, ...props }: InputProps) => (
  <label className="ui-field">
    {label && <span className="ui-field__label">{label}</span>}
    <input className="ui-input" {...props} />
    {error && <span className="ui-field__error">{error}</span>}
  </label>
);

export default Input;
