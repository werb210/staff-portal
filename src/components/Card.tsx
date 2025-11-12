import type { PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps extends PropsWithChildren {
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Card({ title, action, className, children }: CardProps) {
  return (
    <section className={clsx('card', className)}>
      {(title || action) && (
        <header className="card__header">
          <h2>{title}</h2>
          {action && <div className="card__action">{action}</div>}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}

export default Card;
