import { useCallback, useEffect, useRef } from "react";
import { useDialerStore } from "@/state/dialer.store";
import { safeNormalizeToE164 } from "@/utils/phone";
import { createTwilioDevice, fetchTwilioToken, type VoiceCall, type VoiceDevice } from "@/services/twilioVoice";

const CALL_IN_PROGRESS_STATUSES = ["dialing", "ringing", "connected"] as const;

export const useTwilioCall = () => {
  const status = useDialerStore((state) => state.status);
  const number = useDialerStore((state) => state.number);
  const muted = useDialerStore((state) => state.muted);
  const onHold = useDialerStore((state) => state.onHold);
  const startCall = useDialerStore((state) => state.startCall);
  const setStatus = useDialerStore((state) => state.setStatus);
  const endCall = useDialerStore((state) => state.endCall);
  const setError = useDialerStore((state) => state.setError);
  const setDialedNumber = useDialerStore((state) => state.setDialedNumber);
  const setMuted = useDialerStore((state) => state.setMuted);
  const setOnHold = useDialerStore((state) => state.setOnHold);

  const deviceRef = useRef<VoiceDevice | null>(null);
  const callRef = useRef<VoiceCall | null>(null);
  const endingRef = useRef(false);

  const finalizeCall = useCallback(
    (outcome?: "completed" | "no-answer" | "failed" | "canceled", finalStatus = "ended") => {
      if (endingRef.current) return;
      endingRef.current = true;
      endCall(outcome, finalStatus);
      setMuted(false);
      setOnHold(false);
      callRef.current = null;
    },
    [endCall, setMuted, setOnHold]
  );

  const attachCallHandlers = useCallback(
    (call: VoiceCall) => {
      call.on("ringing", () => setStatus("ringing"));
      call.on("accept", () => setStatus("connected"));
      call.on("disconnect", () => finalizeCall());
      call.on("cancel", () => finalizeCall("canceled"));
      call.on("reject", () => finalizeCall("failed", "failed"));
      call.on("error", (error: Error) => {
        setError(error?.message ?? "Call failed.");
        setStatus("failed");
        finalizeCall("failed", "failed");
      });
    },
    [finalizeCall, setError, setStatus]
  );

  const getDevice = useCallback(async () => {
    if (deviceRef.current) return deviceRef.current;
    const token = await fetchTwilioToken();
    if (!token) return null;
    const device = createTwilioDevice(token);
    if (!device) return null;
    deviceRef.current = device;
    return device;
  }, []);

  const dial = useCallback(async () => {
    if (!number) return;
    if (CALL_IN_PROGRESS_STATUSES.includes(status)) return;
    const normalized = safeNormalizeToE164(number);
    if (!normalized) {
      setError("Enter a valid phone number before dialing.");
      setStatus("failed");
      return;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("You are offline. Connect to the internet to place calls.");
      setStatus("failed");
      return;
    }
    setDialedNumber(normalized);
    setError(null);
    startCall();
    endingRef.current = false;
    try {
      const device = await getDevice();
      if (!device) {
        setError("Calling is currently unavailable.");
        setStatus("failed");
        return;
      }
      const connection = await device.connect({ params: { To: normalized } });
      callRef.current = connection;
      attachCallHandlers(connection);
    } catch (error) {
      setError((error as Error)?.message ?? "Call failed to start.");
      setStatus("failed");
      finalizeCall("failed", "failed");
    }
  }, [
    attachCallHandlers,
    finalizeCall,
    getDevice,
    number,
    setDialedNumber,
    setError,
    setStatus,
    startCall,
    status
  ]);

  const hangup = useCallback(() => {
    if (!callRef.current) {
      finalizeCall("canceled");
      return;
    }
    try {
      callRef.current.disconnect?.();
    } catch (error) {
      setError((error as Error)?.message ?? "Failed to end call.");
      finalizeCall("failed", "failed");
    }
  }, [finalizeCall, setError]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    try {
      callRef.current?.mute?.(next);
    } catch {
      // ignore mute failures
    }
    setMuted(next);
  }, [muted, setMuted]);

  const toggleHold = useCallback(() => {
    const next = !onHold;
    try {
      callRef.current?.hold?.(next);
    } catch {
      // ignore hold failures
    }
    setOnHold(next);
  }, [onHold, setOnHold]);

  useEffect(() => {
    return () => {
      try {
        callRef.current?.disconnect?.();
      } catch {
        // ignore cleanup errors
      }
      try {
        deviceRef.current?.destroy?.();
      } catch {
        // ignore cleanup errors
      }
    };
  }, []);

  return {
    dial,
    hangup,
    toggleMute,
    toggleHold
  };
};
