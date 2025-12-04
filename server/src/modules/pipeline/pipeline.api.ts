import { api } from "@/lib/apiClient";

export const pipelineApi = {
  list: () => api.get("/pipeline"),
  move: (id: string, stage: string) =>
    api.post(`/pipeline/${id}/move`, { stage })
};
