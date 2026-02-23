import { useSilo } from "../context/SiloContext";

export default function SiloSelector() {
  const { silo, setSilo } = useSilo();

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <button onClick={() => setSilo("BF")} disabled={silo === "BF"}>
        BF
      </button>
      <button onClick={() => setSilo("BI")} disabled={silo === "BI"}>
        BI
      </button>
      <button onClick={() => setSilo("SLF")} disabled={silo === "SLF"}>
        SLF
      </button>
    </div>
  );
}
