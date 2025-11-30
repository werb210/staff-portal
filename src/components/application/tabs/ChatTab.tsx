import React, { useState } from 'react';
import { useApplicationStore } from '../../../state/applicationStore';
import { api } from '../../../api/client';

export default function ChatTab() {
  const messages = useApplicationStore((s) => s.messages);
  const reload = useApplicationStore((s) => s.reloadChat);
  const app = useApplicationStore((s) => s.application);
  const [text, setText] = useState("");

  if (!app) return null;

  async function send() {
    if (!app) return;

    const client = api();
    await client.post(`/chat/send`, {
      applicationId: app.id,
      sender: "staff",
      body: text,
    });
    setText("");
    reload();
  }

  return (
    <div>
      <h2>Chat</h2>

      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          background: "#fafafa",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "6px",
        }}
      >
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: "10px" }}>
            <strong>{m.sender}</strong>: {m.body}
          </div>
        ))}
      </div>

      <textarea
        style={{ width: "100%", height: "80px" }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={send}>Send</button>
    </div>
  );
}
