import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { PipelineCard } from '../components/Pipeline/PipelineCard';

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const application = {
  id: 'app-1',
  name: 'Atlas Corp',
  amountRequested: 120000,
  borrowerEmail: 'atlas@example.com',
  borrowerPhone: '555-0101',
};

describe('PipelineCard', () => {
  it('shows application summary', () => {
    render(<PipelineCard application={application} stageId="stage-1" />);
    expect(screen.getByText('Atlas Corp')).toBeInTheDocument();
    expect(screen.getByText('$120,000')).toBeInTheDocument();
  });
});
