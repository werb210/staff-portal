import { useEffect, useState } from "react";
import { CallState, subscribe } from "@/services/voiceService";

export default function IncomingCallModal() {
  const [callState, setCallState] = useState<CallState>("idle");

  useEffect(() => {
    const unsubscribe = subscribe(setCallState);
    return () => {
      unsubscribe();
    };
  }, []);

  if (callState !== "connecting") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded bg-white p-6 text-center shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Call Connecting</h2>
      </div>
    </div>
  );
}
