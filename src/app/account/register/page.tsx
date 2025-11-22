"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name")?.toString() || "";
    const email = fd.get("email")?.toString() || "";
    const password = fd.get("password")?.toString() || "";

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((d: any) => d.message || d.path.join(".")).join(", ");
          setError(errorMessages || data.error || "Registration failed");
        } else {
          setError(data.error || "Registration failed");
        }
        setLoading(false);
        return;
      }

      // Session is now stored in HTTP-only cookie
      router.push("/account/appointments");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
      console.error("Registration error:", err);
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
      <div style={{ width: 420, background: 'var(--legacy-form-bg)', padding: 28, borderRadius: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, marginBottom: 18 }}>Register</h2>
       
        <form onSubmit={handleRegister}>
          {error && (
            <div style={{ padding: 8, background: "#fee", color: "#c00", borderRadius: 6, marginBottom: 12, fontSize: 14 }}>
              {error}
            </div>
          )}
          <input 
            name="name" 
            type="text" 
            placeholder="Name" 
            required 
            disabled={loading}
            style={{ width:'100%', padding:12, marginBottom:12, borderRadius:6, border:'1px solid #dfe6ea' }} 
          />
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
            placeholder="Password (min 8 chars, uppercase, lowercase, number)" 
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:12, color:'#666' }}>Already have an account? <a href="/account/login" style={{ color: '#1f6feb', fontWeight:600 }}>Login</a></p>
      </div>
    </div>
  );
}
