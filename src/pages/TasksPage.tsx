// src/pages/TasksPage.tsx
import { useState } from "react";
import { useTasks } from "../hooks/useTasks";

export default function TasksPage() {
  const { list, create, update, remove } = useTasks();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;
    create.mutate({ title, dueDate: due || null });
    setTitle("");
    setDue("");
  };

  if (list.isLoading) return <div>Loading tasks…</div>;
  if (list.isError) return <div>Error loading tasks</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Tasks</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <button onClick={handleCreate} disabled={create.isPending}>
          {create.isPending ? "Saving…" : "Add Task"}
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
              Title
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
              Due
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
              Status
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {list.data?.map((t: any) => (
            <tr key={t.id}>
              <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{t.title}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                {t.dueDate || "-"}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                {t.completed ? "Completed" : "Open"}
              </td>
              <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                <button
                  onClick={() =>
                    update.mutate({
                      id: t.id,
                      completed: !t.completed,
                    })
                  }
                  style={{ marginRight: 10 }}
                >
                  {t.completed ? "Reopen" : "Complete"}
                </button>

                <button onClick={() => remove.mutate(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
