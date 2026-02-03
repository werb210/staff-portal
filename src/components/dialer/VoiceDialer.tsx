import { useEffect, useMemo } from "react";
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
            <Button onClick={dial} disabled={!number || isCallInProgress}>
              {status === "dialing" ? "Dialing…" : status === "ringing" ? "Ringing…" : status === "connected" ? "In call" : "Dial"}
            </Button>
            <Button variant="secondary" onClick={toggleMute} aria-pressed={muted} disabled={status !== "connected"}>
              {muted ? "Unmute" : "Mute"}
            </Button>
            <Button variant="secondary" onClick={toggleHold} aria-pressed={onHold} disabled={status !== "connected"}>
              {onHold ? "Resume" : "Hold"}
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
