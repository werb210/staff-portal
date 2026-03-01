import { Call, Device } from "@twilio/voice-sdk";

let device: Device | null = null;
let activeCall: Call | null = null;
let tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null;
let registrationInProgress = false;
let heartbeatInterval: number | null = null;
let onlineRecoveryBound = false;

const handleOnlineRecovery = () => {
  if (!device) {
    void initVoice();
  }
};

export async function initVoice(_userId?: string): Promise<void> {
  if (device || registrationInProgress) return;

  registrationInProgress = true;

  try {
    const res = await fetch("/api/voice/token", {
      method: "POST",
      credentials: "include"
    });

    if (!res.ok) {
      registrationInProgress = false;
      return;
    }

    const { token } = (await res.json()) as { token?: string };
    if (!token) {
      registrationInProgress = false;
      return;
    }

    device = new Device(token, { logLevel: 1 });

    device.on("registered", () => {
      registrationInProgress = false;
    });

    device.on("incoming", (call: Call) => {
      if (activeCall) {
        call.reject();
        return;
      }

      activeCall = call;
      call.on("disconnect", () => {
        if (activeCall === call) {
          activeCall = null;
        }
      });

      window.dispatchEvent(new CustomEvent("incoming-call", { detail: call }));
    });

    device.on("error", () => {
      registrationInProgress = false;
    });

    device.register();
    scheduleTokenRefresh();
    startPresenceHeartbeat();

    if (!onlineRecoveryBound) {
      window.addEventListener("online", handleOnlineRecovery);
      onlineRecoveryBound = true;
    }
  } catch {
    registrationInProgress = false;
  }
}

function scheduleTokenRefresh() {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
  }

  tokenRefreshTimer = setTimeout(async () => {
    try {
      const res = await fetch("/api/voice/token", {
        method: "POST",
        credentials: "include"
      });

      if (!res.ok || !device) return;

      const { token } = (await res.json()) as { token?: string };
      if (!token) return;

      device.updateToken(token);
      scheduleTokenRefresh();
    } catch {
      // No-op: we'll retry on next refresh window.
    }
  }, 50 * 60 * 1000);
}

function startPresenceHeartbeat() {
  if (heartbeatInterval) {
    window.clearInterval(heartbeatInterval);
  }

  heartbeatInterval = window.setInterval(() => {
    if (!device) return;

    void fetch("/api/voice/presence", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: activeCall ? "busy" : "online",
        source: "portal"
      })
    });
  }, 15000);
}

export async function startOutboundCall(clientId: string) {
  if (!device || activeCall) return;

  activeCall = await device.connect({
    params: { clientId }
  });

  activeCall.on("disconnect", () => {
    activeCall = null;
  });
}

export function acceptIncoming(call: Call) {
  if (activeCall) return;

  activeCall = call;
  call.accept();
  call.on("disconnect", () => {
    if (activeCall === call) {
      activeCall = null;
    }
  });
}

export function rejectIncoming(call: Call) {
  call.reject();

  if (activeCall === call) {
    activeCall = null;
  }
}

export function destroyVoice() {
  registrationInProgress = false;

  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }

  if (heartbeatInterval) {
    window.clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  if (activeCall) {
    activeCall.disconnect();
    activeCall = null;
  }

  if (device) {
    device.destroy();
    device = null;
  }

  if (onlineRecoveryBound) {
    window.removeEventListener("online", handleOnlineRecovery);
    onlineRecoveryBound = false;
  }
}
