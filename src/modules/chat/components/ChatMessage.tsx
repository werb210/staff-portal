import type { ChatMessage as ChatMessageType } from "../types";

type ChatMessageProps = {
  message: ChatMessageType;
};

const roleStyles: Record<ChatMessageType["role"], string> = {
  user: "bg-slate-100 text-slate-900 self-start",
  ai: "bg-blue-500 text-white self-start",
  staff: "bg-slate-800 text-white self-end"
};

const ChatMessage = ({ message }: ChatMessageProps) => (
  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm shadow-sm ${roleStyles[message.role]}`}>
    <p>{message.message}</p>
    <p className="mt-1 text-[11px] opacity-70">{new Date(message.created_at).toLocaleString()}</p>
  </div>
);

export default ChatMessage;
