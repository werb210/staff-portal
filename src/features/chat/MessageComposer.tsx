import React, { useRef, useState } from "react";

export type ComposerPayload = {
  text: string;
  attachments: string[];
};

type MessageComposerProps = {
  onSend: (payload: ComposerPayload) => void;
};

export function MessageComposer({ onSend }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;
    onSend({ text, attachments });
    setText("");
    setAttachments([]);
  };

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).map((f) => f.name) : [];
    setAttachments((prev) => [...prev, ...files]);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-md border border-slate-200 p-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        placeholder="Type a message to the team"
      />
      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {attachments.map((file) => (
            <span key={file} className="rounded-md bg-indigo-50 px-2 py-1 font-semibold text-indigo-700">
              {file}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-indigo-700">
          <button className="rounded-md bg-indigo-50 px-3 py-2 font-semibold hover:bg-indigo-100" onClick={() => fileInput.current?.click()}>
            Attach
          </button>
          <input ref={fileInput} type="file" className="hidden" multiple onChange={handleAttach} />
          <span className="text-xs text-slate-500">Local-only attachments</span>
        </div>
        <button
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
