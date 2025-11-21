import apiClient from "../api";

export interface BankingFilters {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface LinkBankAccountPayload {
  provider?: string;
  publicToken?: string;
  metadata?: Record<string, unknown>;
}

export const listBankAccounts = <T = unknown>(params?: BankingFilters) =>
  apiClient.get<T>("/banking/accounts", { params });

export const getBankAccount = <T = unknown>(accountId: string) =>
  apiClient.get<T>(`/banking/accounts/${accountId}`);

export const refreshBankAccount = <T = unknown>(accountId: string) =>
  apiClient.post<T>(`/banking/accounts/${accountId}/refresh`);

export const listTransactions = <T = unknown>(accountId: string, params?: BankingFilters) =>
  apiClient.get<T>(`/banking/accounts/${accountId}/transactions`, { params });

export const linkBankAccount = <T = unknown>(payload: LinkBankAccountPayload) =>
  apiClient.post<T>("/banking/accounts", payload);
