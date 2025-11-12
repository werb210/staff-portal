import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { useApplications } from '../hooks/useApplications';
import { usePipeline } from '../hooks/usePipeline';
import { useCompanies, useContacts, useTasks } from '../hooks/useCRM';
import type {
  Application,
  Notification,
  PipelineStage,
  User
} from '../utils/types';

interface AppContextValue {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  silo: string;
  setSilo: (silo: string) => void;
  applications: Application[];
  pipelineStages: PipelineStage[];
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  crm: {
    contacts: ReturnType<typeof useContacts>['data'];
    companies: ReturnType<typeof useCompanies>['data'];
    tasks: ReturnType<typeof useTasks>['data'];
  };
  isLoading: {
    applications: boolean;
    pipeline: boolean;
    crm: boolean;
  };
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const USER_STORAGE_KEY = 'staff-portal-user';

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: applications = [], isLoading: applicationsLoading } = useApplications();
  const { data: pipelineStages = [], isLoading: pipelineLoading } = usePipeline();
  const contactsQuery = useContacts();
  const companiesQuery = useCompanies();
  const tasksQuery = useTasks();

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(USER_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  });

  const [silo, setSilo] = useState<string>(() => currentUser?.silo ?? 'default');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentUser) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || currentUser.silo === silo) return;
    setCurrentUser({ ...currentUser, silo });
  }, [currentUser, silo]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt'>) => {
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
      setNotifications((prev) => [
        {
          id,
          createdAt: new Date().toISOString(),
          ...notification
        },
        ...prev
      ]);
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true
            }
          : notification
      )
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      currentUser,
      setCurrentUser,
      silo,
      setSilo,
      applications,
      pipelineStages,
      notifications,
      addNotification,
      markNotificationRead,
      dismissNotification,
      crm: {
        contacts: contactsQuery.data,
        companies: companiesQuery.data,
        tasks: tasksQuery.data
      },
      isLoading: {
        applications: applicationsLoading,
        pipeline: pipelineLoading,
        crm: Boolean(contactsQuery.isLoading || companiesQuery.isLoading || tasksQuery.isLoading)
      }
    }),
    [
      addNotification,
      applications,
      applicationsLoading,
      companiesQuery.data,
      companiesQuery.isLoading,
      contactsQuery.data,
      contactsQuery.isLoading,
      currentUser,
      markNotificationRead,
      dismissNotification,
      notifications,
      pipelineLoading,
      pipelineStages,
      silo,
      tasksQuery.data,
      tasksQuery.isLoading
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
