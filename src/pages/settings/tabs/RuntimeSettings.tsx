import { useEffect, useState } from "react";
import apiClient from "@/api/httpClient";
import Button from "@/components/ui/Button";

type RuntimeStatus = "green" | "red" | "yellow";

type RuntimeData = {
  health: string;
  schema: string;
  cors: string;
  version: string;
  build: string;
  status: RuntimeStatus;
};

const defaultRuntimeData: RuntimeData = {
  health: "Unknown",
  schema: "Unknown",
  cors: "Unknown",
  version: "Unknown",
  build: "Unknown",
  status: "yellow"
};

const RuntimeSettings = () => {
  const [runtime, setRuntime] = useState<RuntimeData>(defaultRuntimeData);
  const [lastChecked, setLastChecked] = useState<string>("");

  const fetchRuntime = async () => {
    try {
      const healthData = await apiClient.get<Record<string, unknown>>("/_int/health");
      const versionData = await apiClient.get<Record<string, unknown>>("/_int/version");
      const nextRuntime: RuntimeData = {
        health: String(healthData?.status ?? healthData?.health ?? "OK"),
        schema: String(healthData?.schema ?? healthData?.schemaVersion ?? "Unknown"),
        cors: String(healthData?.cors ?? healthData?.corsStatus ?? "Unknown"),
        version: String(versionData?.version ?? versionData?.tag ?? "Unknown"),
        build: String(versionData?.build ?? versionData?.commit ?? "Unknown"),
        status: healthData ? "green" : "red"
      };
      setRuntime(nextRuntime);
      setLastChecked(new Date().toLocaleTimeString());
    } catch {
      setRuntime((prev) => ({ ...prev, status: "red", health: "Error" }));
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchRuntime();
  }, []);

  return (
    <section className="settings-panel" aria-label="Runtime status">
      <header>
        <h2>Runtime verification</h2>
        <p>Read-only checks for health, schema, CORS, and build metadata.</p>
      </header>

      <div className="runtime-status">
        <div className="runtime-status__row">
          <span className="runtime-status__label">Health</span>
          <span className={`runtime-status__indicator runtime-status__indicator--${runtime.status}`}>
            {runtime.health}
          </span>
        </div>
        <div className="runtime-status__row">
          <span className="runtime-status__label">Schema</span>
          <span className="runtime-status__value">{runtime.schema}</span>
        </div>
        <div className="runtime-status__row">
          <span className="runtime-status__label">CORS status</span>
          <span className="runtime-status__value">{runtime.cors}</span>
        </div>
        <div className="runtime-status__row">
          <span className="runtime-status__label">Build/version</span>
          <span className="runtime-status__value">
            {runtime.version} ({runtime.build})
          </span>
        </div>
      </div>

      <div className="settings-actions">
        <Button type="button" variant="secondary" onClick={fetchRuntime}>
          Refresh status
        </Button>
        {lastChecked && <span className="runtime-status__timestamp">Last checked at {lastChecked}</span>}
      </div>
    </section>
  );
};

export default RuntimeSettings;
