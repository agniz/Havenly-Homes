import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import "./ManageListing.scss";
import apiRequest from "../lib/apiRequest";
import { toast } from "react-toastify";

export default function ManageListings() {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  // Check admin authentication
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.isAdmin) {
      alert("Access Denied! Only admins can view this page.");
      navigate("/"); // Redirect non-admins to home
    } else {
      fetchListings();
    }
  }, [navigate]);

  const fetchListings = async () => {
    try {
      const res = await apiRequest.get("/admin/listings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setListings(res.data || []);
    } catch (err) {
      console.error("Error fetching listings:", err);
    }
  };

  // Handle approve listing
  const approveListing = async (id) => {
    try {
      await apiRequest.put(`/admin/listings/${id}/approve`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Approved successfully");
      fetchListings(); // Refresh the listings after approval
    } catch (err) {
      console.error("Error approving listing:", err);
    }
  };

  // Handle delete listing
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await apiRequest.delete(`/admin/listings/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.info("Deleted successfully");
        setListings((prevListings) =>
          prevListings.filter((listing) => listing.id !== id)
        );
      } catch (err) {
        alert("Failed to delete listing.");
        console.error("Error deleting listing:", err);
      }
    }
  };

  return (
    <div className="manage-listings">
      <h2>Listings</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Location</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.length === 0 ? (
            <tr>
              <td colSpan="6">No listings available</td>
            </tr>
          ) : (
            listings.map((listing) => (
              <tr key={listing.id}>
                <td>{listing.username}</td>
                <td>{listing.title}</td>
                <td>{listing.location}</td>
                <td>${listing.price}</td>
                <td>
                  <span
                    className={`status ${
                      listing.isApproved ? "approved" : "pending"
                    }`}
                  >
                    {listing.isApproved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/admin/listing/${listing.id}`)}
                  >
                    <FiEye /> View
                  </button>
                  {!listing.isApproved && (
                    <button
                      className="approve-btn"
                      onClick={() => approveListing(listing.id)}
                    >
                      Approve
                    </button>
                  )}
                
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(listing.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
