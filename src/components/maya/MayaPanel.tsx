import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type MayaPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MayaPanel({ isOpen, onClose }: MayaPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isEscalated, setIsEscalated] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    const response = await fetch(`${import.meta.env.VITE_AGENT_URL}/maya`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mode: "staff",
        sessionId: "staff-session",
        message: input
      })
    });

    const data = (await response.json()) as { reply?: string; escalated?: boolean };

    setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "" }]);
    setIsEscalated(Boolean(data.escalated));
    setInput("");
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: isOpen ? 0 : "-400px",
        width: "400px",
        height: "100vh",
        background: "#111",
        color: "#fff",
        transition: "left 0.3s ease",
        padding: "1rem",
        zIndex: 1000
      }}
    >
      <button onClick={onClose}>Close</button>

      <div style={{ height: "80%", overflowY: "auto" }}>
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`}>
            <strong>{message.role === "user" ? "You" : "Maya"}:</strong>
            <div>{message.content}</div>
          </div>
        ))}
      </div>

      {isEscalated && <div style={{ color: "red" }}>Escalation triggered</div>}

      <div>
        <input value={input} onChange={(e) => setInput(e.target.value)} style={{ width: "80%" }} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
