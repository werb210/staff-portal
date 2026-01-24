import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { apiClient } from "@/api/httpClient";

type CheckStatus = "loading" | "success" | "error";

type CheckResult = {
  status: CheckStatus;
  message?: string;
};

type RuntimeCheck = {
  id: string;
  label: string;
  run: () => Promise<unknown>;
};

const runtimeChecks: RuntimeCheck[] = [
  {
    id: "auth-me",
    label: "/api/auth/me",
    run: () => apiClient.get("/auth/me")
  },
  {
    id: "lenders",
    label: "/api/lenders",
    run: () => apiClient.getList("/lenders")
  },
  {
    id: "lender-products",
    label: "/api/lender-products",
    run: () => apiClient.getList("/lender-products")
  }
];

const formatErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

const getStatusLabel = (status: CheckStatus) => {
  switch (status) {
    case "success":
      return "GREEN";
    case "error":
      return "RED";
    default:
      return "PENDING";
  }
};

const RuntimeVerification = () => {
  const initialResults = useMemo(
    () =>
      runtimeChecks.reduce<Record<string, CheckResult>>((acc, check) => {
        acc[check.id] = { status: "loading" };
        return acc;
      }, {}),
    []
  );
  const [results, setResults] = useState<Record<string, CheckResult>>(initialResults);

  useEffect(() => {
    let isMounted = true;

    const runChecks = async () => {
      setResults(initialResults);

      await Promise.all(
        runtimeChecks.map(async (check) => {
          try {
            await check.run();
            if (!isMounted) return;
            setResults((prev) => ({
              ...prev,
              [check.id]: { status: "success" }
            }));
          } catch (error) {
            if (!isMounted) return;
            const message = formatErrorMessage(error);
            console.error("Runtime verification failed", { endpoint: check.label, error });
            setResults((prev) => ({
              ...prev,
              [check.id]: { status: "error", message }
            }));
          }
        })
      );
    };

    void runChecks();

    return () => {
      isMounted = false;
    };
  }, [initialResults]);

  return (
    <div className="page">
      <Card title="Runtime Verification">
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            GREEN indicates success. RED displays the raw error message without masking failures.
          </div>
          <div className="space-y-3">
            {runtimeChecks.map((check) => {
              const result = results[check.id];
              const status = result?.status ?? "loading";
              const statusClass =
                status === "success"
                  ? "text-green-700"
                  : status === "error"
                    ? "text-red-700"
                    : "text-slate-500";
              return (
                <div
                  key={check.id}
                  className="flex items-start justify-between gap-4 rounded border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">{check.label}</div>
                    {status === "loading" && (
                      <div className="text-sm text-slate-500">Checking endpoint…</div>
                    )}
                    {status === "error" && (
                      <div className="text-sm text-red-700 break-words">{result?.message}</div>
                    )}
                  </div>
                  <div className={`text-sm font-semibold ${statusClass}`}>{getStatusLabel(status)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RuntimeVerification;
