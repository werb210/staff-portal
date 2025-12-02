import React, { useState } from "react";
import TasksTable from "./TasksTable";
import TaskModal from "./TaskModal";
import { Task, TaskForm } from "./types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "t1",
      title: "Call client",
      description: "Follow up on application",
      status: "pending",
      assignedTo: "Todd",
      dueDate: "2025-12-05",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const save = (data: TaskForm) => {
    if (editing) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editing.id ? { ...t, ...data, id: t.id } : t
        )
      );
    } else {
      setTasks((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          createdAt: new Date().toISOString(),
          ...data,
        },
      ]);
    }

    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Tasks</h1>

        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="rounded bg-emerald-600 text-white px-4 py-2 text-sm"
        >
          New Task
        </button>
      </div>

      <TasksTable
        tasks={tasks}
        onEdit={(t) => {
          setEditing(t);
          setModalOpen(true);
        }}
      />

      <TaskModal
        open={modalOpen}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />
    </div>
  );
}
