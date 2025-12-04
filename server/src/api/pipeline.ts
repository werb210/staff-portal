import { http } from "@/lib/api/http";

export const PipelineAPI = {
  board: () => http.get("/pipeline-board"),
  moveCard: (payload: {
    cardId: string;
    fromStageId: string;
    toStageId: string;
    position: number;
  }) => http.post("/pipeline-board/move", payload),
};
