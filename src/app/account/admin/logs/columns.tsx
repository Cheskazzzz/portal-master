"use client";

import type { ColumnDef, CellContext } from "@tanstack/react-table";

export type AuditLog = {
  id: string;
  userId: string | null;
  action: string;
  resource: string | null;
  ipAddress: string | null;
  details: string | null;
  createdAt: Date;
};

export const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: (info: CellContext<AuditLog, Date>) => {
      const value = info.getValue();
      const date = new Date(value);
      return date.toLocaleString();
    },
  },
  {
    accessorKey: "action",
    header: "Action",
  },
  {
    accessorKey: "resource",
    header: "Resource",
  },
  {
    accessorKey: "userId",
    header: "User ID",
  },

  {
    accessorKey: "details",
    header: "Details",
    cell: (info: CellContext<AuditLog, string | null>) => {
      const details = info.getValue();

      if (!details) return "-";

      try {
        const parsed = JSON.parse(details) as Record<string, unknown>;
        return (
          <details>
            <summary>View</summary>
            <pre className="text-xs">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </details>
        );
      } catch {
        return details;
      }
    },
  },
];
