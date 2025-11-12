import { useEffect } from 'react';

interface BaseModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BaseModal({ title, isOpen, onClose, children }: BaseModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__content">
        <header className="modal__header">
          <h2 id="modal-title">{title}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
