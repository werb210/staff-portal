import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import {
  useContacts,
  useContactDetails,
  useContactTimeline,
  type Contact,
} from '../../hooks/useContacts';

interface ContactDrawerProps {
  contact: Contact;
  onClose: () => void;
}

const ContactDrawer = ({ contact, onClose }: ContactDrawerProps) => {
  const { createMutation, updateMutation, deleteMutation } = useContacts();
  const isNew = contact.id === 'new';

  const [formState, setFormState] = useState({
    name: contact.name,
    email: contact.email,
    phone: contact.phone ?? '',
    company: contact.company ?? '',
    status: contact.status ?? 'active',
  });

  const detailQuery = useContactDetails(isNew ? null : contact.id);
  const timeline = useContactTimeline(isNew ? null : contact.id);

  useEffect(() => {
    if (detailQuery?.data) {
      setFormState({
        name: detailQuery.data.name,
        email: detailQuery.data.email,
        phone: detailQuery.data.phone ?? '',
        company: detailQuery.data.company ?? '',
        status: detailQuery.data.status ?? 'active',
      });
    }
  }, [detailQuery?.data]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isNew) {
      await createMutation.mutateAsync(formState);
    } else {
      await updateMutation.mutateAsync({ id: contact.id, input: formState });
    }

    onClose();
  };

  const handleDelete = async () => {
    if (!isNew) {
      await deleteMutation.mutateAsync(contact.id);
      onClose();
    }
  };

  if (detailQuery?.isLoading) {
    return <Spinner />;
  }

  return (
    <form className="drawer-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input
          type="text"
          value={formState.name}
          onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
      </label>
      <label>
        Email
        <input
          type="email"
          value={formState.email}
          onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
      </label>
      <label>
        Phone
        <input
          type="tel"
          value={formState.phone}
          onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
        />
      </label>
      <label>
        Company
        <input
          type="text"
          value={formState.company}
          onChange={(event) => setFormState((prev) => ({ ...prev, company: event.target.value }))}
        />
      </label>
      <label>
        Status
        <select
          value={formState.status}
          onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
        >
          <option value="active">Active</option>
          <option value="prospect">Prospect</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      <div className="drawer-footer">
        <Button type="submit">{isNew ? 'Create Contact' : 'Save Changes'}</Button>
        {!isNew && (
          <Button type="button" variant="ghost" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
      {timeline.isLoading ? (
        <Spinner />
      ) : (
        <section className="timeline">
          <h3>Timeline</h3>
          <ul>
            {timeline.data?.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </section>
      )}
    </form>
  );
};

export default ContactDrawer;
