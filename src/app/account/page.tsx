import Link from "next/link";
import { getSession } from "@/server/lib/session";
import { redirect } from "next/navigation";

export default async function AccountIndex() {
  const session = await getSession();

  if (!session) {
    redirect("/account/login");
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Account</h2>
      <div
        style={{
          maxWidth: 560,
          background: "var(--legacy-form-bg)",
          padding: 16,
          borderRadius: 8,
        }}
      >
        <p>
          <strong>Name:</strong> {session.name}
        </p>
        <p>
          <strong>Email:</strong> {session.email}
        </p>
        <div style={{ marginTop: 12 }}>
          <Link href="/account/appointments" style={{ marginRight: 12 }}>
            Appointments
          </Link>
          <Link href="/account/profile" style={{ marginRight: 12 }}>
            Profile
          </Link>
          <Link href="/account/logout" style={{ color: "#e06464" }}>
            Log out
          </Link>
        </div>
      </div>
    </div>
  );
}
