import apiClient from "@/api/httpClient";

export type VoiceCallEvent = "ringing" | "accept" | "disconnect" | "cancel" | "reject" | "error";

export type VoiceCall = {
  on: (event: VoiceCallEvent, handler: (...args: any[]) => void) => void;
  off?: (event: VoiceCallEvent, handler: (...args: any[]) => void) => void;
  disconnect?: () => void;
  mute?: (muted: boolean) => void;
  isMuted?: () => boolean;
  hold?: (held: boolean) => void;
  isOnHold?: () => boolean;
};

export type VoiceDevice = {
  connect: (options: { params: Record<string, string> }) => VoiceCall | Promise<VoiceCall>;
  register?: () => void;
  destroy?: () => void;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  off?: (event: string, handler: (...args: any[]) => void) => void;
};

type VoiceTokenResponse = {
  token?: string;
};

const getTwilioGlobal = () => {
  if (typeof window === "undefined") return null;
  return (window as Window & { Twilio?: { Device?: new (token: string, options?: Record<string, unknown>) => VoiceDevice } })
    .Twilio;
};

export const fetchTwilioToken = async (): Promise<string | null> => {
  const response = await apiClient.get<VoiceTokenResponse>("/voice/token");
  if (!response?.token) return null;
  return response.token;
};

export const createTwilioDevice = (token: string): VoiceDevice | null => {
  const twilio = getTwilioGlobal();
  if (!twilio?.Device) return null;
  const device = new twilio.Device(token, {
    logLevel: "error",
    closeProtection: true
  });
  if (device.register) {
    device.register();
  }
  return device;
};
