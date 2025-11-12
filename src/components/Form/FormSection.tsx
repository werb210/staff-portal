interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="card form-section">
      <header className="card__header">
        <div>
          <h2>{title}</h2>
          {description && <p className="form-section__description">{description}</p>}
        </div>
      </header>
      <div className="form-section__content">{children}</div>
    </section>
  );
}
