import { redirect } from "next/navigation";
import { getSession } from "~/server/lib/session";
import { db } from "~/server/db";
import { users, appointments } from "~/server/db/schema";
import UserManagement from "./UserManagement";

export default async function AdminPage() {
  const session = await getSession();

  // Check if user is admin (roleId 1)
  if (!session || session.roleId !== 1) {
    redirect("/account/login");
  }

  // Fetch all users and appointments for admin management
  const [allUsers, allAppointments] = await Promise.all([
    db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      isActive: users.isActive,
      plainPassword: users.plainPassword,
      createdAt: users.createdAt,
    }).from(users).orderBy(users.createdAt),

    db.select({
      id: appointments.id,
      userId: appointments.userId,
      title: appointments.title,
      description: appointments.description,
      appointmentDate: appointments.appointmentDate,
      status: appointments.status,
      location: appointments.location,
      notes: appointments.notes,
    }).from(appointments).orderBy(appointments.appointmentDate),
  ]);

  return (
    <div style={{ padding: 24 }}>
      {/* Header with navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "2px solid #ddd", paddingBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, color: "#1f6feb" }}>Admin Dashboard</h1>
          <p style={{ margin: 8, color: "#666" }}>Welcome, {session.name} ({session.email})</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a
            href="/account/admin"
            style={{
              padding: "8px 16px",
              backgroundColor: "#000",
              color: "white",
              textDecoration: "none",
              borderRadius: 6,
              fontWeight: "bold",
              border: "1px solid #000"
            }}
          >
            Dashboard
          </a>
          <a
            href="/account/admin/logs"
            style={{
              padding: "8px 16px",
              backgroundColor: "#333333",
              color: "white",
              textDecoration: "none",
              borderRadius: 6,
              border: "1px solid #333333",
              fontWeight: "bold",
              transition: "background-color 160ms ease"
            }}
          >
            View Logs
          </a>
          <a
            href="/account/logout"
            style={{
              padding: "8px 16px",
              backgroundColor: "#333",
              color: "white",
              textDecoration: "none",
              borderRadius: 6,
              border: "1px solid #333"
            }}
          >
            Logout
          </a>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <UserManagement initialUsers={allUsers} />
      </div>

      <div style={{ marginTop: 32 }}>
        <h3>Appointments ({allAppointments.length})</h3>
        {allAppointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ backgroundColor: "#e0e0e0", color: "#333" }}>
                  <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>ID</th>
                  <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>Title</th>
                  <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>User</th>
                  <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>Date</th>
                  <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>Status</th>
                  <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>Location</th>
                </tr>
              </thead>
              <tbody>
                {allAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td style={{ padding: 12, border: "1px solid #ddd" }}>{appointment.id.substring(0, 8)}...</td>
                    <td style={{ padding: 12, border: "1px solid #ddd" }}>{appointment.title}</td>
                    <td style={{ padding: 12, border: "1px solid #ddd" }}>{appointment.userId.substring(0, 8)}...</td>
                    <td style={{ padding: 12, border: "1px solid #ddd" }}>
                      {new Date(appointment.appointmentDate).toLocaleDateString()} at{" "}
                      {new Date(appointment.appointmentDate).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: 12, border: "1px solid #ddd" }}>{appointment.status}</td>
                    <td style={{ padding: 12, border: "1px solid #ddd" }}>{appointment.location ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
