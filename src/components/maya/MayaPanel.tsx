import ChatInterface from "@/components/maya/ChatInterface";

type MayaPanelProps = {
  open: boolean;
  onClose: () => void;
};

export default function MayaPanel({ open, onClose }: MayaPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed left-0 top-0 z-50 h-full w-96 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <h2 className="font-bold">Maya Assistant</h2>
        <button onClick={onClose} className="text-sm text-slate-600">
          Close
        </button>
      </div>
      <ChatInterface />
    </div>
  );
}
