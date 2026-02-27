import { Device } from "@twilio/voice-sdk";

type VoiceDevice = InstanceType<typeof Device>;

let device: VoiceDevice | null = null;

export async function fetchTwilioToken(): Promise<string> {
  const response = await fetch("/api/twilio/token", { credentials: "include" });
  if (!response.ok) {
    throw new Error("Failed to fetch Twilio token");
  }
  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error("Missing Twilio token");
  }
  return data.token;
}

export function createTwilioDevice(token: string): VoiceDevice {
  return new Device(token);
}

export async function initializeTwilioVoice() {
  if (device) return device;
  const token = await fetchTwilioToken();
  device = createTwilioDevice(token);
  return device;
}

export function destroyTwilioVoice() {
  device?.destroy();
  device = null;
}
