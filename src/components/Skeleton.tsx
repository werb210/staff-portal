import type { CSSProperties } from "react";

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  count?: number;
  style?: CSSProperties;
};

export default function Skeleton({ width = "100%", height = 16, count = 1, style }: SkeletonProps) {
  return (
    <div style={{ display: "grid", gap: 8, ...style }}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            width,
            height,
            borderRadius: 6,
            background: "linear-gradient(90deg, #1e293b 25%, #334155 37%, #1e293b 63%)",
            backgroundSize: "400% 100%",
            animation: "portal-skeleton 1.4s ease infinite"
          }}
        />
      ))}
    </div>
  );
}
