// src/services/twilioVoice.ts

import { Device } from "@twilio/voice-sdk";

let device: Device | null = null;

const isTest =
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "test";

export async function initializeTwilioVoice() {
  if (isTest) {
    return;
  }

  if (device) {
    return device;
  }

  try {
    const response = await fetch("/api/twilio/token");

    if (!response.ok) {
      throw new Error("Failed to fetch Twilio token");
    }

    const data = await response.json();

    device = new Device(data.token);

    return device;
  } catch (error) {
    if (!isTest) {
      console.error("Failed to fetch Twilio token:", error);
    }
  }
}

export function destroyTwilioVoice() {
  if (device) {
    device.destroy();
    device = null;
  }
}
