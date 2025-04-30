import { useEffect, useState } from "react";
import "./ManageUsers.scss";
import apiRequest from "../lib/apiRequest";
import { FaCreditCard, FaSync, FaTimes, FaCheckCircle } from "react-icons/fa";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      searchTerm === "" || 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleUpdateSubscription = async (userId, newSubscription) => {
    try {
      await apiRequest.put(`/admin/users/${userId}/subscription`, {
        subscriptionLevel: newSubscription
      });
      // Refresh users list
      const res = await apiRequest("/admin/users");
      setUsers(res.data);
      setError(null);
    } catch (error) {
      setError("Failed to update subscription. Please try again later.");
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not subscribed";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // New simplified status logic
  const getStatusBySubscriptionLevel = (subscriptionLevel) => {
    if (subscriptionLevel === 'MONTHLY' || subscriptionLevel === 'YEARLY') {
      return 'ACTIVE';
    }
    return 'INACTIVE';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <FaCheckCircle className="status-icon" />;
      case 'INACTIVE':
      default:
        return <FaTimes className="status-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="manage-users">
        <div className="container">
          <h2>Manage Users</h2>
          <div className="loading-spinner">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users">
      <div className="container">
        <h2>Manage Users</h2>
        {error && <div className="error-message">{error}</div>}

        <div className="search-controls">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Subscription</th>
                <th>Status</th>
               
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-users">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const status = getStatusBySubscriptionLevel(user.subscriptionLevel);
                  return (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`user-role ${user.role?.toLowerCase() || 'user'}`}>
                          {user.role || 'User'}
                        </span>
                      </td>
                      <td>
                        <span className={`subscription-badge ${user.subscriptionLevel?.toLowerCase() || 'free'}`}>
                          <FaCreditCard className="subscription-icon" />
                          {user.subscriptionLevel || 'Free'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${status.toLowerCase()}`}>
                          {getStatusIcon(status)}
                          {status}
                        </span>
                      </td>
                    
                     
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
