import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiCheck, FiTrash2, FiFilter } from "react-icons/fi";
import "./ManageListing.scss";
import apiRequest from "../lib/apiRequest";
import { toast } from "react-toastify";

export default function ManageListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  // Check admin authentication
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.isAdmin) {
      setError("Access Denied! Only admins can view this page.");
      setLoading(false);
    } else {
      fetchListings();
    }
  }, [navigate]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await apiRequest.get("/admin/listings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      // Log the first listing to see its structure
      if (res.data && res.data.length > 0) {
        console.log("Listing data structure:", res.data[0]);
      }
      
      setListings(res.data || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch listings. Please try again later.");
      console.error("Error fetching listings:", err);
      setLoading(false);
    }
  };

  // Filter listings based on search term and filters
  const filteredListings = listings.filter(listing => {
    const matchesSearch = searchTerm === "" || 
      (listing.title && listing.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (listing.address && listing.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPrice = (!priceRange.min || listing.price >= Number(priceRange.min)) &&
      (!priceRange.max || listing.price <= Number(priceRange.max));

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "approved" && listing.isApproved) ||
      (statusFilter === "pending" && !listing.isApproved);

    return matchesSearch && matchesPrice && matchesStatus;
  });

  // Handle approve listing
  const approveListing = async (id) => {
    try {
      await apiRequest.put(`/admin/listings/${id}/approve`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Listing approved successfully");
      fetchListings(); // Refresh the listings after approval
    } catch (err) {
      toast.error("Failed to approve listing");
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
        toast.success("Listing deleted successfully");
        setListings((prevListings) =>
          prevListings.filter((listing) => listing.id !== id)
        );
      } catch (err) {
        toast.error("Failed to delete listing");
        console.error("Error deleting listing:", err);
      }
    }
  };

  // Helper function to get location display
  const getLocationDisplay = (listing) => {
    // Check all possible location related fields
    if (listing.address) return listing.address;
    if (listing.location) return listing.location;
    if (listing.city) return listing.city;
    if (listing.propertyAddress) return listing.propertyAddress;
    return "No location";
  };

  const handlePriceChange = (e, type) => {
    const value = e.target.value;
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
  };

  const resetFilters = () => {
    setPriceRange({ min: "", max: "" });
    setStatusFilter("all");
  };

  if (loading) {
    return (
      <div className="manage-listings">
        <div className="container">
          <h2>Manage Listings</h2>
          <div className="loading-spinner">Loading listings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-listings">
      <div className="container">
        <h2>Manage Listings</h2>
        {error && <div className="error-message">{error}</div>}

        <div className="search-controls">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-section">
              <h3>Price Range</h3>
              <div className="price-inputs">
                <div className="price-input">
                  <label>Min Price</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange(e, 'min')}
                  />
                </div>
                <div className="price-input">
                  <label>Max Price</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange(e, 'max')}
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h3>Status</h3>
              <div className="status-filters">
                <button
                  className={`status-btn ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('all')}
                >
                  All
                </button>
                <button
                  className={`status-btn ${statusFilter === 'approved' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('approved')}
                >
                  Approved
                </button>
                <button
                  className={`status-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('pending')}
                >
                  Pending
                </button>
              </div>
            </div>

            <div className="filter-actions">
              <button className="reset-btn" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-listings">
                    No listings found
                  </td>
                </tr>
              ) : (
                filteredListings.map((listing) => (
                  <tr key={listing.id}>
                    <td>{listing.title || "No title"}</td>
                    <td>{getLocationDisplay(listing)}</td>
                    <td>${listing.price ? listing.price.toLocaleString() : '0'}</td>
                    <td>
                      <span
                        className={`status ${
                          listing.isApproved ? "approved" : "pending"
                        }`}
                      >
                        {listing.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="view-btn"
                          title="View Listing"
                          onClick={() => navigate(`/admin/listing/${listing.id}`)}
                        >
                          <FiEye /> View
                        </button>
                        {!listing.isApproved && (
                          <button
                            className="approve-btn"
                            title="Approve Listing"
                            onClick={() => approveListing(listing.id)}
                          >
                            <FiCheck /> Approve
                          </button>
                        )}
                        <button
                          className="delete-btn"
                          title="Delete Listing"
                          onClick={() => handleDelete(listing.id)}
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
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
