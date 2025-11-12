import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { DataTable } from '../components/Table/DataTable';

interface Row {
  id: string;
  name: string;
  status: string;
}

describe('DataTable', () => {
  it('renders rows and headers', () => {
    const rows: Row[] = [
      { id: '1', name: 'Example', status: 'Active' },
    ];
    render(
      <DataTable<Row>
        caption="Example table"
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'status', header: 'Status' },
        ]}
        data={rows}
        getRowKey={(row) => row.id}
      />
    );

    expect(screen.getByText('Example table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByText('Example')).toBeInTheDocument();
  });
});
