import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/api/httpClient";

type RuntimeStatus = "green" | "red";

type RuntimeIndicator = {
  key: string;
  label: string;
  run: () => Promise<unknown>;
};

const RuntimeSettings = () => {
  const checks = useMemo<RuntimeIndicator[]>(
    () => [
      { key: "auth", label: "Auth", run: () => apiClient.get("/auth/me") },
      { key: "db", label: "DB", run: () => apiClient.get("/lenders") },
      { key: "external", label: "External services", run: () => apiClient.get("/lender-products") }
    ],
    []
  );

  const [statuses, setStatuses] = useState<Record<string, RuntimeStatus>>(
    () =>
      checks.reduce<Record<string, RuntimeStatus>>((acc, check) => {
        acc[check.key] = "red";
        return acc;
      }, {})
  );

  useEffect(() => {
    checks.forEach((check) => {
      check
        .run()
        .then(() => {
          setStatuses((prev) => ({ ...prev, [check.key]: "green" }));
        })
        .catch(() => {
          setStatuses((prev) => ({ ...prev, [check.key]: "red" }));
        });
    });
  }, [checks]);

  return (
    <section className="settings-panel" aria-label="Runtime status">
      <header>
        <h2>Runtime status</h2>
        <p>Read-only uptime indicators for critical services. Green is healthy, red needs attention.</p>
      </header>

      <div className="runtime-status">
        {checks.map((check) => {
          const status = statuses[check.key] ?? "red";
          return (
            <div key={check.key} className="runtime-status__row">
              <span className="runtime-status__label">{check.label}</span>
              <span className={`runtime-status__indicator runtime-status__indicator--${status}`}>
                {status.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RuntimeSettings;
