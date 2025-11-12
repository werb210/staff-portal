import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';
import type { NotificationDispatchPayload, NotificationRecord, PushSubscriptionPayload } from '../../types/notifications';

export const useNotifications = () =>
  useQuery<NotificationRecord[]>({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
    staleTime: 1000 * 10,
  });

export function useDispatchNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotificationDispatchPayload) => notificationService.dispatch(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useSubscribeToPush() {
  return useMutation({
    mutationFn: (payload: PushSubscriptionPayload) => notificationService.subscribePush(payload),
  });
}
