import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEmails, sendEmail, type EmailMessage } from '../api/communication';

const EMAIL_KEY = ['communication', 'email'];

export const useEmail = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: EMAIL_KEY,
    queryFn: getEmails,
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { to: string; subject: string; body: string }) => sendEmail(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EMAIL_KEY }),
  });

  return { listQuery, sendMutation };
};

export type { EmailMessage };
