import { useEffect, useMemo } from "react";
import { clsx } from "clsx";
import Button from "@/components/ui/Button";
import { useDialerStore, type DialerFailureReason, type DialerStatus } from "@/state/dialer.store";
import { useTwilioCall } from "@/hooks/useTwilioCall";

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
};

const formatStatusLabel = (status: DialerStatus) => {
  switch (status) {
    case "dialing":
      return "Dialing…";
    case "ringing":
      return "Ringing…";
    case "connected":
      return "Connected";
    case "completed":
      return "Completed";
    case "voicemail":
      return "Voicemail";
    case "failed":
      return "Call failed";
    case "ended":
      return "Call ended";
    default:
      return "Ready";
  }
};

const formatFailureReason = (reason: DialerFailureReason | null) => {
  if (!reason) return null;
  switch (reason) {
    case "network":
      return "Network issue detected.";
    case "permission-denied":
      return "Microphone permission denied.";
    case "busy-no-answer":
      return "Busy or no answer.";
    case "user-canceled":
      return "Call canceled.";
    default:
      return "Call failed.";
  }
};

const controlIcons = {
  mute: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 9v6a3 3 0 0 0 6 0V9a3 3 0 0 0-6 0Z" />
      <path d="M5 12a7 7 0 0 0 12.8 3.8" />
      <path d="M12 19v3" />
      <path d="M8 22h8" />
      <path d="M4 4l16 16" />
    </svg>
  ),
  hold: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 5v14" />
      <path d="M17 5v14" />
    </svg>
  ),
  record: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6" />
    </svg>
  ),
  transfer: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h12" />
      <path d="M12 3l4 4-4 4" />
      <path d="M20 17H8" />
      <path d="M12 21l-4-4 4-4" />
    </svg>
  ),
  add: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  ),
  merge: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4v8a4 4 0 0 0 4 4h6" />
      <path d="M7 20v-4" />
      <path d="M17 20v-8" />
    </svg>
  )
};

