import { useState, useRef } from "react";
import "./newPostPage.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from 'leaflet'
import {useMapEvents} from 'react-leaflet/hooks'
import "leaflet/dist/leaflet.css";
import icon from '../../../public/pin.png'
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaHome, FaDollarSign, FaInfoCircle, FaImage, FaUpload } from 'react-icons/fa';

function NewPostPage() {
  const [value, setValue] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const formRef = useRef(null);
  
  const markerIcon = L.icon({
    iconUrl: icon,
    iconSize: [35, 35]
  });

  const navigate = useNavigate();
  const [marker, setMarker] = useState([28.210631681874286, 83.98412824540198]);

  const MapEventsHandler = ({ handleMapClick }) => {
    useMapEvents({
      click: (e) => handleMapClick(e),
    });
    return null;
  };

  const handleMapClick = (e) => {
    const {lat, lng} = e.latlng;
    setMarker([lat, lng]);
  };

  const validateForm = () => {
    const form = formRef.current;
    const requiredFields = [
      'title', 'price', 'type', 'property', 'address', 
      'city', 'bedroom', 'bathroom', 'size'
    ];
    
    for (const field of requiredFields) {
      const input = form[field];
      if (!input.value) {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        input.focus();
        return false;
      }
    }

    if (!value) {
      setError("Please provide a property description");
      return false;
    }

    return true;
  };

  const handleImageUpload = async (uploadedUrls) => {
    setImages(prev => [...prev, ...uploadedUrls]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one property image");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    setUploadStatus("Creating your listing...");
    setUploadProgress(30);

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    try {
      const res = await apiRequest.post("/posts", {
        postData: {
          title: inputs.title,
          price: parseInt(inputs.price),
          address: inputs.address,
          city: inputs.city,
          bedroom: parseInt(inputs.bedroom),
          bathroom: parseInt(inputs.bathroom),
          type: inputs.type,
          property: inputs.property,
          latitude: marker[0].toString(),
          longitude: marker[1].toString(),
          images: images,
        },
        postDetail: {
          desc: value,
          utilities: inputs.utilities,
          pet: inputs.pet,
          income: inputs.income,
          size: parseInt(inputs.size),
          school: inputs.school === 'on',
          bus: inputs.bus === 'on',
          restaurant: inputs.restaurant === 'on',
        },
      });

      setUploadProgress(100);
      setUploadStatus("Property listed successfully!");
      
      setTimeout(() => {
        navigate("/"+res.data.id);
      }, 1000);

    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Something went wrong while creating your listing");
      setUploadStatus("Submission failed");
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="newPostPage">
      <div className="formContainer">
        <div className="formHeader">
          <h1>Create New Property Listing</h1>
          <p>Fill in the details below to list your property</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="formSection">
            <h2><FaHome /> Basic Information</h2>
            <div className="formGrid">
              <div className="inputGroup">
                <label htmlFor="title">
                  <FaInfoCircle className="icon" />
                  Property Title
                </label>
                <input 
                  id="title" 
                  name="title" 
                  type="text" 
                  placeholder="Enter property title"
                  required 
                />
              </div>

              <div className="inputGroup">
                <label htmlFor="price">
                  <FaDollarSign className="icon" />
                  Price
                </label>
                <input 
                  id="price" 
                  name="price" 
                  type="number" 
                  placeholder="Enter price"
                  required
                />
              </div>

              <div className="inputGroup">
                <label htmlFor="type">
                  <FaHome className="icon" />
                  Type
                </label>
                <select name="type" required>
                  <option value="">Select type</option>
                  <option value="rent">For Rent</option>
                  <option value="buy">For Sale</option>
                </select>
              </div>

              <div className="inputGroup">
                <label htmlFor="property">
                  <FaHome className="icon" />
                  Property Type
                </label>
                <select name="property" required>
                  <option value="">Select property type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                </select>
              </div>
            </div>
          </div>

          <div className="formSection">
            <h2><FaMapMarkerAlt /> Location</h2>
            <div className="formGrid">
              <div className="inputGroup full">
                <label htmlFor="address">
                  <FaMapMarkerAlt className="icon" />
                  Address
                </label>
                <input 
                  id="address" 
                  name="address" 
                  type="text" 
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div className="inputGroup">
                <label htmlFor="city">
                  <FaMapMarkerAlt className="icon" />
                  City
                </label>
                <input 
                  id="city" 
                  name="city" 
                  type="text" 
                  placeholder="Enter city"
                  required
                />
              </div>

              <div className="mapWrapper">
                <label>Pin Location on Map</label>
                <div className="mapContainer">
                  <MapContainer   style={{height: '100%', width: '100%'}}
                    center={marker}
                    zoom={13}
                  >
                     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker icon={markerIcon} position={marker}></Marker>
                    <MapEventsHandler handleMapClick={handleMapClick} />
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="formSection">
            <h2><FaRuler /> Property Details</h2>
            <div className="formGrid">
              <div className="inputGroup">
                <label htmlFor="bedroom">
                  <FaBed className="icon" />
                  Bedrooms
                </label>
                <input 
                  id="bedroom" 
                  name="bedroom" 
                  type="number" 
                  min={1} 
                  placeholder="Number of bedrooms"
                  required
                />
              </div>

              <div className="inputGroup">
                <label htmlFor="bathroom">
                  <FaBath className="icon" />
                  Bathrooms
                </label>
                <input 
                  id="bathroom" 
                  name="bathroom" 
                  type="number" 
                  min={1} 
                  placeholder="Number of bathrooms"
                  required
                />
              </div>

              <div className="inputGroup">
                <label htmlFor="size">
                  <FaRuler className="icon" />
                  Total Size (sqft)
                </label>
                <input 
                  id="size" 
                  name="size" 
                  type="number" 
                  min={0} 
                  placeholder="Size in square feet"
                  required
                />
              </div>
            </div>

            <div className="descriptionGroup">
              <label htmlFor="desc">Description</label>
              <ReactQuill 
                theme="snow" 
                onChange={setValue} 
                value={value}
                placeholder="Describe your property..."
              />
            </div>
          </div>

          <div className="formSection">
            <h2>Additional Features</h2>
            <div className="formGrid">
              <div className="inputGroup">
                <label htmlFor="utilities">Utilities Policy</label>
                <select name="utilities" required>
                  <option value="">Select utilities policy</option>
                  <option value="owner">Owner is responsible</option>
                  <option value="tenant">Tenant is responsible</option>
                  <option value="shared">Shared responsibility</option>
                </select>
              </div>

              <div className="inputGroup">
                <label htmlFor="pet">Pet Policy</label>
                <select name="pet" required>
                  <option value="">Select pet policy</option>
                  <option value="allowed">Pets Allowed</option>
                  <option value="not-allowed">No Pets Allowed</option>
                </select>
              </div>

              <div className="inputGroup">
                <label htmlFor="income">Income Requirement</label>
                <input
                  id="income"
                  name="income"
                  type="text"
                  placeholder="Income requirements"
                  required
                />
              </div>
            </div>

            <div className="checkboxGroup">
              <div className="checkbox">
                <input id="school" name="school" type="checkbox" />
                <label htmlFor="school">Near School</label>
              </div>
              <div className="checkbox">
                <input id="bus" name="bus" type="checkbox" />
                <label htmlFor="bus">Near Bus Stop</label>
              </div>
              <div className="checkbox">
                <input id="restaurant" name="restaurant" type="checkbox" />
                <label htmlFor="restaurant">Near Restaurant</label>
              </div>
            </div>
          </div>

          <div className="formSection">
            <h2><FaImage /> Property Images</h2>
            <div className="imageUploader">
              <div className="imageGrid">
                {images.map((image, index) => (
                  <div key={index} className="imagePreview">
                    <img src={image} alt={`Property ${index + 1}`} />
                  </div>
                ))}
              </div>
              <UploadWidget
                uwConfig={{
                  multiple: true,
                  cloudName: "dkto2of8f",
                  uploadPreset: "havenly homes estate",
                  folder: "posts",
                }}
                setState={setImages}
              />
              <p className="uploadNote">
                Upload your property images, then click Create Listing to submit your property.
              </p>
            </div>
          </div>

          {error && (
            <div className="errorMessage">
              <FaInfoCircle />
              {error}
            </div>
          )}

          {isSubmitting ? (
            <div className="uploadProgress">
              <div className="progressText">
                <span className="spinner"></span>
                {uploadStatus}
              </div>
              <div className="progressBar">
                <div 
                  className="progressFill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <button 
              type="submit" 
              className="submitButton"
              disabled={isSubmitting}
            >
              <FaUpload />
              Create Listing
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default NewPostPage;
