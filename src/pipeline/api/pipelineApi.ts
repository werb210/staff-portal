// src/pipeline/api/pipelineApi.ts
import { api } from "../../api/client";

export const pipelineApi = {
  getAll: async () => {
    const res = await api.get("/pipeline");
    return res.data;
  },

  moveCard: async (applicationId: string, toStage: string) => {
    const res = await api.post("/pipeline/move", {
      applicationId,
      toStage,
    });
    return res.data;
  },

  getApplication: async (applicationId: string) => {
    const res = await api.get(`/pipeline/${applicationId}`);
    return res.data;
  },

  updateField: async (
    applicationId: string,
    field: string,
    value: any
  ) => {
    const res = await api.post(`/pipeline/${applicationId}/update`, {
      field,
      value,
    });
    return res.data;
  },
};
