import { apiClient } from "./client";

export type TaskItem = {
  id: string;
  title: string;
  dueDate?: string;
  completed: boolean;
};

export const fetchTasks = () => apiClient.get<TaskItem[]>("/tasks");
