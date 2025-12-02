import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  id: string;
  businessName: string;
  contactName: string;
  stage: string;
  score?: number | null;
  onClick?: () => void;
}

export default function ApplicationCard({
  id,
  businessName,
  contactName,
  stage,
  score,
  onClick,
}: Props) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg border border-gray-200"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{businessName}</h3>
          <Badge variant="outline">{stage}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600">Contact: {contactName}</p>

        {score !== undefined && score !== null && (
          <p className="text-sm text-gray-800 mt-2">
            Score: <strong>{score}</strong>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
