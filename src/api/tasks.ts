import { apiClient } from "./client";
import { normalizeArray } from "@/utils/normalize";

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type TaskItem = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToUserId?: string;
  createdByUserId?: string;
  silo?: string;
  relatedApplicationId?: string;
  relatedContactId?: string;
};

export const fetchTasks = async () => {
  const res = await apiClient.get<TaskItem[]>("/api/tasks");
  return normalizeArray<TaskItem>(res);
};

export const createTask = (task: Partial<TaskItem>) => apiClient.post<TaskItem>("/api/tasks", task);

export const updateTask = (id: string, task: Partial<TaskItem>) => apiClient.patch<TaskItem>(`/api/tasks/${id}`, task);

export const deleteTask = (id: string) => apiClient.delete<void>(`/api/tasks/${id}`);
