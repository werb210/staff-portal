import { useNavigate } from "react-router-dom";
import { useSilo } from "../context/SiloContext";
import type { Silo } from "../context/SiloContext";
import { useAuth } from "../context/AuthContext";

const siloLabels: Record<Silo, string> = {
  bf: "BF",
  bi: "BI",
  slf: "SLF"
};

export default function SiloSelector() {
  const { silo, setSilo } = useSilo();
  const { canAccessSilo, allowedSilos } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = (nextSilo: Silo) => {
    if (!canAccessSilo(nextSilo)) return;
    setSilo(nextSilo);
    navigate(`/${nextSilo}`);
  };

  return (
    <div style={{ display: "flex", gap: 12 }}>
      {allowedSilos.map((s) => (
        <button key={s} onClick={() => handleSwitch(s)} disabled={silo === s}>
          {siloLabels[s]}
        </button>
      ))}
    </div>
  );
}
