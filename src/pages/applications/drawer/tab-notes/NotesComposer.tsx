import { useState } from "react";

const NotesComposer = ({ onSend }: { onSend: (text: string) => Promise<void> | void }) => {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!value.trim()) return;
    setSending(true);
    await onSend(value);
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
        {sending ? "Sending…" : "Send"}
      </button>
    </div>
  );
};

export default NotesComposer;
