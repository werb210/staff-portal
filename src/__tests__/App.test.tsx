import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';
import { AppProvider } from '../contexts/AppContext';

vi.mock('../hooks/useApplications', () => ({
  useApplications: () => ({ data: [
    {
      id: 'a1',
      applicantName: 'Jane Doe',
      product: 'Term Loan',
      status: 'in_review',
      stage: 'Review',
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      amount: 50000
    }
  ], isLoading: false }),
  useSubmitApplication: () => ({ mutate: vi.fn(), isPending: false }),
  useUploadDocument: () => ({ mutate: vi.fn(), isPending: false })
}));

vi.mock('../hooks/usePipeline', () => ({
  usePipeline: () => ({
    data: [
      {
        id: 'stage-1',
        name: 'Review',
        order: 1,
        applications: [
          {
            id: 'a1',
            applicantName: 'Jane Doe',
            product: 'Term Loan',
            status: 'in_review',
            stage: 'Review',
            updatedAt: new Date().toISOString(),
            submittedAt: new Date().toISOString(),
            amount: 50000
          }
        ]
      }
    ],
    isLoading: false
  }),
  useUpdatePipelineStage: () => ({ mutate: vi.fn(), isPending: false })
}));

vi.mock('../hooks/useCRM', () => ({
  useContacts: () => ({ data: [], isLoading: false }),
  useCompanies: () => ({ data: [], isLoading: false }),
  useTasks: () => ({ data: [], isLoading: false }),
  useCreateContact: () => ({ mutate: vi.fn(), isPending: false }),
  useCreateCompany: () => ({ mutate: vi.fn(), isPending: false }),
  useCreateTask: () => ({ mutate: vi.fn(), isPending: false })
}));

vi.mock('../hooks/useAdmin', () => ({
  useRetryQueue: () => ({ data: [], isLoading: false }),
  useBackups: () => ({ data: [], isLoading: false })
}));

vi.mock('../hooks/useDocuments', () => ({
  useDocuments: () => ({ data: [], isLoading: false }),
  useAcceptDocument: () => ({ mutate: vi.fn(), isPending: false }),
  useRejectDocument: () => ({ mutate: vi.fn(), isPending: false })
}));

vi.mock('../hooks/useLenders', () => ({
  useLenders: () => ({ data: [], isLoading: false }),
  useLenderProducts: () => ({ data: [], isLoading: false }),
  useSendToLender: () => ({ mutate: vi.fn(), isPending: false })
}));

vi.mock('../hooks/useCommunication', () => ({
  useSMSLogs: () => ({ data: [], isLoading: false }),
  useSendSMS: () => ({ mutate: vi.fn(), isPending: false }),
  useSendEmail: () => ({ mutate: vi.fn(), isPending: false })
}));

vi.mock('../hooks/useHealth', () => ({
  useHealthStatus: () => ({ data: {
    status: 'ok',
    version: '1.0.0',
    services: { api: 'ok' },
    timestamp: new Date().toISOString()
  }, isLoading: false })
}));

describe('App', () => {
  it('renders the dashboard metrics', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </AppProvider>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Active Applications/i)).toBeInTheDocument();
    expect(screen.getByText(/Pipeline Volume/i)).toBeInTheDocument();
  });
});
