// ViewListing.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import apiRequest from "../lib/apiRequest";
import "./ViewListing.scss";

export default function ViewListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (error) return <div className="error-screen">{error}</div>;
  if (!listing) return <div className="error-screen">Property not found</div>;

  return (
    <div className="property-listing">
      <button className="back-btn" onClick={() => navigate(-1)}>
        &larr; Back to Listings
      </button>

      <header className="property-header">
        <div className="title-wrapper">
          <h1>{listing.title}</h1>
          <div className="price-badge">${listing.price.toLocaleString()}</div>
        </div>
        <div className="location-badge">
          <span className="pin-icon">📍</span>
          {listing.address}
        </div>
      </header>

      <section className="image-gallery">
        <div className="main-image-scroller">
          <img 
            src={listing.images?.[0] || ''} 
            alt="Main property" 
            className="main-image"
            loading="lazy"
          />
        </div>
        <div className="thumbnail-scroller">
          {listing.images?.map((img, index) => (
            <div 
              key={index}
              className="thumbnail"
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
      </section>

      <main className="property-details">
        <div className="specs-grid">
          <div className="spec-card">
            <div className="spec-icon">🛏</div>
            <h3>Bedrooms</h3>
            <p>{listing.bedroom}</p>
          </div>
          <div className="spec-card">
            <div className="spec-icon">🚿</div>
            <h3>Bathrooms</h3>
            <p>{listing.bathroom}</p>
          </div>
          <div className="spec-card">
            <div className="spec-icon">📏</div>
            <h3>Size</h3>
            <p>{listing.postDetail.size} sqft</p>
          </div>
        </div>

        <article className="description">
          <h2>Property Description</h2>
          <div 
            className="description-content"
            dangerouslySetInnerHTML={{ __html: listing.postDetail.desc }} 
          />
        </article>

        <div className="amenities">
          <h2>Features & Amenities</h2>
          <div className="amenities-scroller">
            <div className="amenity-card">
              <span className="amenity-icon">🐾</span>
              <span>Pets {listing.postDetail.pet === "allowed" ? "Allowed" : "Not Allowed"}</span>
            </div>
            <div className="amenity-card">
              <span className="amenity-icon">💡</span>
              <span>Utilities: {listing.postDetail.utilities}</span>
            </div>
            <div className="amenity-card">
              <span className="amenity-icon">💰</span>
              <span>Income: {listing.postDetail.income}</span>
            </div>
          </div>
        </div>
      </main>

      {currentUser?.isAdmin && !listing.isApproved && (
        <div className="action-bar">
          <button 
            className="approve-btn"
            onClick={approveListing}
          >
            ✅ Approve Listing
          </button>
        </div>
      )}
    </div>
  );
}