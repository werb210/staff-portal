import { Navigate, useParams } from "react-router-dom";
import AiLiveChat from "@/modules/ai/AiLiveChat";

export default function AiLiveChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) {
    return <Navigate to="/portal/ai" replace />;
  }

  return <AiLiveChat sessionId={sessionId} />;
}
