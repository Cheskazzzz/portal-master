"use client";

import { useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  roleId: number;
  isActive: boolean;
  plainPassword?: string | null;
  createdAt: Date;
};

type UserFormData = {
  name: string;
  email: string;
  password: string;
  roleId: number;
};

export default function UserManagement({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    roleId: 2,
  });
  const [isLoading, setIsLoading] = useState(false);

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Don't show password for editing
        roleId: user.roleId,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        roleId: 2,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      roleId: 2,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";

      const submitData = editingUser
        ? { id: editingUser.id, ...formData, password: formData.password || undefined }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const result = await response.json() as { user?: User; error?: string };

      if (response.ok) {
        if (editingUser) {
          setUsers(users.map(u => u.id === editingUser.id ? result.user! : u));
        } else {
          setUsers([...users, result.user!]);
        }
        closeModal();
        alert(`${editingUser ? 'Updated' : 'Created'} user successfully!`);
      } else {
        alert(result.error ?? "An error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
        alert("User deleted successfully!");
      } else {
        const result = await response.json() as { error?: string };
        alert(result.error ?? "An error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3>Users ({users.length})</h3>

        </div>
        <button
          onClick={() => openModal()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#000",
            color: "white",
            border: "1px solid #000",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          + Add New User
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ backgroundColor: "#e0e0e0", color: "#333" }}>
              <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>ID</th>
              <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>Name</th>
              <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>Email</th>
              <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>Role</th>
              <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>Password</th>
              <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>Status</th>
              <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>Created</th>
              <th style={{ padding: 12, textAlign: "left", border: "1px solid #ccc" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ padding: 12, border: "1px solid #ddd" }}>{user.id.substring(0, 8)}...</td>
                <td style={{ padding: 12, border: "1px solid #ddd" }}>{user.name}</td>
                <td style={{ padding: 12, border: "1px solid #ddd" }}>{user.email}</td>
                <td style={{ padding: 12, border: "1px solid #ddd" }}>
                  {user.roleId === 1 ? "Admin" : "User"}
                </td>
                <td style={{ padding: 12, border: "1px solid #ddd" }}>
                  {user.plainPassword ? (
                    <span style={{
                      fontFamily: "monospace",
                      backgroundColor: "#f8f9fa",
                      padding: "2px 6px",
                      borderRadius: 3,
                      fontSize: 13
                    }}>
                      {user.plainPassword}
                    </span>
                  ) : (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      alignItems: "flex-start"
                    }}>
                      <span style={{ color: "#dc3545", fontSize: 12, fontWeight: "500" }}>
                        ⚠️ Password encrypted
                      </span>
                      <button
                        style={{
                          padding: "2px 8px",
                          fontSize: 11,
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: 3,
                          cursor: "pointer"
                        }}
                        onClick={() => openModal(user)}
                      >
                        Set New Password
                      </button>
                    </div>
                  )}
                </td>
                <td style={{ padding: 12, border: "1px solid #ddd" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    backgroundColor: user.isActive ? "#d4edda" : "#f8d7da",
                    color: user.isActive ? "#155724" : "#721c24"
                  }}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: 12, border: "1px solid #ddd" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: 12, border: "1px solid #ddd" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => openModal(user)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#000",
                        color: "white",
                        border: "1px solid #000",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12
                      }}
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#333",
                        color: "white",
                        border: "1px solid #333",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12
                      }}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: 24,
            borderRadius: 8,
            width: 400,
            maxWidth: "90%"
          }}>
            <h3>{editingUser ? "Edit User" : "Create New User"}</h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4 }}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4 }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4 }}>
                  Password {editingUser ? "(leave empty to keep current)" : ""}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4 }}>Role</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
                >
                  <option value={2}>User</option>
                  <option value={1}>Admin</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #ddd",
                    backgroundColor: "white",
                    color: "#333",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  {isLoading ? "Saving..." : editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
