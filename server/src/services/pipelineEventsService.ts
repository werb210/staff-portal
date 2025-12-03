import pipelineEventsRepo from "../db/repositories/pipelineEvents.repo";

const pipelineEventsService = {
  async listByApplication(appId: string) {
    return await pipelineEventsRepo.findMany({ applicationId: appId });
  },

  async recordEvent(payload: Record<string, any>) {
    return await pipelineEventsRepo.create(payload);
  },
};

export default pipelineEventsService;
