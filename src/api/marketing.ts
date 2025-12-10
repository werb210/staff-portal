import { apiClient } from "./client";

export type Campaign = {
  id: string;
  name: string;
  status: "draft" | "scheduled" | "active";
};

export const fetchCampaigns = () => apiClient.get<Campaign[]>("/marketing/campaigns");
