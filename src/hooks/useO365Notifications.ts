import { Client, type AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import 'isomorphic-fetch';

const credential = new ClientSecretCredential(
  process.env.O365_TENANT_ID!,
  process.env.O365_CLIENT_ID!,
  process.env.O365_CLIENT_SECRET!
);

const authProvider: AuthenticationProvider = {
  getAccessToken: async () => {
    const token = await credential.getToken('https://graph.microsoft.com/.default');
    return token?.token ?? '';
  }
};

const graphClient = Client.initWithMiddleware({ authProvider });

export function useO365Notifications() {
  const sendEmail = async (to: string, subject: string, body: string) => {
    try {
      await graphClient.api('/users/me/sendMail').post({
        message: {
          subject,
          body: { contentType: 'Text', content: body },
          toRecipients: [{ emailAddress: { address: to } }]
        }
      });
    } catch (err) {
      console.error('O365 email failed', err);
    }
  };

  return { sendEmail };
}
