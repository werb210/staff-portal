import { useGlobalLoading } from "../../state/loadingStore";

export default function LoadingOverlay() {
  const loading = useGlobalLoading((s) => s.loading);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded shadow text-xl font-semibold">
        Loading…
      </div>
    </div>
  );
}
