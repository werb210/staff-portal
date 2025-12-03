import pipelineStageRepo from "../db/repositories/pipelineStage.repo";

const pipelineStageService = {
  async list() {
    return await pipelineStageRepo.findMany({});
  },

  async get(id: string) {
    return await pipelineStageRepo.findById(id);
  },

  async create(payload: Record<string, any>) {
    return await pipelineStageRepo.create(payload);
  },

  async update(id: string, payload: Record<string, any>) {
    return await pipelineStageRepo.update(id, payload);
  },

  async remove(id: string) {
    return await pipelineStageRepo.delete(id);
  },
};

export default pipelineStageService;
