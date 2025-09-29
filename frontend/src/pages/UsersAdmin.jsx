import React, { useEffect, useState, useContext } from "react";
import client from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  
  // Get current user from AuthContext
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    client
      .get("/users/me")
      .then((res) => setUsers(res.data?.data || []))
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to fetch users";
        setError(msg);
        alert(msg);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  // Check if current user is admin (enable buttons only for admin)
  const isAdmin = currentUser?.role === 'admin';

  const handleUpdateRole = (user) => {
    if (!isAdmin) {
      alert("You don't have permission to update user roles");
      return;
    }
    setEditingUser(user);
    setShowRoleForm(true);
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      alert("You don't have permission to update user roles");
      return;
    }

    const formData = new FormData(e.target);
    const newRole = formData.get('role');

    if (!newRole || newRole === editingUser.role) {
      setShowRoleForm(false);
      setEditingUser(null);
      return;
    }

    client
      .put(`/users/me/${editingUser.id}`, { role: newRole })
      .then(() => {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, role: newRole } : u))
        );
        alert(`Role updated successfully to ${newRole}`);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to update role";
        alert(msg);
      })
      .finally(() => {
        setShowRoleForm(false);
        setEditingUser(null);
      });
  };

  const handleDeleteUser = (user) => {
    if (!isAdmin) {
      alert("You don't have permission to delete users");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user ${user.email}? This action cannot be undone.`)) {
      return;
    }

    client
      .delete(`/users/me/${user.id}`)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        alert("User deleted successfully");
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete user";
        alert(msg);
      });
  };

  const RoleUpdateForm = () => {
    if (!showRoleForm || !editingUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-xl font-semibold mb-4">Update User Role</h2>
          <form onSubmit={handleRoleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User: <span className="font-semibold">{editingUser.email}</span>
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Role: <span className="capitalize font-semibold">{editingUser.role}</span>
              </label>
            </div>
            
            <div className="mb-6">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Select New Role *
              </label>
              <select
                id="role"
                name="role"
                defaultValue={editingUser.role}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="read-only">Read Only</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowRoleForm(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update Role
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
        <div className="text-sm text-gray-600">
          Logged in as: <span className="capitalize font-semibold">{currentUser?.role || 'Unknown'}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-800 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {!isAdmin && (
        <div className="mb-4 p-4 text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-lg">
          <strong>Note:</strong> You need admin privileges to update user roles or delete users.
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading users...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-blue-50 text-blue-700 uppercase text-sm">
                <th className="px-4 py-3 border">ID</th>
                <th className="px-4 py-3 border">Email</th>
                <th className="px-4 py-3 border">Role</th>
                <th className="px-4 py-3 border">Created At</th>
                <th className="px-4 py-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-t ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="px-4 py-3">{u.id}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'read-only' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleUpdateRole(u)}
                        disabled={!isAdmin}
                        className={`px-3 py-1 text-sm rounded transition ${
                          !isAdmin
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title={!isAdmin ? "Admin access required to update roles" : "Update user role"}
                      >
                        Update Role
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={!isAdmin}
                        className={`px-3 py-1 text-sm rounded transition ${
                          !isAdmin
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        title={!isAdmin ? "Admin access required to delete users" : "Delete user"}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </div>
      )}

      {/* Role Update Form Modal */}
      <RoleUpdateForm />
    </div>
  );
}