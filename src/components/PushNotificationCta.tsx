import { usePushNotifications } from "@/hooks/usePushNotifications";
import Button from "@/components/ui/Button";

const PushNotificationCta = () => {
  const { permission, requestPermission, isSupported } = usePushNotifications();

  if (!isSupported) return null;

  if (permission === "denied") {
    return <span className="text-xs text-slate-500">Notifications are blocked in browser settings.</span>;
  }

  if (permission === "granted") {
    return <span className="text-xs text-emerald-600">Notifications enabled</span>;
  }

  return (
    <Button variant="ghost" onClick={() => void requestPermission()}>
      Enable Notifications
    </Button>
  );
};

export default PushNotificationCta;
