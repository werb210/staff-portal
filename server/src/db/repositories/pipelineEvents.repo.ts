import db from "../db.js";

const pipelineEventsRepo = {
  logMove: (dealId: string, fromStage: string, toStage: string) =>
    db.query(
      `INSERT INTO pipeline_events (deal_id, from_stage, to_stage)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [dealId, fromStage, toStage]
    ),
};

export default pipelineEventsRepo;
