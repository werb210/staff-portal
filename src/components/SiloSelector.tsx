import { useSilo } from "../context/SiloContext";
import type { Silo } from "../context/SiloContext";
import { useAuth } from "../context/AuthContext";

export default function SiloSelector() {
  const { silo, setSilo } = useSilo();
  const { role } = useAuth();

  const allowed: Silo[] = role === "admin" ? ["BF", "BI", "SLF"] : ["BF", "BI"];

  return (
    <div style={{ display: "flex", gap: 12 }}>
      {allowed.map((s) => (
        <button key={s} onClick={() => setSilo(s)} disabled={silo === s}>
          {s}
        </button>
      ))}
    </div>
  );
}
