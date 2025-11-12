import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import PipelineBoard from '../components/Pipeline/PipelineBoard';

const transition = vi.fn();
const reorder = vi.fn();

vi.mock('../hooks/api/usePipeline', () => ({
  usePipeline: () => ({
    data: [
      {
        id: 'stage-1',
        name: 'New',
        order: 0,
        applications: [
          { id: 'app-1', name: 'Atlas Corp', amountRequested: 100000, borrowerEmail: 'atlas@example.com' },
        ],
      },
      {
        id: 'stage-2',
        name: 'In Review',
        order: 1,
        applications: [],
      },
    ],
    isLoading: false,
  }),
  usePipelineTransition: () => ({ mutate: transition, isPending: false }),
  usePipelineReorder: () => ({ mutate: reorder, isPending: false }),
}));

vi.mock('../hooks/useRBAC', () => ({
  useRBAC: () => ({ user: { silo: 'BF' } }),
}));

describe('PipelineBoard', () => {
  beforeEach(() => {
    transition.mockReset();
    reorder.mockReset();
  });

  it('renders stages and applications', () => {
    render(<PipelineBoard />);
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Atlas Corp')).toBeInTheDocument();
  });
});
