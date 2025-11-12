import Card from '../components/Card';
import NotificationsPanel from '../components/NotificationsPanel';

export default function Notifications() {
  return (
    <div className="page">
      <Card title="Notifications">
        <NotificationsPanel />
      </Card>
    </div>
  );
}
