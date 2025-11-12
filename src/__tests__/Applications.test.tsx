import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import Applications from '../pages/Applications/Applications';

const mocks = {
  create: vi.fn(),
  submit: vi.fn(),
  upload: vi.fn(),
  complete: vi.fn(),
};

vi.mock('../hooks/api/useApplications', () => {
  const data = [
    {
      id: '1',
      businessName: 'Northwind Traders',
      status: 'In Review',
      stage: 'New',
      updatedAt: new Date().toISOString(),
    },
  ];
  return {
    useApplications: () => ({ data, isLoading: false }),
    useCreateApplication: () => ({ mutate: mocks.create, isPending: false }),
    useSubmitApplication: () => ({ mutate: mocks.submit, isPending: false }),
    useUploadApplicationDocument: () => ({ mutate: mocks.upload, isPending: false }),
    useCompleteApplication: () => ({ mutate: mocks.complete, isPending: false }),
  };
});

describe('Applications page', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
  });

  it('renders application table', () => {
    render(<Applications />);
    expect(screen.getByText(/Northwind Traders/i)).toBeInTheDocument();
  });

  it('submits new application form', () => {
    render(<Applications />);
    fireEvent.change(screen.getByLabelText(/Business Name/i), { target: { value: 'Acme LLC' } });
    fireEvent.change(screen.getByLabelText(/Contact Email/i), { target: { value: 'acme@example.com' } });
    fireEvent.change(screen.getByLabelText(/Contact Phone/i), { target: { value: '555-1234' } });
    fireEvent.change(screen.getByLabelText(/Amount Requested/i), { target: { value: '100000' } });
    const createButton = screen.getByRole('button', { name: /Create Application/i });
    fireEvent.submit(createButton.closest('form')!);
    expect(mocks.create).toHaveBeenCalled();
  });
});
