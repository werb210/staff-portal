import type { ReactNode } from 'react';

interface Column<T> {
  header: ReactNode;
  accessor: keyof T | ((item: T) => ReactNode);
  width?: string | number;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keySelector: (item: T) => string;
  emptyMessage?: ReactNode;
}

export const Table = <T,>({ data, columns, keySelector, emptyMessage }: TableProps<T>) => {
  if (!data.length) {
    return <div className="table-empty">{emptyMessage ?? 'No records found.'}</div>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index} style={{ width: column.width }}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={keySelector(item)}>
            {columns.map((column, index) => {
              const value =
                typeof column.accessor === 'function'
                  ? column.accessor(item)
                  : (item[column.accessor] as ReactNode);
              return <td key={index}>{value}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
