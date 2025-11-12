import type { ReactNode } from 'react';
import { Button } from './Button';

interface DrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export const Drawer = ({ title, open, onClose, children, width = 420 }: DrawerProps) => {
  if (!open) return null;

  return (
    <div className="drawer-backdrop">
      <aside className="drawer" style={{ width }}>
        <header className="drawer-header">
          <h2>{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close drawer">
            ✕
          </Button>
        </header>
        <div className="drawer-content">{children}</div>
      </aside>
    </div>
  );
};
