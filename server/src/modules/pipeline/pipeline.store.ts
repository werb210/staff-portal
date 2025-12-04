import { create } from "zustand";
import { pipelineApi } from "./pipeline.api";

export const usePipelineStore = create((set) => ({
  stages: {},
  async load() {
    const res = await pipelineApi.list();
    set({ stages: res.data });
  },
  async move(id: string, stage: string) {
    await pipelineApi.move(id, stage);
    await (usePipelineStore.getState() as any).load();
  }
}));
