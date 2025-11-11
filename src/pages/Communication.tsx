import { useEffect, useState } from 'react';
import api from '../services/api';

type Message = {
  id: string;
  recipient?: string;
  sender?: string;
  body?: string;
  status?: string;
  sent_at?: string;
  [key: string]: unknown;
};

export default function Communication() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await api.get<Message[]>('/api/communication/sms');
        setMessages(data);
        setError(null);
      } catch (err) {
        setError('Unable to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div>
          <h2>Communication Center</h2>
          <p style={{ color: 'var(--color-muted)' }}>
            SMS engagement history with borrowers and partners. Monitor delivery, failures, and replies.
          </p>
        </div>
      </div>
      <div className="card">
        <h3>SMS Messages</h3>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && messages.length === 0 && <p>No SMS history yet.</p>}
        {!loading && !error && messages.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Recipient</th>
                <th>Sender</th>
                <th>Message</th>
                <th>Status</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>{message.id}</td>
                  <td>{message.recipient || 'N/A'}</td>
                  <td>{message.sender || 'N/A'}</td>
                  <td style={{ maxWidth: '320px' }}>{message.body || '-'}</td>
                  <td><span className="status-pill">{message.status || 'Pending'}</span></td>
                  <td>{message.sent_at ? new Date(message.sent_at).toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
