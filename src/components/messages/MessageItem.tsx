import React from "react";

export default function MessageItem({ msg }) {
  return (
    <div className="border rounded p-2 bg-gray-50">
      <div className="text-xs text-gray-400">
        {msg.direction.toUpperCase()} • {msg.channel.toUpperCase()}
      </div>
      <div className="text-sm mt-1">{msg.body}</div>
      <div className="text-xs text-gray-500 mt-1">
        {new Date(msg.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
