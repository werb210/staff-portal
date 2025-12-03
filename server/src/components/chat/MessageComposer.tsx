import { useState } from "react";

interface MessageComposerProps {
  threadId: string;
  senderId: string;
  recipientId: string;
}

export default function MessageComposer({ threadId, senderId, recipientId }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;

    setSending(true);
    try {
      await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          senderId,
          recipientId,
          body,
        }),
      });
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border-t bg-white">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border p-2 rounded"
        placeholder="Type a message..."
        disabled={sending}
      />
      <button
        onClick={send}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={sending}
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
