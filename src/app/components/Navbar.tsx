"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../page.module.css";
import { api } from "~/trpc/react";

export default function Navbar() {
  const pathname = usePathname();

  const { data: sessionData, isLoading } = api.auth.getSession.useQuery();

  const signedIn = !!sessionData;
  const isAdmin = signedIn && sessionData.roleId === 1;
  const userInitials = signedIn
    ? (() => {
        const name = sessionData.name || sessionData.email;
        const parts = name.split(/\s+/).filter(Boolean);
        return parts.length === 1 ? parts[0].slice(0, 2) : (parts[0][0] + parts[parts.length - 1][0]);
      })().toUpperCase()
    : '';

  return (
    <header className={styles.nav}>
      <div className={styles.logo}>
        <Image src="/Logo.ico" alt="Logo" width={32} height={32} />
        <Link href="/">Perez-Loreño Engineering Firm</Link>
      </div>

      {/* Hide public navigation if admin is logged in */}
      {!isAdmin && (
        <nav className={styles.center}>
          <Link href="/">Home</Link>
          <Link href="/about-us">About Us</Link>
          <Link href="/contact-us">Contact Us</Link>
          <Link href="/gallery">Gallery</Link>
        </nav>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {isLoading ? (
          <div>Loading...</div>
        ) : signedIn ? (
          <>
            {!(pathname && pathname.startsWith('/account/admin')) && (
              <Link href="/account/appointments">Appointments</Link>
            )}
            {isAdmin && <Link href="/account/admin">Admin</Link>}
            <Link href="/account/logout" style={{ color: '#e06464' }}>Log Out</Link>
            <Link href="/account/profile" style={{ textDecoration: 'none', marginLeft:8 }} title="Profile">
              <div style={{ width:32, height:32, borderRadius:999, background:'#111', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600 }}>{userInitials || 'U'}</div>
            </Link>
          </>
        ) : (
          <Link href="/account/login">Log In</Link>
        )}
      </div>
    </header>
  );
}
