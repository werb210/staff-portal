import { create } from "zustand";
import { logCallEvent } from "@/api/crm";
import { logApplicationCallEvent } from "@/api/communications";

export type DialerStatus = "idle" | "ringing" | "active" | "ended";
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
  context: DialerContext;
  status: DialerStatus;
  muted: boolean;
  onHold: boolean;
  keypadOpen: boolean;
  number: string;
  startedAt: string | null;
  elapsedSeconds: number;
  logs: DialerCallLog[];
  openDialer: (context?: DialerContext) => void;
  closeDialer: () => void;
  setNumber: (number: string) => void;
  toggleMute: () => void;
  toggleHold: () => void;
  toggleKeypad: () => void;
  startCall: () => void;
  setStatus: (status: DialerStatus) => void;
  recordElapsed: (seconds: number) => void;
  endCall: (outcome?: DialerOutcome) => DialerCallLog | null;
  resetCall: () => void;
};

const now = () => new Date().toISOString();

const resolveOutcome = (status: DialerStatus, outcome?: DialerOutcome): DialerOutcome => {
  if (outcome) return outcome;
  if (status === "active") return "completed";
  if (status === "ringing") return "no-answer";
  return "canceled";
};

export const useDialerStore = create<DialerState>((set, get) => ({
  isOpen: false,
  context: {},
  status: "idle",
  muted: false,
  onHold: false,
  keypadOpen: false,
  number: "",
  startedAt: null,
  elapsedSeconds: 0,
  logs: [],
  openDialer: (context) =>
    set((state) => {
      const inProgress = state.status === "active" || state.status === "ringing";
      const nextNumber = inProgress ? state.number : context?.phone ?? state.number;
      return {
        isOpen: true,
        context: { ...state.context, ...context },
        number: nextNumber,
        status: inProgress ? state.status : "idle",
        muted: inProgress ? state.muted : false,
        onHold: inProgress ? state.onHold : false,
        keypadOpen: inProgress ? state.keypadOpen : false,
        startedAt: inProgress ? state.startedAt : null,
        elapsedSeconds: inProgress ? state.elapsedSeconds : 0
      };
    }),
  closeDialer: () => set({ isOpen: false }),
  setNumber: (number) => set({ number }),
  toggleMute: () => set((state) => ({ muted: !state.muted })),
  toggleHold: () => set((state) => ({ onHold: !state.onHold })),
  toggleKeypad: () => set((state) => ({ keypadOpen: !state.keypadOpen })),
  startCall: () =>
    set((state) => {
      if (!state.number || state.status === "active" || state.status === "ringing") return state;
      return { status: "ringing", startedAt: now(), elapsedSeconds: 0 };
    }),
  setStatus: (status) => set({ status }),
  recordElapsed: (seconds) => set({ elapsedSeconds: seconds }),
  endCall: (outcome) => {
    const state = get();
    if (state.status === "idle") return null;
    const endedAt = now();
    const startedAt = state.startedAt ?? endedAt;
    const durationSeconds = Math.max(
      0,
      Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000)
    );
    const resolvedOutcome = resolveOutcome(state.status, outcome);
    const resolvedNumber = state.number || "Unknown";
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
      status: "ended",
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
      elapsedSeconds: 0
    })
}));
