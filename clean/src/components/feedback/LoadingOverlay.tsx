import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export default function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className={cn("flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lg")}>
        <Loader2 className="h-5 w-5 animate-spin" />
        <div className="text-sm font-medium text-gray-800">{message ?? "Loading"}</div>
      </div>
    </div>
  );
}
