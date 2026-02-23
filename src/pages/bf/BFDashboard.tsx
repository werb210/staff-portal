import { useMemo, useState } from "react";
import SiloSelector from "../../components/SiloSelector";
import { createApi } from "../../api/client";
import { useSilo } from "../../context/SiloContext";

export default function BFDashboard() {
  const { silo } = useSilo();
  const api = useMemo(() => createApi(silo), [silo]);
  const [status, setStatus] = useState("Idle");

  return (
    <div>
      <h2>BF Dashboard</h2>
      <SiloSelector />
      <p>Current silo: {silo}</p>
      <button
        onClick={() => {
          setStatus(`API base: ${api.defaults.baseURL ?? "unknown"}`);
        }}
      >
        Show API Base
      </button>
      <pre>{status}</pre>
    </div>
  );
}
