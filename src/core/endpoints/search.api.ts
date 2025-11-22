import apiClient from "@/lib/http";

export interface SearchParams {
  query: string;
  scope?: "all" | "users" | "applications" | "documents" | "tags" | "banking";
  page?: number;
  perPage?: number;
}

export const search = <T = unknown>({ query, ...params }: SearchParams) =>
  apiClient.get<T>("/search", { params: { query, ...params } });

export const searchUsers = <T = unknown>(query: string, params?: Omit<SearchParams, "query" | "scope">) =>
  apiClient.get<T>("/search/users", { params: { query, ...params } });

export const searchApplications = <T = unknown>(query: string, params?: Omit<SearchParams, "query" | "scope">) =>
  apiClient.get<T>("/search/applications", { params: { query, ...params } });

export const searchDocuments = <T = unknown>(query: string, params?: Omit<SearchParams, "query" | "scope">) =>
  apiClient.get<T>("/search/documents", { params: { query, ...params } });
