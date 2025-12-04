export default function PipelineCard({ app }: { app: any }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 8 }}>
      <strong>{app.businessName}</strong>
      <div>Status: {app.status}</div>
    </div>
  );
}
