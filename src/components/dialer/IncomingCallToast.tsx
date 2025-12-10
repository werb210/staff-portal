import Button from "@/components/ui/Button";

interface IncomingCallToastProps {
  from: string;
  onAccept: () => void;
  onViewRecord: () => void;
  onDismiss: () => void;
}

const IncomingCallToast = ({ from, onAccept, onViewRecord, onDismiss }: IncomingCallToastProps) => (
  <div className="incoming-call" role="alert" data-testid="incoming-call-toast">
    <div>Incoming call from {from}</div>
    <div className="flex gap-2 mt-2">
      <Button onClick={onAccept}>Accept</Button>
      <Button variant="secondary" onClick={onViewRecord}>
        Open CRM Record
      </Button>
      <Button variant="secondary" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  </div>
);

export default IncomingCallToast;
