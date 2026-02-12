import { useEffect, useState } from "react";
import axios from "axios";

type Contact = {
  id: string;
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
};

type Issue = {
  id: string;
  message: string;
  screenshotBase64?: string;
  status: string;
  createdAt: string;
};

type ChatEscalation = {
  id: string;
  name: string;
  email: string;
  transcript: string;
  status: string;
  createdAt: string;
};

export default function Operations() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [chats, setChats] = useState<ChatEscalation[]>([]);

  useEffect(() => {
    axios.get("/api/admin/contacts").then((res) => setContacts(res.data));
    axios.get("/api/admin/issues").then((res) => setIssues(res.data));
    axios.get("/api/admin/chats").then((res) => setChats(res.data));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Operations Dashboard</h1>

      <section>
        <h2>New Contacts</h2>
        {contacts.map((c) => (
          <div key={c.id}>
            <strong>{c.company}</strong> — {c.firstName} {c.lastName}
            <div>
              {c.email} | {c.phone}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2>Issue Reports</h2>
        {issues.map((i) => (
          <div key={i.id} style={{ marginBottom: 16 }}>
            <p>{i.message}</p>
            {i.screenshotBase64 && <img src={`data:image/png;base64,${i.screenshotBase64}`} style={{ maxWidth: 400 }} />}
            <div>Status: {i.status}</div>
          </div>
        ))}
      </section>

      <section>
        <h2>Chat Escalations</h2>
        {chats.map((chat) => (
          <div key={chat.id}>
            <strong>
              {chat.name} ({chat.email})
            </strong>
            <pre>{chat.transcript}</pre>
          </div>
        ))}
      </section>
    </div>
  );
}
