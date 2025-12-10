import type { PropsWithChildren, ReactNode } from "react";

interface CardProps {
  title?: ReactNode;
  actions?: ReactNode;
}

const Card = ({ title, actions, children }: PropsWithChildren<CardProps>) => (
  <div className="ui-card">
    {(title || actions) && (
      <div className="ui-card__header">
        <div className="ui-card__title">{title}</div>
        <div>{actions}</div>
      </div>
    )}
    <div className="ui-card__body">{children}</div>
  </div>
);

export default Card;
