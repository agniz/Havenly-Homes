import { useContext, useState } from "react";
import "./profileUpdatePage.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { toast } from "react-toastify";

function ProfileUpdatePage() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState([]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await apiRequest.put(`/users/${currentUser.id}`, {
        username,
        email,
        password,
        avatar: avatar[0],
      });
      
      // Show success toast notification
      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      updateUser(res.data);
      
      // Add a small delay before navigation to let the user see the success message
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
      
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Something went wrong");
      
      // Show error toast notification
      toast.error(err.response?.data?.message || "Something went wrong", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="profileUpdatePage">
      <div className="container">
        <div className="formSection">
          <h1>Update Profile</h1>
          <form onSubmit={handleSubmit}>
            <div className="formItem">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                defaultValue={currentUser.username}
                required
              />
            </div>
            <div className="formItem">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={currentUser.email}
                required
              />
            </div>
            <div className="formItem">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password"
              />
            </div>
            {error && <div className="errorMessage">{error}</div>}
            <button type="submit" className="updateButton">
              Update Profile
            </button>
          </form>
        </div>
        <div className="uploadSection">
          <div className="avatarPreview">
            <img
              src={avatar[0] || currentUser.avatar || "/noavatar.jpg"}
              alt="User Avatar"
            />
          </div>
          <UploadWidget
            uwConfig={{
              cloudName: "dkto2of8f",
              uploadPreset: "havenly homes estate",
              multiple: false,
              maxImageFileSize: 2000000,
              folder: "avatars",
            }}
            setState={setAvatar}
          />
        </div>
      </div>
    </div>
  );
}

export default ProfileUpdatePage;