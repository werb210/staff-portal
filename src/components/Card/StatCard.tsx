interface StatCardProps {
  title: string;
  value: string | number;
  caption?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({ title, value, caption, tone = 'default' }: StatCardProps) {
  return (
    <article className={`card stat-card stat-card--${tone}`}>
      <header>
        <h3>{title}</h3>
        {caption && <span className="stat-card__caption">{caption}</span>}
      </header>
      <p className="stat-card__value">{value}</p>
    </article>
  );
}
