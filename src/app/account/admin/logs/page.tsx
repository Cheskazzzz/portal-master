import { getSession } from "~/server/lib/session";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { auditLogs } from "~/server/db/schema";
import { desc, eq, and } from "drizzle-orm";

type AuditLog = {
  id: string;
  userId: string | null;
  action: string;
  resource: string | null;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: string | null;
  encryptedData: string | null;
  createdAt: Date;
};

async function getLogs(action?: string, resource?: string, limit = 100): Promise<AuditLog[]> {
  const where = [];
  if (action) {
    where.push(eq(auditLogs.action, action));
  }
  if (resource) {
    where.push(eq(auditLogs.resource, resource));
  }

  return await db
    .select()
    .from(auditLogs)
    .where(where.length > 0 ? and(...where) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

const tableColumns = ["Action", "Resource", "User ID", "IP Address", "Date"];

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session || session.roleId !== 1) {
    redirect("/account/login");
  }

  const awaitedSearchParams = await searchParams;
  const action = (awaitedSearchParams.action as string) ?? "";
  const resource = (awaitedSearchParams.resource as string) ?? "";
  const limit = parseInt((awaitedSearchParams.limit as string) ?? "100");

  const logs = await getLogs(action, resource, limit);

  return (
    <div style={{ padding: 24 }}>
      {/* Header with navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "2px solid #ddd", paddingBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, color: "#1f6feb" }}>Admin Audit Logs</h1>
          <p style={{ margin: 8, color: "#666" }}>Welcome, {session.name} ({session.email})</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a
            href="/account/admin"
            style={{
              padding: "8px 16px",
              backgroundColor: "#f6f8fa",
              color: "#24292f",
              textDecoration: "none",
              borderRadius: 6,
              border: "1px solid #d0d7de"
            }}
          >
            Dashboard
          </a>
          <a
            href="/account/admin/logs"
            style={{
              padding: "8px 16px",
              backgroundColor: "#1f6feb",
              color: "white",
              textDecoration: "none",
              borderRadius: 6,
              fontWeight: "bold"
            }}
          >
            View Logs
          </a>
        </div>
      </div>

      {/* Render table server-side */}
      <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: 6 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              {tableColumns.map((column) => (
                <th key={column} style={{ padding: 12, textAlign: "left", border: "1px solid #ddd", fontWeight: "bold" }}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length} style={{ padding: 24, textAlign: "center", border: "1px solid #ddd" }}>
                  No logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>{log.action}</td>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>{log.resource ?? "-"}</td>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>{log.userId ? log.userId.substring(0, 8) + "..." : "-"}</td>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>{log.ipAddress ?? "-"}</td>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>{log.createdAt.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
