import { usePushNotifications } from "@/hooks/usePushNotifications";
import Button from "@/components/ui/Button";

const PushNotificationCta = () => {
  const { permission, requestPermission, isSupported } = usePushNotifications();

  if (!isSupported || permission !== "default") return null;

  return (
    <Button variant="ghost" onClick={() => void requestPermission()}>
      Enable Notifications
    </Button>
  );
};

export default PushNotificationCta;
