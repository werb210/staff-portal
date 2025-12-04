import PipelineCard from "./PipelineCard";

export default function PipelineColumn({ title, items }: { title: string; items: any[] }) {
  return (
    <div style={{ width: 300, marginRight: 16 }}>
      <h3>{title}</h3>
      {items.map((i) => (
        <PipelineCard key={i.id} app={i} />
      ))}
    </div>
  );
}
