"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { useEffect } from "react";

export default function ProfilePage() {
  const router = useRouter();

  const { data: session, isLoading: isSessionLoading } = api.auth.getSession.useQuery();

  const { 
    data: appointments, 
    isLoading: isAppointmentsLoading, 
    refetch,
    error: appointmentsError,
  } = api.appointment.getAppointments.useQuery(undefined, {
    enabled: !!session?.userId,
  });

  useEffect(() => {
    console.log("Session:", session);
    console.log("Appointments:", appointments);
    console.log("Appointments Error:", appointmentsError);
  }, [session, appointments, appointmentsError]);

  useEffect(() => {
    if (!isSessionLoading && !session) {
      router.push("/account/login");
    }
  }, [session, isSessionLoading, router]);

  type RouterOutput = inferRouterOutputs<AppRouter>;
  type DeleteAppointmentOutput = RouterOutput["appointment"]["deleteAppointment"];

  const deleteAppointmentMutation = api.appointment.deleteAppointment.useMutation({
    onSuccess: () => void refetch(),
  });

  if (isSessionLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        color: "#121212"
      }}>
        <div style={{ fontSize: 18 }}>Loading your profile...</div>
      </div>
    );
  }

  if (!session) return null;

  function remove(id: string) {
    deleteAppointmentMutation.mutate({ id });
  }

  if (appointmentsError) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        color: "#dc3545",
        flexDirection: "column",
        gap: 16
      }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Error loading appointments</div>
        <div style={{ fontSize: 14, color: "#75706f" }}>{appointmentsError.message}</div>
      </div>
    );
  }

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
          }}>Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "48px 24px"
      }}>
        {/* Profile Info Card */}
        <div style={{
          background: "#fafafa",
          padding: 32,
          borderRadius: 12,
          border: "1px solid #e0e0e0",
          marginBottom: 48
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 600,
            marginTop: 0,
            marginBottom: 24,
            color: "#121212"
          }}>Account Information</h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 24
          }}>
            <div style={{
              background: "#ffffff",
              padding: 20,
              borderRadius: 8,
              border: "1px solid #e0e0e0"
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#75706f",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 8
              }}>Name</div>
              <div style={{
                fontSize: 16,
                color: "#121212",
                fontWeight: 500
              }}>{session.name || "—"}</div>
            </div>

            <div style={{
              background: "#ffffff",
              padding: 20,
              borderRadius: 8,
              border: "1px solid #e0e0e0"
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#75706f",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 8
              }}>Email</div>
              <div style={{
                fontSize: 16,
                color: "#121212",
                fontWeight: 500
              }}>{session.email || "—"}</div>
            </div>

            <div style={{
              background: "#ffffff",
              padding: 20,
              borderRadius: 8,
              border: "1px solid #e0e0e0"
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#75706f",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 8
              }}>User ID</div>
              <div style={{
                fontSize: 16,
                color: "#121212",
                fontWeight: 500,
                fontFamily: "monospace"
              }}>{session.userId || "—"}</div>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24
          }}>
            <h2 style={{
              fontSize: 24,
              fontWeight: 600,
              margin: 0,
              color: "#121212"
            }}>Your Appointments</h2>
            {appointments && appointments.length > 0 && (
              <div style={{
                fontSize: 14,
                color: "#75706f",
                background: "#fafafa",
                padding: "8px 16px",
                borderRadius: 20,
                border: "1px solid #e0e0e0"
              }}>
                {appointments.length} {appointments.length === 1 ? "appointment" : "appointments"}
              </div>
            )}
          </div>

          {isAppointmentsLoading ? (
            <div style={{
              background: "#fafafa",
              padding: 48,
              borderRadius: 12,
              border: "1px solid #e0e0e0",
              textAlign: "center"
            }}>
              <div style={{ fontSize: 16, color: "#75706f" }}>Loading appointments...</div>
            </div>
          ) : !appointments || appointments.length === 0 ? (
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
              }}>You have no appointments scheduled.</p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: 16
            }}>
              {appointments.map((a) => (
                <div
                  key={a.id}
                  style={{
                    background: "#fafafa",
                    padding: 24,
                    borderRadius: 12,
                    border: "1px solid #e0e0e0",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#121212",
                    marginBottom: 8
                  }}>
                    {new Date(a.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  
                  <div style={{
                    fontSize: 16,
                    color: "#75706f",
                    marginBottom: 12
                  }}>
                    {new Date(a.appointmentDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>

                  {a.notes && (
                    <div style={{
                      fontSize: 14,
                      color: "#75706f",
                      padding: 12,
                      background: "#ffffff",
                      borderRadius: 6,
                      border: "1px solid #e0e0e0",
                      marginBottom: 16,
                      flex: 1
                    }}>
                      {a.notes}
                    </div>
                  )}

                  <button
                    onClick={() => remove(a.id)}
                    disabled={deleteAppointmentMutation.status === "pending"}
                    style={{
                      marginTop: "auto",
                      padding: "10px 20px",
                      background: "#121212",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: deleteAppointmentMutation.status === "pending" ? "not-allowed" : "pointer",
                      opacity: deleteAppointmentMutation.status === "pending" ? 0.6 : 1,
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      if (deleteAppointmentMutation.status !== "pending") {
                        e.currentTarget.style.background = "#dc3545";
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#121212";
                    }}
                  >
                    {deleteAppointmentMutation.status === "pending" ? "Deleting..." : "Delete Appointment"}
                  </button>
                </div>
              ))}
            </div>
          )}
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