const VoiceDialer = () => {
  const {
    isOpen,
    context,
    status,
    muted,
    onHold,
    keypadOpen,
    number,
    error,
    warning,
    failureReason,
    elapsedSeconds,
    closeDialer,
    minimizeDialer,
    setNumber,
    toggleKeypad,
    recordElapsed,
    endCall,
    resetCall
  } = useDialerStore();
  const { dial, hangup, toggleHold, toggleMute } = useTwilioCall();

  const displayName = context.contactName ?? context.applicationName ?? "Dialer";
  const statusLabel = formatStatusLabel(status);
  const statusTone =
    status === "connected"
      ? "active"
      : status === "dialing" || status === "ringing"
        ? "ringing"
        : status === "completed"
          ? "completed"
          : status === "voicemail"
            ? "voicemail"
            : status === "failed"
              ? "failed"
              : status;
  const isCallInProgress = status === "dialing" || status === "ringing" || status === "connected";
  const isCallSetup = status === "dialing" || status === "ringing";
  const canSelectOutcome = !isCallInProgress && status !== "idle";
  const outcomeOptions = useMemo(
    () => [
      { label: "Completed", value: "completed" },
      { label: "Voicemail", value: "voicemail" },
      { label: "No answer", value: "no-answer" },
      { label: "Failed", value: "failed" },
      { label: "Canceled", value: "canceled" }
    ],
    []
  );
  const controlButtons = useMemo(
    () => [
      {
        key: "mute",
        label: "Mute",
        icon: controlIcons.mute,
        onClick: toggleMute,
        active: muted,
        disabled: status !== "connected"
      },
      {
        key: "hold",
        label: "Hold",
        icon: controlIcons.hold,
        onClick: toggleHold,
        active: onHold,
        disabled: status !== "connected"
      },
      {
        key: "record",
        label: "Record",
        icon: controlIcons.record,
        onClick: () => undefined,
        active: false,
        disabled: true
      },
      {
        key: "transfer",
        label: "Transfer",
        icon: controlIcons.transfer,
        onClick: () => undefined,
        active: false,
        disabled: true
      },
      {
        key: "add",
        label: "Add",
        icon: controlIcons.add,
        onClick: () => undefined,
        active: false,
        disabled: true
      },
      {
        key: "merge",
        label: "Merge",
        icon: controlIcons.merge,
        onClick: () => undefined,
        active: false,
        disabled: true
      }
    ],
    [muted, onHold, status, toggleHold, toggleMute]
  );

  useEffect(() => {
    if (status !== "connected") return;
    const interval = window.setInterval(() => {
      recordElapsed(elapsedSeconds + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [elapsedSeconds, recordElapsed, status]);

  if (!isOpen) return null;

  return (
    <div className="dialer" data-testid="voice-dialer" role="dialog" aria-label="Outbound call dialer">
      <div className="dialer__panel">
        <div className="dialer__header">
          <div>
            <p className="dialer__eyebrow">Outbound call</p>
            <h2 className="dialer__title">{displayName}</h2>
            {context.applicationId && <span className="dialer__meta">Application {context.applicationId}</span>}
          </div>
          <button
            type="button"
            className="dialer__close"
            onClick={status === "connected" || status === "ringing" || status === "dialing" ? minimizeDialer : closeDialer}
            aria-label="Close dialer"
          >
            ✕
          </button>
        </div>
        <div className="dialer__body">
          <div className="dialer__status">
            <span className={`dialer__status-pill dialer__status-pill--${statusTone}`}>{statusLabel}</span>
            <span className="dialer__timer">{formatDuration(elapsedSeconds)}</span>
          </div>
          {error && (
            <div role="status" aria-live="polite" className="text-sm text-red-600">
              {error}
            </div>
          )}
          {warning && (
            <div role="status" aria-live="polite" className="text-sm text-amber-700">
              {warning}
            </div>
          )}
          {failureReason && (
            <div role="status" aria-live="polite" className="text-sm text-slate-600">
              {formatFailureReason(failureReason)}
            </div>
          )}
          <label className="dialer__field">
            <span>Number</span>
            <input
              type="tel"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              placeholder="Enter phone number"
              disabled={isCallInProgress}
            />
          </label>
          <div className="dialer__controls">
            {controlButtons.map((control) => (
              <button
                key={control.key}
                type="button"
                className={clsx("dialer__control", { "dialer__control--active": control.active })}
                onClick={control.onClick}
                aria-pressed={control.active}
                disabled={control.disabled}
              >
                <span className="dialer__control-icon">{control.icon}</span>
                <span className="dialer__control-label">{control.label}</span>
              </button>
            ))}
          </div>
          <div className="dialer__actions">
            <Button onClick={dial} disabled={!number || isCallInProgress}>
              {status === "dialing" ? "Dialing…" : status === "ringing" ? "Ringing…" : status === "connected" ? "In call" : "Dial"}
            </Button>
            <Button variant="secondary" onClick={toggleKeypad} aria-pressed={keypadOpen} disabled={isCallSetup}>
              Keypad
            </Button>
            <Button variant="secondary" className="dialer__hangup" onClick={hangup} disabled={status === "idle"}>
              Hang up
            </Button>
          </div>
          {keypadOpen && (
            <div className="dialer__keypad" aria-label="Keypad">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  className="dialer__keypad-key"
                  onClick={() => setNumber(`${number}${digit}`)}
                  disabled={isCallSetup}
                >
                  {digit}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="dialer__footer">
          <div className="dialer__outcomes">
            {outcomeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="dialer__outcome"
                disabled={!canSelectOutcome}
                onClick={() => {
                  endCall(option.value as "completed" | "voicemail" | "no-answer" | "failed" | "canceled");
                  resetCall();
                  closeDialer();
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => {
            resetCall();
            closeDialer();
          }}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceDialer;
