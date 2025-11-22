"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function LoginPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    const fd = new FormData(e.currentTarget);
  
    const emailRaw = fd.get("email");
    const passwordRaw = fd.get("password");
  
    const email = typeof emailRaw === "string" ? emailRaw : "";
    const password = typeof passwordRaw === "string" ? passwordRaw : "";
  
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = (await res.json()) as { 
        error?: string; 
        message?: string;
        user?: {
          id: string;
          name: string;
          email: string;
          roleId: number;
        };
      };
  
      if (!res.ok) {
        setError(data.error ?? data.message ?? "Login failed");
        setLoading(false);
        return;
      }
  
      await utils.auth.getSession.invalidate();
  
      // Role-based redirect
      if (data.user) {
        // roleId 1 is admin
        if (data.user.roleId === 1) {
          router.push("/account/admin");
        } else {
          router.push("/account/appointments");
        }
      } else {
        // Fallback if user data is missing
        router.push("/account/appointments");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#787878d0'
    }}>
      <div style={{ width: 420, background: 'var(--legacy-form-bg)', padding: 28, borderRadius: 8, boxShadow: '0 8px 30px rgba(174, 161, 161, 0.06)' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, marginBottom: 18 }}>Login</h2>
       
        <form onSubmit={handleLogin}>
          {error && (
            <div style={{ padding: 8, background: "#fee", color: "#c00", borderRadius: 6, marginBottom: 12, fontSize: 14 }}>
              {error}
            </div>
          )}
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            required 
            disabled={loading}
            style={{ width:'100%', padding:12, marginBottom:12, borderRadius:6, border:'1px solid #dfe6ea' }} 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            required 
            disabled={loading}
            style={{ width:'100%', padding:12, marginBottom:12, borderRadius:6, border:'1px solid #dfe6ea' }} 
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width:'100%', 
              padding:12, 
              background:loading ? '#999' : '#1f6feb', 
              color:'#fff', 
              border:'none', 
              borderRadius:6,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:12, color:'#666' }}>Don't have an account? <a href="/account/register" style={{ color: '#1f6feb', fontWeight:600 }}>Register</a></p>
      </div>
    </div>
  );
}