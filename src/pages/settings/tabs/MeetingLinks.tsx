import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useSettingsStore } from "@/state/settings.store";

const MeetingLinks = () => {
  const { meetingLink, updateMeetingLink, statusMessage } = useSettingsStore();
  const [link, setLink] = useState(meetingLink);
  const [error, setError] = useState<string | undefined>();

  const isValidLink = useMemo(() => {
    try {
      // eslint-disable-next-line no-new
      new URL(link);
      return true;
    } catch (error) {
      return false;
    }
  }, [link]);

  const onSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidLink) {
      setError("Enter a valid URL");
      return;
    }
    updateMeetingLink(link);
    setError(undefined);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setError("Link copied to clipboard");
    } catch (error) {
      setError("Clipboard unavailable");
    }
  };

  return (
    <form className="settings-panel" onSubmit={onSave} aria-label="Meeting links">
      <header>
        <h2>Meeting booking link</h2>
        <p>Share your Office 365 booking URL for the calendar experience.</p>
      </header>

      <Input
        label="Public meeting URL"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        error={error}
        placeholder="https://bookings.office.com/your-link"
      />

      <div className="settings-actions">
        <Button type="submit">Save link</Button>
        <Button type="button" variant="secondary" onClick={copyLink} aria-label="Copy meeting link">
          Copy
        </Button>
        <a className="ui-button ui-button--ghost" href={link} target="_blank" rel="noreferrer">
          Open link
        </a>
        {statusMessage && <span role="status">{statusMessage}</span>}
      </div>

      <div className="link-preview">
        <p className="ui-field__label">Preview</p>
        <a href={link} target="_blank" rel="noreferrer">
          {link}
        </a>
      </div>
    </form>
  );
};

export default MeetingLinks;
