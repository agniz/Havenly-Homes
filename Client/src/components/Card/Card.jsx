import { useNavigate } from "react-router-dom";
import "./card.scss";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaBed, FaBath, FaMapMarkerAlt, FaBookmark, FaEye, FaTrash } from "react-icons/fa";
import apiRequest from "../../lib/apiRequest";

function Card({ item, onDelete }) {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleCardClick = (e) => {
    // Don't navigate if clicked on a button or within a button
    if (e.target.closest('button')) {
      return;
    }
    
    if (!currentUser) {
      // Prevent navigation if user is not logged in
      toast.warning("Please log in to view this property.");
      return;
    }
    
    if (!item || !item.id) {
      toast.error("Property information is not available.");
      return;
    }
    
    // Navigate to property details
    navigate(`/${item.id}`);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in first
    if (!currentUser) {
      toast.warning("Please log in to delete properties.");
      return;
    }
    
    // Check if user owns the property
    if (currentUser.id !== item.userId) {
      toast.error("You can only delete your own properties.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      const response = await apiRequest.delete(`/posts/${item.id}`);
      if (response.status === 200) {
        toast.success("Property deleted successfully");
        if (onDelete) {
          onDelete(item.id);
        }
      } else {
        throw new Error("Failed to delete property");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete property");
    }
  };

  const handleSave = async(e) => {
      try {
       const res =  await apiRequest.post("/users/save", { postId: item.id });
 
        toast.info(res.data.message);
      } catch (err) {
        console.log(err);
        setSaved((prev) => !prev);
      }
    
    
 
  };

  if (!item) return null;

  const isRental = item?.type === 'rent';
  const formattedPrice = item?.price ? item.price.toLocaleString() : '0';
  const isOwner = currentUser?.id === item?.userId;

  return (
    <div className="card" onClick={handleCardClick}>
      <div className="card-wrapper">
        <div className="image-wrapper">
          <img 
            src={item.images?.[0] || '/placeholder-property.jpg'} 
            alt={item.title || 'Property'} 
            className="property-image" 
          />
          <div className="image-overlay">
            <div className="status-tag">
              <span className={`tag ${isRental ? 'rent' : 'sale'}`}>
                {isRental ? "For Rent" : "For Sale"}
              </span>
              {isOwner && (
                <span className={`tag ${item.isApproved ? 'approved' : 'pending'}`}>
                  {item.isApproved ? "Approved" : "Pending"}
                </span>
              )}
            </div>
            <div className="quick-view">
              <FaEye className="quick-view-icon" />
              <span>Quick View</span>
            </div>
          </div>
        </div>
        
        <div className="content-wrapper">
          <div className="property-header">
            <h2 className="title">{item.title || 'Untitled Property'}</h2> 
            <div className="address">
              <FaMapMarkerAlt className="location-icon" />
              <span>{item.address || 'Address not available'}</span>
            </div>
          </div>

          <div className="price-section">
            <div className="price-display">
              <span className="amount">$ {formattedPrice}</span>
              {isRental && <span className="price-period">/month</span>}
            </div>
            <span className="price-label">
              {isRental ? "Monthly Rent" : "Starting Price"}
            </span>
          </div>

          <div className="property-details">
            <div className="features">
              <div className="feature">
                <FaBed className="feature-icon" />
                <span>{item.bedroom || 0} beds</span>
              </div>
              <div className="feature">
                <FaBath className="feature-icon" />
                <span>{item.bathroom || 0} baths</span>
              </div>
            </div>
            <div className="actions">
             {!isOwner && <button  style={{zIndex:200}} 
                className="save-button" 
                onClick={handleSave} 
                title="Save property"
              >
                <FaBookmark className="save-icon" />
              </button>}
              {isOwner && (
                <button style={{zIndex:200}} 
                  className="delete-button" 
                  onClick={handleDelete}
                  title="Delete property"
                >
                  <FaTrash className="delete-icon" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;