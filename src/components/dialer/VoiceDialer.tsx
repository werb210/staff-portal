import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { Contact } from "@/api/crm";
import { logCall, requestVoiceToken } from "@/api/communications";

interface VoiceDialerProps {
  visible: boolean;
  contact: Contact;
  onClose: () => void;
  onCallLogged?: (summary: string) => void;
}

const VoiceDialer = ({ visible, contact, onClose, onCallLogged }: VoiceDialerProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState("idle");
  const [muted, setMuted] = useState(false);
  const [onHold, setOnHold] = useState(false);

  useEffect(() => {
    if (!visible) return;
    requestVoiceToken().then((receivedToken) => setToken(receivedToken));
  }, [visible]);

  if (!visible) return null;

  const handleCall = () => {
    setStatus("in-call");
  };

  const handleHangup = async () => {
    setStatus("ended");
    const summary = `Call with ${contact.name}`;
    await logCall(contact.id, summary);
    onCallLogged?.(summary);
    onClose();
  };

  return (
    <div className="dialer" data-testid="voice-dialer">
      <Card
        title={`Dialer — ${contact.name}`}
        actions={
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        }
      >
        <p>Twilio token: {token ?? "Requesting..."}</p>
        <div className="flex gap-2 my-2">
          <Button onClick={handleCall}>Dial</Button>
          <Button variant="secondary" onClick={() => setMuted((m) => !m)}>
            {muted ? "Unmute" : "Mute"}
          </Button>
          <Button variant="secondary" onClick={() => setOnHold((h) => !h)}>
            {onHold ? "Resume" : "Hold"}
          </Button>
          <Button variant="secondary">Transfer</Button>
          <Button variant="secondary" onClick={handleHangup}>
            Hang up
          </Button>
        </div>
        <p>Status: {status}</p>
      </Card>
    </div>
  );
};

export default VoiceDialer;
