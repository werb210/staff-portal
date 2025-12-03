import pipelineStageRepo from "../db/repositories/pipelineStage.repo";
import pipelineRepo from "../db/repositories/pipeline.repo";
import pipelineEventsRepo from "../db/repositories/pipelineEvents.repo";

const pipelineBoardService = {
  async getBoard() {
    const stages = await pipelineStageRepo.findMany({});
    const cards = await pipelineRepo.findMany({});

    const grouped = stages.map((stage: any) => ({
      stageId: stage.id,
      stageName: stage.name,
      cards: cards.filter((c: any) => c.stageId === stage.id),
    }));

    return grouped;
  },

  async moveCard(applicationId: string, fromStage: string, toStage: string) {
    const updated = await pipelineRepo.update(applicationId, { stageId: toStage });

    await pipelineEventsRepo.create({
      applicationId,
      type: "MOVE",
      fromStage,
      toStage,
      timestamp: new Date().toISOString(),
    });

    return updated;
  },
};

export default pipelineBoardService;
