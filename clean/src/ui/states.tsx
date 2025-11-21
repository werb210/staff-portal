interface StateProps {
  title: string;
  description?: string;
}

export const ErrorState = ({ title, description }: StateProps) => (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
    <div className="text-sm font-medium tracking-tight">{title}</div>
    {description ? <p className="text-sm">{description}</p> : null}
  </div>
);

export const EmptyState = ({ title, description }: StateProps) => (
  <div className="rounded-lg border bg-white p-6 text-center">
    <div className="text-base font-medium tracking-tight">{title}</div>
    {description ? <p className="text-sm text-slate-600">{description}</p> : null}
  </div>
);
