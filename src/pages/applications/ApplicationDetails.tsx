import type { ReactNode } from "react";

type DetailValue = Record<string, unknown> | unknown[] | string | number | boolean | null | undefined;

const renderScalar = (value: string | number | boolean) => <span>{String(value)}</span>;

const renderValue = (value: DetailValue): ReactNode => {
  if (value == null) {
    return <span className="drawer-placeholder">Not provided.</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="drawer-placeholder">Not provided.</span>;
    return (
      <div className="drawer-list">
        {value.map((entry, index) => (
          <div key={index} className="drawer-list__item">
            {renderValue(entry as DetailValue)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return <span className="drawer-placeholder">Not provided.</span>;
    return (
      <dl className="drawer-kv-list">
        {entries.map(([key, entryValue]) => (
          <div key={key} className="drawer-kv-list__item">
            <dt>{key}</dt>
            <dd>{renderValue(entryValue as DetailValue)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return renderScalar(value);
};

export const DetailSection = ({ title, data, footer }: { title: string; data: DetailValue; footer?: ReactNode }) => (
  <div className="drawer-section">
    <div className="drawer-section__title">{title}</div>
    <div className="drawer-section__body">{renderValue(data)}</div>
    {footer ? <div className="drawer-section__footer">{footer}</div> : null}
  </div>
);

export const DetailBlock = ({ label, value }: { label: string; value: DetailValue }) => (
  <div className="drawer-kv-list__item">
    <dt>{label}</dt>
    <dd>{renderValue(value)}</dd>
  </div>
);

export default renderValue;
