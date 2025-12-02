import React from "react";
import Column, { PipelineApplication } from "./Column";

interface Props {
  columns: {
    label: string;
    apps: PipelineApplication[];
  }[];
  loading?: boolean;
  onCardClick?: (id: string) => void;
}

export default function ColumnContainer({
  columns,
  loading = false,
  onCardClick,
}: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto h-full pb-4">
      {columns.map((col) => (
        <Column
          key={col.label}
          label={col.label}
          apps={col.apps}
          loading={loading}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
