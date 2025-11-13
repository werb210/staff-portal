// ======================================================================
// src/components/common/Drawer.tsx
// BF Standard Drawer Component
// - Portal-based
// - ESC close
// - Click-outside close
// - Scroll lock
// - Accessible roles
// ======================================================================

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface DrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export const Drawer = ({
  title,
  open,
  onClose,
  children,
  width = 420,
}: DrawerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Mount portal root
  const portalRoot =
    typeof document !== "undefined"
      ? document.getElementById("drawer-root") ??
        (() => {
          const el = document.createElement("div");
          el.id = "drawer-root";
          document.body.appendChild(el);
          return el;
        })()
      : null;

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  // Lock scroll when drawer is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!portalRoot || !open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={backdropRef}
      className="drawer-backdrop"
      onMouseDown={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <aside
        ref={ref}
        className="drawer drawer-open"
        style={{ width }}
      >
        <header className="drawer-header">
          <h2>{title}</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ✕
          </Button>
        </header>
        <div className="drawer-content">{children}</div>
      </aside>
    </div>,
    portalRoot
  );
};
