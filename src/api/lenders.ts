import { apiClient } from "./client";

export type Lender = {
  id: string;
  name: string;
  region: string;
};

export const fetchLenders = () => apiClient.get<Lender[]>("/lenders");
