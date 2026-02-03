// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TimelineItem from "@/pages/crm/timeline/TimelineItem";

describe("TimelineItem", () => {
  it("renders call metadata with duration and recording placeholder", () => {
    render(
      <TimelineItem
        event={{
          id: "call-1",
          entityId: "c1",
          entityType: "contact",
          type: "call",
          occurredAt: new Date("2024-01-01T01:02:03.000Z").toISOString(),
          summary: "Outbound call logged",
          details: "Number: +15555550123",
          call: {
            outcome: "failed",
            durationSeconds: 75,
            failureReason: "network",
            recordingUrl: null
          }
        }}
      />
    );

    expect(screen.getByText("Duration 01:15")).toBeInTheDocument();
    expect(screen.getByText("Reason: network")).toBeInTheDocument();
    expect(screen.getByText("▶︎ Play recording (coming soon)")).toBeInTheDocument();
  });
});
