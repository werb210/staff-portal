import React from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  caption?: string;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  getRowKey: (item: T) => string;
}

export function DataTable<T>({ caption, columns, data, emptyMessage = 'No records found.', getRowKey }: DataTableProps<T>) {
  return (
    <table className="table" role="grid">
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={String(column.key)} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={getRowKey(item)}>
            {columns.map((column) => (
              <td key={String(column.key)}>
                {column.render ? column.render(item) : String(item[column.key as keyof T] ?? '')}
              </td>
            ))}
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={columns.length}>{emptyMessage}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
