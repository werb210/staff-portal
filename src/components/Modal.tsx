import type { PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';

interface ModalProps extends PropsWithChildren {
  title?: ReactNode;
  open: boolean;
  onClose: () => void;
  width?: 'sm' | 'md' | 'lg';
}

export function Modal({ title, open, onClose, width = 'md', children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="modal__backdrop" role="dialog" aria-modal="true">
      <div className={clsx('modal', `modal--${width}`)}>
        <header className="modal__header">
          {title && <h2>{title}</h2>}
          <button className="modal__close" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
