import type { PropsWithChildren, ReactNode } from "react";

interface TableProps {
  headers: ReactNode[];
}

const Table = ({ headers, children }: PropsWithChildren<TableProps>) => (
  <table className="ui-table">
    <thead>
      <tr>
        {headers.map((header, index) => (
          <th key={index}>{header}</th>
        ))}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

export default Table;
