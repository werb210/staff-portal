import * as React from "react";
import { cn } from "../../lib/utils";

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table ref={ref} className={cn("w-full text-sm text-left", className)} {...props} />
  )
);
Table.displayName = "Table";

export const TableHeader = (
  props: React.HTMLAttributes<HTMLTableSectionElement>
) => <thead {...props} className={cn("bg-gray-50", props.className)} />;

export const TableBody = (
  props: React.HTMLAttributes<HTMLTableSectionElement>
) => <tbody {...props} className={cn("divide-y", props.className)} />;

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("border-b last:border-0", className)} {...props} />
  )
);
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn("px-4 py-2 text-xs font-semibold text-slate-600", className)}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("px-4 py-2 align-middle", className)} {...props} />
  )
);
TableCell.displayName = "TableCell";
