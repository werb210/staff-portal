import { ContactCard } from '../../components/CRM/ContactCard';
import { FollowUpTimeline } from '../../components/CRM/FollowUpTimeline';
import { TaskList } from '../../components/CRM/TaskList';
import {
  useAssignContact,
  useCRMContacts,
  useCRMReminders,
  useCRMTasks,
  useScheduleReminder,
  useUpdateCRMTask,
} from '../../hooks/api/useCRM';
import { useDataStore } from '../../store/dataStore';

const activeFilter = (status: string) => status !== 'inactive';

export default function CRM() {
  const { contacts, tasks, reminders, communicationThreads } = useDataStore();
  const contactsQuery = useCRMContacts();
  const tasksQuery = useCRMTasks();
  const remindersQuery = useCRMReminders();
  const updateTaskMutation = useUpdateCRMTask();
  const scheduleReminderMutation = useScheduleReminder();
  const assignContactMutation = useAssignContact();

  return (
    <div className="page crm">
      <section className="card crm__contacts">
        <header className="card__header">
          <h2>Active Contacts</h2>
          <span>
            {contactsQuery.isLoading ? 'Loading…' : `${contacts.filter((contact) => activeFilter(contact.status)).length} active`}
          </span>
        </header>
        {contactsQuery.isError && <p className="error">Unable to load contacts. Please retry.</p>}
        <div className="crm__contact-grid">
          {contacts
            .filter((contact) => activeFilter(contact.status))
            .map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onAssign={(contactId) =>
                  assignContactMutation.mutate({ contactId, ownerId: 'auto-routing' })
                }
              />
            ))}
          {contactsQuery.isLoading && <p>Syncing contact data…</p>}
          {!contactsQuery.isLoading && contacts.length === 0 && <p className="empty-state">No contacts found for this silo.</p>}
        </div>
      </section>

      <section className="card crm__tasks">
        <header className="card__header">
          <h2>Task Queue</h2>
          <span>
            {tasksQuery.isLoading ? 'Loading…' : `${tasks.filter((task) => task.status !== 'completed').length} open`}
          </span>
        </header>
        {tasksQuery.isError && <p className="error">Unable to load tasks.</p>}
        <TaskList
          tasks={tasks.filter((task) => task.status !== 'completed')}
          onComplete={(taskId) => updateTaskMutation.mutate({ id: taskId, status: 'completed' })}
        />
      </section>

      <section className="card crm__follow-ups">
        <header className="card__header">
          <h2>Follow-ups & Reminders</h2>
          <span>{remindersQuery.isLoading ? 'Loading…' : `${reminders.length} scheduled`}</span>
        </header>
        {remindersQuery.isError && <p className="error">Unable to load reminders.</p>}
        <FollowUpTimeline
          reminders={reminders}
          onSchedule={(payload) => scheduleReminderMutation.mutate(payload)}
          isScheduling={scheduleReminderMutation.isPending}
        />
      </section>

      <section className="card crm__communications">
        <header className="card__header">
          <h2>Recent Communications</h2>
          <span>{communicationThreads.length} interactions</span>
        </header>
        <ul className="list-inline">
          {communicationThreads.map((thread) => (
            <li key={thread.id}>
              <strong>{thread.participant}</strong> via {thread.channel} • Last touch{' '}
              {new Date(thread.lastUpdated).toLocaleString()}
            </li>
          ))}
          {communicationThreads.length === 0 && <li>No communication history logged yet.</li>}
        </ul>
      </section>
    </div>
  );
}
