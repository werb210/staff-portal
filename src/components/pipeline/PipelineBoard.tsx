import { useEffect, useState } from "react";
import { fetchPipeline, updateStage, PipelineApp } from "../../api/pipeline";
import PipelineColumn from "./PipelineColumn";
import ApplicationDrawer from "../application/ApplicationDrawer";

const STAGES = [
  { key: "requires_docs", label: "Requires Docs" },
  { key: "intake", label: "Intake" },
  { key: "review", label: "Review" },
  { key: "submission", label: "Submission" },
  { key: "lender_review", label: "Lender Review" },
  { key: "finalized", label: "Finalized" },
];

export default function PipelineBoard() {
  const [apps, setApps] = useState<PipelineApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = () => {
    setLoading(true);
    fetchPipeline()
      .then((data) => {
        setApps(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const move = async (id: string, stage: string) => {
    await updateStage(id, stage);
    load();
  };

  const openDrawer = (id: string) => {
    setDrawerId(id);
    setDrawerOpen(true);
  };

  if (loading) return <div style={{ padding: 20 }}>Loading pipeline...</div>;

  return (
    <div style={{ display: "flex", gap: 12, padding: 20 }}>
      {STAGES.map((col) => (
        <PipelineColumn
          key={col.key}
          label={col.label}
          stage={col.key}
          apps={apps.filter((a) => a.stage === col.key)}
          onDropCard={move}
          onOpen={openDrawer}
        />
      ))}

      <ApplicationDrawer
        id={drawerId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
