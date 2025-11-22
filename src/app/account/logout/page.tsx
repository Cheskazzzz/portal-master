"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function LogoutPage() {
  const router = useRouter();
  const utils = api.useUtils(); // ✅ correct utility access

  useEffect(() => {
    async function logout() {
      try {
        // Call logout API endpoint
        await fetch("/api/auth/logout", {
          method: "POST",
        });
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        // Invalidate getSession cache safely
        await utils.auth.getSession.invalidate(); // ✅ FIXED

        router.push("/account/login");
        router.refresh();
      }
    }
    void logout();
  }, [router, utils]);

  return <div style={{ padding: 24 }}>Logging out...</div>;
}
