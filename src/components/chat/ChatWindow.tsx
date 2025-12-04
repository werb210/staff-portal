import { useEffect, useRef, useState } from "react";
import { ChatAPI } from "../../api/chat";
import { subscribe } from "../../realtime/wsClient";
import "../../styles/chat.css";

export function ChatWindow({ currentUserId, otherUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ChatAPI.getThread(currentUserId, otherUserId).then(setMessages);

    subscribe((msg) => {
      if (msg.type === "chat_message") {
        const m = msg.payload;
        if (
          (m.fromUserId === currentUserId && m.toUserId === otherUserId) ||
          (m.fromUserId === otherUserId && m.toUserId === currentUserId)
        ) {
          setMessages((prev) => [...prev, m]);
        }
      }
    });
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    await ChatAPI.sendMessage({
      fromUserId: currentUserId,
      toUserId: otherUserId,
      body: input,
    });
    setInput("");
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.fromUserId === currentUserId ? "msg-outgoing" : "msg-incoming"}
          >
            {m.body}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="input-bar">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message…"
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
