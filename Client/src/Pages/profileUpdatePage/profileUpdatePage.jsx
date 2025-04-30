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
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");

  const navigate = useNavigate();

  // Password validation criteria
  const validatePassword = (password) => {
    if (!password) return true; // Empty password is allowed during update (no change)
    
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (password.length < minLength) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    } else if (!hasUpperCase) {
      setPasswordError("Password must contain at least one uppercase letter");
      return false;
    } else if (!hasLowerCase) {
      setPasswordError("Password must contain at least one lowercase letter");
      return false;
    } else if (!hasNumber) {
      setPasswordError("Password must contain at least one number");
      return false;
    } else if (!hasSpecialChar) {
      setPasswordError("Password must contain at least one special character");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  // Password confirmation validation
  const validatePasswordConfirmation = () => {
    if (!password && !confirmedPassword) return true; // Both empty is fine
    
    if (password !== confirmedPassword) {
      setPasswordConfirmError("Passwords do not match");
      return false;
    } else {
      setPasswordConfirmError("");
      return true;
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    
    // Also validate confirmation if it's already entered
    if (confirmedPassword) {
      if (newPassword !== confirmedPassword) {
        setPasswordConfirmError("Passwords do not match");
      } else {
        setPasswordConfirmError("");
      }
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmedPassword(newConfirmPassword);
    
    if (password !== newConfirmPassword) {
      setPasswordConfirmError("Passwords do not match");
    } else {
      setPasswordConfirmError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password if provided
    const isPasswordValid = validatePassword(password);
    const isConfirmationValid = validatePasswordConfirmation();
    
    if (!isPasswordValid || !isConfirmationValid) {
      return; // Stop form submission if validation fails
    }
    
    const formData = new FormData(e.target);
    const { username, email } = Object.fromEntries(formData);

    try {
      // Only include password in request if it's provided
      const updateData = {
        username,
        email,
        avatar: avatar[0],
      };
      
      if (password) {
        updateData.password = password;
      }

      const res = await apiRequest.put(`/users/${currentUser.id}`, updateData);
      
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
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password (optional)"
                value={password}
                onChange={handlePasswordChange}
              />
              {passwordError && <div className="fieldError">{passwordError}</div>}
              <div className="passwordRequirements">
                <small>Password requirements:</small>
                <ul>
                  <li className={password.length >= 8 ? "valid" : ""}>At least 8 characters</li>
                  <li className={/[A-Z]/.test(password) ? "valid" : ""}>At least one uppercase letter</li>
                  <li className={/[a-z]/.test(password) ? "valid" : ""}>At least one lowercase letter</li>
                  <li className={/[0-9]/.test(password) ? "valid" : ""}>At least one number</li>
                  <li className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? "valid" : ""}>At least one special character</li>
                </ul>
              </div>
            </div>
            <div className="formItem">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmedPassword}
                onChange={handleConfirmPasswordChange}
                disabled={!password}
              />
              {passwordConfirmError && <div className="fieldError">{passwordConfirmError}</div>}
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