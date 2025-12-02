// src/components/LoadingSpinner.tsx
export default function LoadingSpinner() {
  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: "4px solid #d0d0d0",
          borderTopColor: "#4285f4",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>
        {`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}
      </style>
    </div>
  );
}
