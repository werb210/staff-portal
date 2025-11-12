import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { useSms } from '../../hooks/useSMS';

const SmsPage = () => {
  const { listQuery, sendMutation } = useSms();
  const [to, setTo] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMutation.mutate({ to, body });
    setBody('');
  };

  return (
    <div className="communication-pane">
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          To
          <input value={to} onChange={(event) => setTo(event.target.value)} required />
        </label>
        <label>
          Message
          <textarea value={body} onChange={(event) => setBody(event.target.value)} required />
        </label>
        <Button type="submit" disabled={sendMutation.isPending}>
          Send Message
        </Button>
      </form>
      <div className="card">
        <h3>Recent Messages</h3>
        {listQuery.isLoading ? (
          <Spinner />
        ) : (
          <ul className="timeline">
            {(listQuery.data ?? []).map((message) => (
              <li key={message.id}>
                <strong>{message.to}</strong>
                <p>{message.body}</p>
                <span>{message.sentAt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SmsPage;
