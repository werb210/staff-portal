import { Call, Device } from "@twilio/voice-sdk";

let device: Device | null = null;
let activeCall: Call | null = null;
let heartbeatInterval: number | null = null;

export async function initVoice(_userId: string) {
  try {
    const res = await fetch("/api/voice/token", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) return;

    const { token } = (await res.json()) as { token?: string; identity?: string };
    if (!token) return;

    device?.destroy();
    device = new Device(token, {
      logLevel: 1
    });

    device.on("incoming", (call: Call) => {
      window.dispatchEvent(new CustomEvent("incoming-call", { detail: call }));
    });

    device.register();

    startPresenceHeartbeat();
  } catch {
    // Do nothing when voice token/bootstrap fails.
  }
}

function startPresenceHeartbeat() {
  if (heartbeatInterval) {
    window.clearInterval(heartbeatInterval);
  }

  heartbeatInterval = window.setInterval(() => {
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
  if (!device) return;

  const res = await fetch("/api/voice/call", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId })
  });

  if (!res.ok) return;

  const { callId } = (await res.json()) as { callId?: string };
  if (!callId) return;

  activeCall = await device.connect({
    params: { callId }
  });

  activeCall.on("disconnect", () => {
    activeCall = null;
  });
}

export function acceptIncoming(call: Call) {
  activeCall = call;
  call.accept();
}

export function rejectIncoming(call: Call) {
  call.reject();
}
