export default function MessageListEmpty() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-center px-6">
      <p className="text-lg font-medium mb-2">No messages yet</p>
      <p className="text-sm">
        Start the conversation and it will appear here.
      </p>
    </div>
  );
}
