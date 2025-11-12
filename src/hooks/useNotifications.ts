import { useCallback, useEffect } from 'react';

export function useNotifications() {
  useEffect(() => {
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported in this browser.');
      return;
    }

    Notification.requestPermission().then((permission) => {
      console.log('Notification permission:', permission);
    });
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }, []);

  return { sendNotification };
}
