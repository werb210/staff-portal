import type { ReactNode } from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: ReactNode;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  data?: T[];
  columns: Column<T>[];
  emptyState?: ReactNode;
  isLoading?: boolean;
}

export function Table<T>({ data = [], columns, emptyState, isLoading }: TableProps<T>) {
  if (isLoading) {
    return <div className="table table--loading">Loading…</div>;
  }

  if (!data.length) {
    return <div className="table table--empty">{emptyState ?? 'No data available.'}</div>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={String(column.key)} className={column.className}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={(item as { id?: string }).id ?? index}>
            {columns.map((column) => (
              <td key={String(column.key)} className={column.className}>
                {column.render ? column.render(item) : (item as Record<string, ReactNode>)[column.key as string]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
