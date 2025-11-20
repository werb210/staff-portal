import { Sidebar } from "./Sidebar";

export const MobileSidebar = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={onClose}>
      <div
        className="bg-gray-900 text-white w-64 h-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="text-right w-full mb-4 text-lg">
          ✕
        </button>
        <Sidebar className="flex" />
      </div>
    </div>
  );
};
