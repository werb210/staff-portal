import { create } from "zustand";
import { logCallEvent } from "@/api/crm";
import { logApplicationCallEvent } from "@/api/communications";

export type DialerStatus = "idle" | "dialing" | "ringing" | "connected" | "ended" | "failed";
export type DialerOutcome = "completed" | "no-answer" | "failed" | "canceled";

export type DialerContext = {
  contactId?: string;
  contactName?: string;
  applicationId?: string;
  applicationName?: string;
  phone?: string;
  source?: "crm" | "pipeline" | "global";
};

export type DialerCallLog = {
  id: string;
  contactId?: string;
  applicationId?: string;
  number: string;
  durationSeconds: number;
  outcome: DialerOutcome;
  startedAt: string;
  endedAt: string;
};

export type DialerState = {
  isOpen: boolean;
  isMinimized: boolean;
  context: DialerContext;
  status: DialerStatus;
  muted: boolean;
  onHold: boolean;
  keypadOpen: boolean;
  number: string;
  dialedNumber: string | null;
  error: string | null;
  startedAt: string | null;
  elapsedSeconds: number;
  logs: DialerCallLog[];
  openDialer: (context?: DialerContext) => void;
  closeDialer: () => void;
  minimizeDialer: () => void;
  setNumber: (number: string) => void;
  setDialedNumber: (number: string | null) => void;
  setError: (message: string | null) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  toggleHold: () => void;
  setOnHold: (onHold: boolean) => void;
  toggleKeypad: () => void;
  startCall: () => void;
  setStatus: (status: DialerStatus) => void;
  recordElapsed: (seconds: number) => void;
  endCall: (outcome?: DialerOutcome, finalStatus?: DialerStatus) => DialerCallLog | null;
  resetCall: () => void;
};

const now = () => new Date().toISOString();

const resolveOutcome = (status: DialerStatus, outcome?: DialerOutcome): DialerOutcome => {
  if (outcome) return outcome;
  if (status === "connected") return "completed";
  if (status === "dialing" || status === "ringing") return "no-answer";
  if (status === "failed") return "failed";
  return "canceled";
};

export const useDialerStore = create<DialerState>((set, get) => ({
  isOpen: false,
  isMinimized: false,
  context: {},
  status: "idle",
  muted: false,
  onHold: false,
  keypadOpen: false,
  number: "",
  dialedNumber: null,
  error: null,
  startedAt: null,
  elapsedSeconds: 0,
  logs: [],
  openDialer: (context) =>
    set((state) => {
      const inProgress = ["dialing", "ringing", "connected"].includes(state.status);
      const nextNumber = inProgress ? state.number : context?.phone ?? state.number;
      return {
        isOpen: true,
        isMinimized: false,
        context: { ...state.context, ...context },
        number: nextNumber,
        status: inProgress ? state.status : "idle",
        muted: inProgress ? state.muted : false,
        onHold: inProgress ? state.onHold : false,
        keypadOpen: inProgress ? state.keypadOpen : false,
        dialedNumber: inProgress ? state.dialedNumber : null,
        error: inProgress ? state.error : null,
        startedAt: inProgress ? state.startedAt : null,
        elapsedSeconds: inProgress ? state.elapsedSeconds : 0
      };
    }),
  closeDialer: () => set({ isOpen: false, isMinimized: false }),
  minimizeDialer: () => set({ isOpen: false, isMinimized: true }),
  setNumber: (number) => set({ number }),
  setDialedNumber: (number) => set({ dialedNumber: number }),
  setError: (message) => set({ error: message }),
  toggleMute: () => set((state) => ({ muted: !state.muted })),
  setMuted: (muted) => set({ muted }),
  toggleHold: () => set((state) => ({ onHold: !state.onHold })),
  setOnHold: (onHold) => set({ onHold }),
  toggleKeypad: () => set((state) => ({ keypadOpen: !state.keypadOpen })),
  startCall: () =>
    set((state) => {
      if (!state.number || ["dialing", "ringing", "connected"].includes(state.status)) return state;
      return { status: "dialing", startedAt: now(), elapsedSeconds: 0 };
    }),
  setStatus: (status) => set({ status }),
  recordElapsed: (seconds) => set({ elapsedSeconds: seconds }),
  endCall: (outcome, finalStatus = "ended") => {
    const state = get();
    if (state.status === "idle") return null;
    const endedAt = now();
    const startedAt = state.startedAt ?? endedAt;
    const durationSeconds = Math.max(
      0,
      Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000)
    );
    const resolvedOutcome = resolveOutcome(state.status, outcome);
    const resolvedNumber = state.dialedNumber || state.number || "Unknown";
    const log: DialerCallLog = {
      id: `call-${Date.now()}`,
      contactId: state.context.contactId,
      applicationId: state.context.applicationId,
      number: resolvedNumber,
      durationSeconds,
      outcome: resolvedOutcome,
      startedAt,
      endedAt
    };

    if (state.context.contactId) {
      void logCallEvent({
        contactId: state.context.contactId,
        number: resolvedNumber,
        durationSeconds,
        outcome: resolvedOutcome
      });
    }
    if (state.context.applicationId) {
      void logApplicationCallEvent({
        applicationId: state.context.applicationId,
        number: resolvedNumber,
        durationSeconds,
        outcome: resolvedOutcome
      });
    }

    set({
      status: finalStatus,
      elapsedSeconds: durationSeconds,
      logs: [log, ...state.logs]
    });

    return log;
  },
  resetCall: () =>
    set({
      status: "idle",
      muted: false,
      onHold: false,
      keypadOpen: false,
      startedAt: null,
      elapsedSeconds: 0,
      dialedNumber: null,
      error: null
    })
}));
