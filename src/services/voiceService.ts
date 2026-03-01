import { Device, Call } from "@twilio/voice-sdk";

let device: Device | null = null;
let activeCall: Call | null = null;
let refreshTimer: number | null = null;
let initializing = false;

export type CallState = "idle" | "connecting" | "connected" | "ended" | "error";

let state: CallState = "idle";
const listeners = new Set<(s: CallState) => void>();

function setState(s: CallState) {
  state = s;
  listeners.forEach((fn) => fn(s));
}

export function subscribe(fn: (s: CallState) => void) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

async function fetchToken() {
  const res = await fetch("/api/voice/token", {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok) throw new Error("token_failed");
  return res.json() as Promise<{ token: string }>;
}

export async function initVoice() {
  if (location.protocol !== "https:" && location.hostname !== "localhost") {
    console.error("Voice requires HTTPS");
    return;
  }

  if (device || initializing) return;

  initializing = true;

  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });

    const { token } = await fetchToken();

    device = new Device(token, { logLevel: 1 });

    device.on("registered", () => {
      initializing = false;
    });

    device.on("error", () => {
      setState("error");
    });

    device.on("incoming", (call) => {
      if (activeCall) {
        call.reject();
        return;
      }
      activeCall = call;
      call.accept();

      call.on("accept", () => {
        setState("connected");
      });

      call.on("disconnect", () => {
        activeCall = null;
        setState("ended");
      });
    });

    device.register();
    scheduleRefresh();
  } catch {
    setState("error");
    initializing = false;
  }
}

function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);

  refreshTimer = window.setTimeout(async () => {
    if (!device) return;

    try {
      const { token } = await fetchToken();
      device.updateToken(token);
      scheduleRefresh();
    } catch {
      setState("error");
    }
  }, 50 * 60 * 1000);
}

export async function startCall() {
  if (!device || activeCall) return;

  setState("connecting");

  try {
    activeCall = await device.connect({});

    activeCall.on("accept", () => {
      setState("connected");
    });

    activeCall.on("disconnect", () => {
      activeCall = null;
      setState("ended");
    });
  } catch {
    setState("error");
  }
}

export function endCall() {
  if (activeCall) {
    activeCall.disconnect();
    activeCall = null;
  }
}

export function destroyVoice() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  if (activeCall) {
    activeCall.disconnect();
    activeCall = null;
  }

  if (device) {
    device.destroy();
    device = null;
  }

  initializing = false;
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    if (!device) {
      void initVoice();
    }
  });
}
