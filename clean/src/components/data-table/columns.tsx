import { ColumnDef } from "@tanstack/react-table";
import { Application } from "../../types/application";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Link } from "react-router-dom";

export const applicationColumns: ColumnDef<Application>[] = [
  {
    accessorKey: "businessName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Business
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "contactName",
    header: "Contact",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: string = row.getValue("status");
      const color =
        status === "approved"
          ? "bg-green-600"
          : status === "rejected"
          ? "bg-red-600"
          : "bg-gray-600";

      return (
        <Badge className={`${color} text-white capitalize`}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Link
          to={`/applications/${id}`}
          className="text-blue-600 hover:underline"
        >
          View
        </Link>
      );
    },
  },
];
