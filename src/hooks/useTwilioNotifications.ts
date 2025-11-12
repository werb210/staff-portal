import { useCallback } from 'react';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export function useTwilioNotifications() {
  const sendSMS = useCallback(async (to: string, body: string) => {
    try {
      await client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });
    } catch (err) {
      console.error('Twilio SMS failed', err);
    }
  }, []);

  return { sendSMS };
}
