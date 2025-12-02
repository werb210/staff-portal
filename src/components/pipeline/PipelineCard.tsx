import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export default function PipelineCard({ app }: { app: any }) {
  const nav = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all"
      onClick={() => nav(`/pipeline/${app.id}`)}
    >
      <CardContent className="p-4">
        <div className="font-semibold">{app.businessName}</div>
        <div className="text-sm text-gray-600">{app.primaryContact}</div>
      </CardContent>
    </Card>
  );
}
