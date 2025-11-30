import React from 'react';
import ThreadItem from './ThreadItem';
import { useCommunicationsStore } from '../../state/communicationsStore';

export default function ThreadList() {
  const { threads, filter } = useCommunicationsStore();

  const filtered = threads.filter((t) => {
    if (filter === "UNREAD") return t.unread > 0;
    if (filter === "ACTIVE") return t.lastSender === "client";
    return true;
  });

  return (
    <div>
      {filtered.map((t) => (
        <ThreadItem key={t.applicationId} thread={t} />
      ))}
    </div>
  );
}
