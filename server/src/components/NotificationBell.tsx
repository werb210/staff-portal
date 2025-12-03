import { useEffect, useState, useContext } from "react";
import { NotificationStreamContext } from "../context/NotificationStreamProvider";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const { events }: any = useContext(NotificationStreamContext);

  useEffect(() => {
    const newNotes = events.filter((e: any) => e.event === "notification");
    if (newNotes.length) {
      setCount((c) => c + newNotes.length);
    }
  }, [events]);

  return (
    <div className="relative">
      <span className="icon-bell" />
      {count > 0 && (
        <span className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
          {count}
        </span>
      )}
    </div>
  );
}
