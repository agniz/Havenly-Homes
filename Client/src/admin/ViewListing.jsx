// ViewListing.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import apiRequest from "../lib/apiRequest";
import "./ViewListing.scss";
import { FaArrowLeft, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaCalendarAlt, FaCheck, FaTrash } from "react-icons/fa";
import { MdCategory, MdOutlineChair, MdAttachMoney, MdVerified, MdOutlinePets } from "react-icons/md";
import { BsHouseDoor, BsHouseDoorFill, BsBuilding, BsWifi, BsThermometerHalf, BsCamera } from "react-icons/bs";

export default function ViewListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await apiRequest.get(`/posts/${id}`);
        if (response.data) {
          setListing(response.data);
        }
      } catch (err) {
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const approveListing = async () => {
    try {
      await apiRequest.put(`/admin/listings/${id}/approve`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Listing approved successfully!");
      setListing(prev => ({ ...prev, isApproved: true }));
    } catch (err) {
      toast.error("Approval process failed");
      console.error("Approval Error:", err);
    }
  };

  const handleNextImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setActiveImageIndex((activeImageIndex + 1) % listing.images.length);
    }
  };

  const handlePrevImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setActiveImageIndex((activeImageIndex - 1 + listing.images.length) % listing.images.length);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      try {
        await apiRequest.delete(`/admin/listings/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Listing deleted successfully");
        navigate("/admin/listings");
      } catch (err) {
        toast.error("Failed to delete listing");
        console.error("Error deleting listing:", err);
      }
    }
  };

  if (loading) return (
    <div className="admin-view-listing">
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading property details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="admin-view-listing">
      <div className="error-screen">
        <div className="error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    </div>
  );
  
  if (!listing) return (
    <div className="admin-view-listing">
      <div className="error-screen">
        <div className="error-icon">🔎</div>
        <h2>Property not found</h2>
        <p>The property you're looking for doesn't exist or may have been removed.</p>
      </div>
    </div>
  );

  // Determine property category based on the type field from Prisma schema
  const isRental = listing.type === "rent";
  const propertyCategory = isRental ? "rent" : "sale";
  const propertyTypeDisplay = isRental ? "For Rent" : "For Sale";

  const formatPrice = (price, isRent) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="admin-view-listing">
      <div className="page-header">
        <div className="header-actions">
          <button 
            className="back-button"
            onClick={() => navigate("/admin/listings")}
          >
            <FaArrowLeft /> Back to Listings
          </button>
          <div className="badges">
            <div className={`listing-type-badge ${propertyCategory}`}>
              {propertyTypeDisplay}
            </div>
            <div className={`status-badge ${listing.isApproved ? 'approved' : 'pending'}`}>
              {listing.isApproved ? 'Approved' : 'Pending Approval'}
            </div>
          </div>
        </div>
      </div>

      <div className="property-card">
        <div className="property-card-header">
          <div className="title-container">
            <h1 className="property-title">{listing.title}</h1>
            <div className="property-type">
              <div className={`type-indicator ${propertyCategory}`}>
                {propertyTypeDisplay}
              </div>
              {listing.property && (
                <div className="property-category">
                  • {listing.property.charAt(0).toUpperCase() + listing.property.slice(1)}
                </div>
              )}
            </div>
          </div>
          <div className="price-badge">
            {formatPrice(listing.price, isRental)}
            {isRental && <span className="price-period">/month</span>}
          </div>
        </div>
        
        <div className="location">
          <span className="location-icon"><FaMapMarkerAlt /></span>
          <span className="location-text">{listing.address}</span>
        </div>

        <div className="image-gallery">
          <div className="main-image-container">
            <img 
              src={listing.images?.[activeImageIndex] || ''} 
              alt="Property" 
              className="main-image"
              loading="lazy"
            />
            {listing.images && listing.images.length > 1 && (
              <div className="gallery-controls">
                <button onClick={handlePrevImage} className="gallery-nav prev">
                  <span>‹</span>
                </button>
                <button onClick={handleNextImage} className="gallery-nav next">
                  <span>›</span>
                </button>
              </div>
            )}
            {listing.images && listing.images.length > 0 && (
              <div className="image-counter">
                {activeImageIndex + 1} / {listing.images.length}
              </div>
            )}
          </div>
          {listing.images && listing.images.length > 1 && (
            <div className="thumbnail-row">
              {listing.images.map((img, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                  role="button"
                  tabIndex={0}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${index + 1}`} 
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="details-grid">
          <div className="detail-card">
            <div className="detail-icon">
              <FaBed />
            </div>
            <div className="detail-content">
              <h3>Bedrooms</h3>
              <p>{listing.bedroom}</p>
            </div>
          </div>
          <div className="detail-card">
            <div className="detail-icon">
              <FaBath />
            </div>
            <div className="detail-content">
              <h3>Bathrooms</h3>
              <p>{listing.bathroom}</p>
            </div>
          </div>
          <div className="detail-card">
            <div className="detail-icon">
              <FaRulerCombined />
            </div>
            <div className="detail-content">
              <h3>Square Footage</h3>
              <p>{listing.postDetail?.size || 'N/A'} sqft</p>
            </div>
          </div>
          <div className="detail-card">
            <div className="detail-icon">
              <MdCategory />
            </div>
            <div className="detail-content">
              <h3>Property Type</h3>
              <p>{propertyTypeDisplay}</p>
            </div>
          </div>
          <div className="detail-card">
            <div className="detail-icon">
              <FaCalendarAlt />
            </div>
            <div className="detail-content">
              <h3>Listed On</h3>
              <p>{new Date(listing.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
           
        
        </div>

        <div className="description-section">
          <h2 className="section-title">Property Description</h2>
          <div 
            className="description-content"
            dangerouslySetInnerHTML={{ __html: listing.postDetail?.desc || 'No description available.' }} 
          />
        </div>

        <div className="amenities-section">
          <h2 className="section-title">Features & Amenities</h2>
          <div className="amenities-grid">
            <div className="amenity-card">
              <div className="amenity-icon">🐾</div>
              <div className="amenity-text">Pets {listing.postDetail?.pet === "allowed" ? "Allowed" : "Not Allowed"}</div>
            </div>
            <div className="amenity-card">
              <div className="amenity-icon">💡</div>
              <div className="amenity-text">Utilities: {listing.postDetail?.utilities || 'Not specified'}</div>
            </div>
            <div className="amenity-card">
              <div className="amenity-icon">💰</div>
              <div className="amenity-text">Income: {listing.postDetail?.income || 'Not specified'}</div>
            </div>
            {listing.property && (
              <div className="amenity-card">
                <div className="amenity-icon">🏠</div>
                <div className="amenity-text">Property Type: {listing.property.charAt(0).toUpperCase() + listing.property.slice(1)}</div>
              </div>
            )}
          </div>
        </div>

        {currentUser?.isAdmin && (
          <div className="action-bar">
            {!listing.isApproved && (
              <button 
                className="btn-primary"
                onClick={approveListing}
              >
                <FaCheck /> Approve Listing
              </button>
            )}
            <button 
              className="btn-danger"
              onClick={handleDelete}
            >
              <FaTrash /> Delete Listing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}