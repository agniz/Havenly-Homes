import { useState } from "react";
import "./newPostPage.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from 'leaflet';
import { useMapEvents } from 'react-leaflet/hooks';
import "leaflet/dist/leaflet.css";
import icon from '../../../public/pin.png';
import { toast } from 'react-toastify';

function NewPostPage() {
  const [value, setValue] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
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
    const { lat, lng } = e.latlng;
    setMarker([lat, lng]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          type: inputs.type, // rent or buy
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

      toast.success("Property listing created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate("/" + res.data.id);
      }, 1500);

    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Something went wrong");
      toast.error("Failed to create listing. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  return (
    <div className="newPostPage">
      <div className="formContainer">
        <h1>Add New Property Listing</h1>
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="formSection">
              <h2>Basic Information</h2>
              <div className="formGroup">
                <div className="item">
                  <label htmlFor="title">Title</label>
                  <input id="title" name="title" type="text" placeholder="Property Title" required />
                </div>
                <div className="item">
                  <label htmlFor="price">Price ($)</label>
                  <input id="price" name="price" type="number" placeholder="Price" required />
                </div>
                <div className="item">
                  <label htmlFor="address">Address</label>
                  <input id="address" name="address" type="text" placeholder="Full Address" required />
                </div>
              </div>
            </div>
            
            {/* Property Details Section */}
            <div className="formSection">
              <h2>Property Details</h2>
              <div className="formGroup">
                <div className="item">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" type="text" placeholder="City" required />
                </div>
                <div className="item">
                  <label htmlFor="bedroom">Bedrooms</label>
                  <input min={1} id="bedroom" name="bedroom" type="number" placeholder="Number of Bedrooms" required />
                </div>
                <div className="item">
                  <label htmlFor="bathroom">Bathrooms</label>
                  <input min={1} id="bathroom" name="bathroom" type="number" placeholder="Number of Bathrooms" required />
                </div>
              </div>
              
              <div className="formGroup">
                <div className="item">
                  <label htmlFor="type">Listing Type</label>
                  <select name="type" required>
                    <option value="rent" defaultChecked>For Rent</option>
                    <option value="buy">For Sale</option>
                  </select>
                </div>
                <div className="item">
                  <label htmlFor="property">Property Type</label>
                  <select name="property" required>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                  </select>
                </div>
                <div className="item">
                  <label htmlFor="size">Total Size (sqft)</label>
                  <input min={0} id="size" name="size" type="number" placeholder="Square Footage" required />
                </div>
              </div>
            </div>
            
            {/* Description Section */}
            <div className="item description">
              <label htmlFor="desc">Description</label>
              <ReactQuill theme="snow" onChange={setValue} value={value} />
            </div>
            
            {/* Policies & Amenities Section */}
            <div className="formSection">
              <h2>Policies & Amenities</h2>
              <div className="formGroup">
                <div className="item">
                  <label htmlFor="utilities">Utilities Policy</label>
                  <select name="utilities">
                    <option value="owner">Owner is responsible</option>
                    <option value="tenant">Tenant is responsible</option>
                    <option value="shared">Shared</option>
                  </select>
                </div>
                <div className="item">
                  <label htmlFor="pet">Pet Policy</label>
                  <select name="pet">
                    <option value="allowed">Allowed</option>
                    <option value="not-allowed">Not Allowed</option>
                  </select>
                </div>
                <div className="item">
                  <label htmlFor="income">Income Requirement</label>
                  <input id="income" name="income" type="text" placeholder="e.g., '3x monthly rent'" />
                </div>
              </div>
            </div>
            
            {/* Map Section */}
            <div className="formSection mapSection">
              <h2>Property Location</h2>
              <p>Pin Your Property Location (Click on map to set marker)</p>
              <div className="mapContainer">
                <MapContainer 
                  center={marker}
                  zoom={13}
                  style={{ height: '400px', width: '100%' }}
                  whenCreated={(map) => {
                    map.invalidateSize();
                  }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker icon={markerIcon} position={marker}></Marker>
                  <MapEventsHandler handleMapClick={handleMapClick} />
                </MapContainer>
              </div>
            </div>

            {/* Submit Button */}
            <button className="sendButton" type="submit">Create Property Listing</button>
            {error && <div className="errorMessage">{error}</div>}
          </form>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="sideContainer">
        <h2>Property Images</h2>
        <p>Upload up to 4 images of your property</p>
        <div className="imageGallery">
          {images.length > 0 ? (
            images.map((image, index) => (
              <img src={image} key={index} alt={`Property image ${index + 1}`} />
            ))
          ) : (
            <div className="noImages">No images uploaded yet</div>
          )}
        </div>
        <UploadWidget
          uwConfig={{
            multiple: true,
            cloudName: "dkto2of8f",
            uploadPreset: "havenly homes estate",
            folder: "posts",
            maxFiles: 4,
          }}
          setState={setImages}
        />
        <div className="imageCounter">
          {images.length} of 4 images uploaded
        </div>
      </div>
    </div>
  );
}

export default NewPostPage;
