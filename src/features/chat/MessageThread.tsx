import React from "react";

export type Message = {
  id: string;
  from: string;
  text: string;
  time: string;
  attachments?: string[];
};

type MessageThreadProps = {
  messages: Message[];
};

export function MessageThread({ messages }: MessageThreadProps) {
  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div key={message.id} className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
            {message.from.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{message.from}</span>
              <span>{message.time}</span>
            </div>
            <div className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-800 shadow-sm">{message.text}</div>
            {message.attachments && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {message.attachments.map((file) => (
                  <span key={file} className="rounded-md bg-indigo-50 px-2 py-1 font-semibold text-indigo-700">
                    {file}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
