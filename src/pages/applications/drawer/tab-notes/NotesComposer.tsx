import { useState } from "react";

const NotesComposer = ({ onSend }: { onSend: (text: string, mentions: string[]) => Promise<void> | void }) => {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!value.trim()) return;
    setSending(true);
    const mentionMatches = Array.from(value.matchAll(/@\[([A-Za-z0-9_-]+)\]/g))
      .map((match) => match[1])
      .filter((mention): mention is string => Boolean(mention));
    await onSend(value, mentionMatches);
    setValue("");
    setSending(false);
  };

  return (
    <div className="notes-composer">
      <textarea
        className="notes-composer__input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a note"
      />
      <button className="btn btn--primary" onClick={handleSend} disabled={sending} type="button">
        {sending ? "Submitting…" : "Submit"}
      </button>
    </div>
  );
};

export default NotesComposer;
