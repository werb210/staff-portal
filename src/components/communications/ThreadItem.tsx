import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ThreadItem({ thread }: any) {
  const navigate = useNavigate();

  function openThread() {
    navigate(`/applications/${thread.applicationId}?tab=Chat`);
  }

  return (
    <div
      onClick={openThread}
      style={{
        marginBottom: "15px",
        padding: "10px",
        background: "white",
        borderRadius: "6px",
        cursor: "pointer",
        borderLeft: thread.unread > 0 ? "4px solid red" : "4px solid #ccc",
      }}
    >
      <strong>{thread.businessName}</strong>
      <div>{thread.applicantName}</div>
      <div style={{ marginTop: "5px", color: "#555" }}>
        {thread.lastSender}: {thread.lastMessage}
      </div>
      <div style={{ fontSize: "12px", marginTop: "5px" }}>
        Updated: {new Date(thread.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}
