import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { useCalls } from '../../hooks/useCalls';

const CallsPage = () => {
  const { listQuery, logMutation } = useCalls();
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    logMutation.mutate({ contact, notes });
    setNotes('');
  };

  return (
    <div className="communication-pane">
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Contact
          <input value={contact} onChange={(event) => setContact(event.target.value)} required />
        </label>
        <label>
          Notes
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        <Button type="submit" disabled={logMutation.isPending}>
          Log Call
        </Button>
      </form>
      <div className="card">
        <h3>Recent Calls</h3>
        {listQuery.isLoading ? (
          <Spinner />
        ) : (
          <ul className="timeline">
            {(listQuery.data ?? []).map((call) => (
              <li key={call.id}>
                <strong>{call.contact}</strong>
                <p>{call.status}</p>
                <span>
                  {call.duration} seconds • {new Date(call.startedAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CallsPage;
