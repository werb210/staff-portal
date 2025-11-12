import { communicationService } from './communicationService';

interface StageChangePayload {
  applicationId: string;
  stage: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
}

export async function notifyStageChange(payload: StageChangePayload) {
  const promises: Promise<unknown>[] = [];
  if (payload.borrowerPhone) {
    promises.push(
      communicationService.sendSMS({
        to: payload.borrowerPhone,
        message: `Your application ${payload.applicationId} moved to ${payload.stage}.`,
        applicationId: payload.applicationId,
      })
    );
  }
  if (payload.borrowerEmail) {
    promises.push(
      communicationService.sendEmail({
        to: payload.borrowerEmail,
        subject: 'Application Update',
        body: `Application ${payload.applicationId} is now ${payload.stage}.`,
        applicationId: payload.applicationId,
      })
    );
  }
  await Promise.all(promises);
}
