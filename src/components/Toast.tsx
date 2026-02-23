type ToastVariant = "success" | "error";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
};

export default function Toast({ message, variant = "success" }: ToastProps) {
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: variant === "error" ? "#991b1b" : "#166534",
        color: "#fff",
        padding: "10px 15px",
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
      }}
    >
      {message}
    </div>
  );
}
