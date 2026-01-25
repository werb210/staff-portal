import type { PropsWithChildren, ReactNode } from "react";

type ModalProps = PropsWithChildren<{
  title: string;
  actions?: ReactNode;
  onClose: () => void;
}>;

const Modal = ({ title, actions, onClose, children }: ModalProps) => (
  <div className="modal" role="dialog" aria-modal="true">
    <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
    <div className="modal__content">
      <header className="modal__header">
        <h3>{title}</h3>
        <div className="modal__actions">
          {actions}
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
      </header>
      <div className="modal__body">{children}</div>
    </div>
  </div>
);

export default Modal;
