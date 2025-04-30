import React, { useState, useEffect } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSignInAlt } from "react-icons/fa";

// Enhanced Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <span className="toast-icon">
        {type === 'success' ? '✓' : '✗'}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

function Login() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const { updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");
      const formData = new FormData(e.target);
  
      const username = formData.get("username");
      const password = formData.get("password");
  
      try {
        const res = await apiRequest.post("/auth/login", {
          username,
          password,
        });

        setToast({
          message: "Login Successful! Redirecting...",
          type: 'success'
        });

        updateUser(res.data);
        
        setTimeout(() => {
          navigate("/");
        }, 2000);
             
      } catch(err) {
        setToast({
          message: err.response?.data?.message || "Login Failed",
          type: 'error'
        });
        
        setError(err.response?.data?.message || "Login Failed");
      } finally {
        setIsLoading(false);
      }
    };

    const handleToastClose = () => {
      setToast(null);
    };

    return (
      <div className="login">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={handleToastClose} 
          />
        )}

        <div className="formContainer">
          <div className="formWrapper">
            <div className="formHeader">
              <h1>Welcome Back</h1>
              <p>Sign in to continue to your account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="inputGroup">
                <label htmlFor="username">Username</label>
                <div className="inputWithIcon">
                  <FaUser className="inputIcon" />
                  <input 
                    id="username"
                    name="username" 
                    required 
                    minLength={3} 
                    maxLength={20} 
                    type="text" 
                    placeholder="Enter your username" 
                  />
                </div>
              </div>

              <div className="inputGroup">
                <label htmlFor="password">Password</label>
                <div className="inputWithIcon">
                  <FaLock className="inputIcon" />
                  <input 
                    id="password"
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    required
                  />
                  <button 
                    type="button"
                    className="togglePassword"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button 
                className={`submitButton ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loadingSpinner"></span>
                ) : (
                  <>
                    <FaSignInAlt className="buttonIcon" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {error && <div className="errorMessage">{error}</div>}

              <div className="registerLink">
                Don't have an account? <Link to="/register">Sign Up</Link>
              </div>
            </form>
          </div>
        </div>

        <div className="imageContainer">
          <div className="imageOverlay">
            <h2>Find Your Perfect Home</h2>
            <p>Join thousands of satisfied customers who found their dream property with us</p>
          </div>
          <img src="/bg.png" alt="Modern Home" />
        </div>
      </div>
    );
}

export default Login;