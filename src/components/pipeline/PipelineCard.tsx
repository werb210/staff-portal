import { PipelineApp } from "../../api/pipeline";

interface Props {
  app: PipelineApp;
}

export default function PipelineCard({ app }: Props) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 6,
        padding: 12,
        marginBottom: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        cursor: "grab",
      }}
      draggable
      data-id={app.id}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{app.businessName}</div>
      <div style={{ fontSize: 13, color: "#666" }}>
        {new Date(app.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
