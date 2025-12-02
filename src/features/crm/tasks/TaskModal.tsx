import React, { useEffect, useState } from "react";
import { Task, TaskForm } from "./types";

export default function TaskModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: TaskForm) => void;
  initial?: Task | null;
}) {
  const [form, setForm] = useState<TaskForm>({
    title: "",
    description: "",
    dueDate: "",
    status: "pending",
    assignedTo: "",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description ?? "",
        dueDate: initial.dueDate ?? "",
        status: initial.status,
        assignedTo: initial.assignedTo ?? "",
      });
    }
  }, [initial]);

  if (!open) return null;

  const update = (key: keyof TaskForm, val: any) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          {initial ? "Edit Task" : "New Task"}
        </h2>

        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            rows={3}
          />

          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => update("dueDate", e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />

          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value as any)}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <input
            type="text"
            placeholder="Assigned to"
            value={form.assignedTo}
            onChange={(e) => update("assignedTo", e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border bg-white"
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 text-sm rounded bg-emerald-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
