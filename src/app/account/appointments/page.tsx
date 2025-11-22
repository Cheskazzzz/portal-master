"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function AppointmentsPage() {
  const router = useRouter();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const {
    data: appointments = [],
    isLoading,
    refetch,
  } = api.appointment.getAppointments.useQuery();

  const createMutation = api.appointment.createAppointment.useMutation({
    onSuccess: () => {
      void refetch();
      setDate("");
      setTime("");
      setNotes("");
    },
    onError: (error) => {
      console.error("Error creating appointment:", error);
      alert(`Failed to create appointment: ${error.message}`);
    },
  });

  const deleteMutation = api.appointment.deleteAppointment.useMutation({
    onSuccess: () => void refetch(),
  });

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/auth/session", {
        credentials: "include",
      });

      const data = (await res.json()) as { isAuth: boolean };
      if (!data.isAuth) router.push("/account/login");
    }

    void check();
  }, [router]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        color: "#121212"
      }}>
        <div style={{ fontSize: 18 }}>Loading appointments...</div>
      </div>
    );
  }

  if (!appointments) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      color: "#121212"
    }}>
      {/* Header */}
      <div style={{
        background: "#75706f",
        padding: "24px 0",
        borderBottom: "1px solid #e0e0e0"
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px"
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 600,
            color: "#ffffff"
          }}>Appointments</h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "48px 24px"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 32
        }}>
          {/* Create Form Section */}
          <div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 24,
              color: "#121212"
            }}>Schedule New Appointment</h2>

            <div style={{
              background: "#fafafa",
              padding: 32,
              borderRadius: 12,
              border: "1px solid #e0e0e0"
            }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#121212"
                }}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    padding: "12px 16px",
                    width: "100%",
                    borderRadius: 8,
                    border: "2px solid #e0e0e0",
                    fontSize: 16,
                    background: "#ffffff",
                    color: "#121212",
                    transition: "all 0.2s",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#121212"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#121212"
                }}>Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={{
                    padding: "12px 16px",
                    width: "100%",
                    borderRadius: 8,
                    border: "2px solid #e0e0e0",
                    fontSize: 16,
                    background: "#ffffff",
                    color: "#121212",
                    transition: "all 0.2s",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#121212"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#121212"
                }}>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional details..."
                  style={{
                    padding: "12px 16px",
                    width: "100%",
                    minHeight: 120,
                    borderRadius: 8,
                    border: "2px solid #e0e0e0",
                    fontSize: 16,
                    background: "#ffffff",
                    color: "#121212",
                    fontFamily: "inherit",
                    resize: "vertical",
                    transition: "all 0.2s",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#121212"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>

              <button
                onClick={() => {
                  if (!date || !time) {
                    alert("Please fill in both date and time");
                    return;
                  }
                  createMutation.mutate({
                    date,
                    time,
                    notes,
                  });
                }}
                disabled={createMutation.isPending}
                style={{
                  padding: "14px 24px",
                  width: "100%",
                  background: "#121212",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: createMutation.isPending ? "not-allowed" : "pointer",
                  opacity: createMutation.isPending ? 0.6 : 1,
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  if (!createMutation.isPending) {
                    e.currentTarget.style.background = "#2c2c2c";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#121212";
                }}
              >
                {createMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
              </button>
            </div>
          </div>

          {/* Appointments List Section */}
          <div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 24,
              color: "#121212"
            }}>Your Appointments</h2>

            {appointments.length === 0 ? (
              <div style={{
                background: "#fafafa",
                padding: 48,
                borderRadius: 12,
                border: "1px solid #e0e0e0",
                textAlign: "center"
              }}>
                <p style={{
                  margin: 0,
                  color: "#75706f",
                  fontSize: 16
                }}>No appointments scheduled yet.</p>
              </div>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 16
              }}>
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    style={{
                      background: "#fafafa",
                      padding: 24,
                      borderRadius: 12,
                      border: "1px solid #e0e0e0",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: "#121212",
                          marginBottom: 8
                        }}>
                          {new Date(apt.appointmentDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div style={{
                          fontSize: 16,
                          color: "#75706f",
                          marginBottom: 4
                        }}>
                          <strong>Time:</strong>{" "}
                          {new Date(apt.appointmentDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                        {apt.notes && (
                          <div style={{
                            fontSize: 14,
                            color: "#75706f",
                            marginTop: 12,
                            padding: 12,
                            background: "#ffffff",
                            borderRadius: 6,
                            border: "1px solid #e0e0e0"
                          }}>
                            {apt.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteMutation.mutate({ id: apt.id })}
                      disabled={deleteMutation.isPending}
                      style={{
                        marginTop: 12,
                        padding: "10px 20px",
                        background: "#121212",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: deleteMutation.isPending ? "not-allowed" : "pointer",
                        opacity: deleteMutation.isPending ? 0.6 : 1,
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => {
                        if (!deleteMutation.isPending) {
                          e.currentTarget.style.background = "#dc3545";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "#121212";
                      }}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete Appointment"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: "#75706f",
        padding: "24px 0",
        borderTop: "1px solid #e0e0e0",
        marginTop: 48
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
          color: "#ffffff",
          fontSize: 14
        }}>
          © 2024 Appointment Manager
        </div>
      </div>
    </div>
  );
}