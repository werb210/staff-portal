import db from "../db.js";

const pipelineRepo = {
  findStages: () => db.query("SELECT * FROM pipeline_stages ORDER BY ordering ASC"),
  findDealsByStage: (stageId: string) =>
    db.query("SELECT * FROM deals WHERE stage_id=$1 ORDER BY updated_at DESC", [stageId]),
};

export default pipelineRepo;
