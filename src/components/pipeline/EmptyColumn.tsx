import React from "react";

interface Props {
  label: string;
}

export function EmptyColumn({ label }: Props) {
  return (
    <div className="text-center text-gray-500 py-10 italic">
      No applications in <strong>{label}</strong>
    </div>
  );
}
