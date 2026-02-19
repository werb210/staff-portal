import { Device } from "@twilio/voice-sdk";
import { logger } from "@/utils/logger";

export type VoiceCallEvent = "ringing" | "accept" | "disconnect" | "cancel" | "reject" | "error";

export type VoiceCall = {
  on: (event: VoiceCallEvent, handler: (...args: any[]) => void) => void;
  off?: (event: VoiceCallEvent, handler: (...args: any[]) => void) => void;
  accept?: () => void;
  disconnect?: () => void;
  mute?: (muted: boolean) => void;
  isMuted?: () => boolean;
  hold?: (held: boolean) => void;
  isOnHold?: () => boolean;
};

export type VoiceDevice = {
  connect: (options: { params: Record<string, string> }) => VoiceCall | Promise<VoiceCall>;
  register: () => void;
  destroy?: () => void;
  state?: string;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  off?: (event: string, handler: (...args: any[]) => void) => void;
};

type VoiceTokenResponse = {
  token?: string;
};

export const fetchTwilioToken = async (): Promise<string | null> => {
  try {
    const response = await fetch("/api/twilio/token", {
      method: "GET",
      credentials: "include"
    });
    if (!response.ok) {
      throw new Error(`Token request failed with status ${response.status}`);
    }
    const payload = (await response.json()) as VoiceTokenResponse;
    if (!payload?.token) return null;
    return payload.token;
  } catch (error) {
    logger.error("Failed to fetch Twilio token:", { error });
    return null;
  }
};

export const createTwilioDevice = (token: string): VoiceDevice | null => {
  if (!token) return null;
  const device = new Device(token, {
    logLevel: 1
  });
  device.register();
  return device;
};
