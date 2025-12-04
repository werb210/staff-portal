import { useEffect, useRef, useState } from "react";
import { ChatAPI } from "../../api/chat";
import {
  sendTyping,
  subscribe,
  subscribePresence,
  subscribeTyping,
} from "../../realtime/wsClient";
import "../../styles/chat.css";

export function ChatWindow({ currentUserId, otherUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [otherPresence, setOtherPresence] = useState(null);
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

    subscribeTyping((msg) => {
      if (msg.fromUserId === otherUserId) {
        setIsOtherTyping(msg.isTyping);
      }
    });

    subscribePresence((p) => {
      if (p.userId === otherUserId) {
        setOtherPresence(p);
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
      <div className="chat-header">
        <span>{otherUserId}</span>
        <span className={otherPresence?.online ? "online" : "offline"}>
          {otherPresence?.online ? "Online" : "Offline"}
        </span>
      </div>

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

      {isOtherTyping && <div className="typing-indicator">Typing...</div>}

      <div className="input-bar">
        <input
          value={input}
          onChange={(e) => {
            const value = e.target.value;
            setInput(value);

            sendTyping(otherUserId, value.length > 0);
          }}
          placeholder="Type message…"
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
