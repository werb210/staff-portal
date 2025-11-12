import axios from 'axios';
import { useCallback } from 'react';
import { useTwilioNotifications } from '../hooks/useTwilioNotifications';
import { useO365Notifications } from '../hooks/useO365Notifications';

type NotifyStageChangeParams = {
  applicationId: string;
  stage: string;
  applicantPhone: string;
  applicantEmail: string;
};

export function useNotificationService() {
  const { sendSMS } = useTwilioNotifications();
  const { sendEmail } = useO365Notifications();

  const notifyStageChange = useCallback(
    async ({ applicationId, stage, applicantPhone, applicantEmail }: NotifyStageChangeParams) => {
      await sendSMS(applicantPhone, `Your application ${applicationId} moved to stage: ${stage}`);
      await sendEmail(
        applicantEmail,
        'Application Stage Update',
        `Application ${applicationId} is now in stage: ${stage}`
      );

      try {
        await axios.post('http://localhost:5000/api/notifications', {
          applicationId,
          stage,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Backend notification logging failed', err);
      }
    },
    [sendSMS, sendEmail]
  );

  return { notifyStageChange };
}
