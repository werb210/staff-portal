import { useAuditStore } from "../../state/auditStore";

export default function AuditFilterBar() {
  const { filter, setFilter, load } = useAuditStore((s) => ({
    filter: s.filter,
    setFilter: s.setFilter,
    load: s.load,
  }));

  const update = (key: "eventType" | "actorId" | "entityType" | "from" | "to", value: string) =>
    setFilter({ [key]: value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await load();
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr)) auto",
        gap: 8,
        marginBottom: 16,
      }}
    >
      <input
        placeholder="Event type"
        value={filter.eventType ?? ""}
        onChange={(e) => update("eventType", e.target.value)}
      />
      <input
        placeholder="Actor ID"
        value={filter.actorId ?? ""}
        onChange={(e) => update("actorId", e.target.value)}
      />
      <input
        placeholder="Entity type"
        value={filter.entityType ?? ""}
        onChange={(e) => update("entityType", e.target.value)}
      />
      <input
        type="date"
        value={filter.from ?? ""}
        onChange={(e) => update("from", e.target.value)}
      />
      <input
        type="date"
        value={filter.to ?? ""}
        onChange={(e) => update("to", e.target.value)}
      />
      <button type="submit">Apply</button>
    </form>
  );
}
