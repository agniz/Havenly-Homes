import { useEffect, useState } from "react";
import { FiEye, FiEdit } from "react-icons/fi";
import "./ManageUsers.scss";
import apiRequest from "../lib/apiRequest";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiRequest("/admin/users");
        setUsers(res.data);
      } catch (error) {
        setError("Failed to fetch users. Please try again later.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="manage-users">
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="manage-users">
      <div className="container">
        <h2>Manage Users</h2>
        {error && <div className="error-message">{error}</div>}

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
               
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-users">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`user-role ${user.role?.toLowerCase() || 'user'}`}>
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td>
                    
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}