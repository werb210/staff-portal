import type { TimelineEvent } from "@/api/crm";

const iconForType: Record<TimelineEvent["type"], string> = {
  call: "📞",
  sms: "💬",
  email: "✉️",
  note: "📝",
  document: "📄",
  status: "🔄",
  ai: "🤖",
  lender: "🏦",
  system: "⚙️",
  RULE_TRIGGERED: "🧭",
  AUTO_SMS_SENT: "📲",
  AUTO_TASK_CREATED: "✅",
  FOLLOW_UP_REMINDER: "⏰"
};

const automationMeta: Partial<
  Record<TimelineEvent["type"], { label: string; explanation: string }>
> = {
  RULE_TRIGGERED: {
    label: "Rule triggered",
    explanation: "Automation rule detected a follow-up condition."
  },
  AUTO_SMS_SENT: {
    label: "Automated SMS sent",
    explanation: "System dispatched a follow-up SMS automatically."
  },
  AUTO_TASK_CREATED: {
    label: "Automated task created",
    explanation: "System created a follow-up task for staff."
  },
  FOLLOW_UP_REMINDER: {
    label: "Follow-up reminder",
    explanation: "Reminder queued for staff attention."
  }
};

interface TimelineItemProps {
  event: TimelineEvent;
  similarCount?: number;
  onSelectAutomation?: (event: TimelineEvent) => void;
  isSelected?: boolean;
}

const TimelineItem = ({ event, similarCount = 0, onSelectAutomation, isSelected }: TimelineItemProps) => {
  const icon = iconForType[event.type];
  const date = new Date(event.occurredAt).toLocaleTimeString();
  const automationInfo = automationMeta[event.type];
  const isAutomation = Boolean(automationInfo);
  const content = (
    <>
      <div className="font-bold">{automationInfo?.label ?? event.summary}</div>
      {isAutomation && <div className="text-sm text-slate-700">{event.summary}</div>}
      <div className="text-sm text-gray-600">{date}</div>
      {(automationInfo?.explanation || event.details) && (
        <div className="text-sm text-gray-600">{automationInfo?.explanation ?? event.details}</div>
      )}
      {similarCount > 0 && <div className="text-xs text-slate-500">+{similarCount} similar events</div>}
    </>
  );

  if (isAutomation && onSelectAutomation) {
    return (
      <button
        type="button"
        className={`timeline-item text-left ${isSelected ? "border border-emerald-200 bg-emerald-50" : ""}`}
        data-testid={`timeline-${event.id}`}
        onClick={() => onSelectAutomation(event)}
      >
        <div className="timeline-item__icon">{icon}</div>
        <div>{content}</div>
      </button>
    );
  }

  return (
    <div className="timeline-item" data-testid={`timeline-${event.id}`}>
      <div className="timeline-item__icon">{icon}</div>
      <div>{content}</div>
    </div>
  );
};

export default TimelineItem;
