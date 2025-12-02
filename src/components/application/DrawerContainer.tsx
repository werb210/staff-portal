import { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function DrawerContainer({ open, onClose, children }: Props) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 20,
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "560px",
          height: "100vh",
          background: "#fff",
          boxShadow: "-4px 0 12px rgba(0,0,0,0.15)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform .25s ease",
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </>
  );
}
