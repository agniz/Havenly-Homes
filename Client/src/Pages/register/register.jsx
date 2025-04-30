import React, { useState, useEffect } from "react";
import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaCheck, FaTimes } from "react-icons/fa";

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

function Register() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Check password strength
    setPasswordStrength({
      length: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    });
  }, [password]);

  useEffect(() => {
    // Validate email on change
    if (email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      setEmailError(!emailRegex.test(email));
    } else {
      setEmailError(false);
    }
  }, [email]);

  const validateForm = (username, email, password) => {
    if (username.length < 3 || username.length > 20) {
      throw new Error("Username must be between 3 and 20 characters");
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      const emailInput = document.getElementById("email");
      if (emailInput) {
        emailInput.classList.add("error-input");
        setTimeout(() => emailInput.classList.remove("error-input"), 1000);
      }
      throw new Error("Please enter a valid email address");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (!(/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password))) {
      throw new Error("Password must contain uppercase, lowercase letters and numbers");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.target);

    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      validateForm(username, email, password);

      const res = await apiRequest.post("/auth/register", {
        username, 
        email, 
        password
      });
      
      setToast({
        message: "Registration Successful! Redirecting to login...",
        type: 'success'
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch(err) {
      setIsLoading(false);
      
      // Check for API response errors
      if (err.response?.data) {
        const errorMessage = err.response.data.message || "Registration Failed";
        
        // Handle specific API errors
        if (errorMessage.toLowerCase().includes("email") && 
           (errorMessage.toLowerCase().includes("exist") || 
            errorMessage.toLowerCase().includes("taken") || 
            errorMessage.toLowerCase().includes("already"))) {
          
          const emailInput = document.getElementById("email");
          if (emailInput) {
            emailInput.classList.add("error-input");
            setTimeout(() => emailInput.classList.remove("error-input"), 1000);
          }
          
          setToast({
            message: "This email is already registered. Please try logging in instead.",
            type: 'error'
          });
        } else if (errorMessage.toLowerCase().includes("email") && 
                  errorMessage.toLowerCase().includes("valid")) {
          
          const emailInput = document.getElementById("email");
          if (emailInput) {
            emailInput.classList.add("error-input");
            setTimeout(() => emailInput.classList.remove("error-input"), 1000);
          }
          
          setToast({
            message: "Please enter a valid email address",
            type: 'error'
          });
        } else {
          setToast({
            message: errorMessage,
            type: 'error'
          });
        }
        
        setError(errorMessage);
      } else {
        // Handle client-side errors
        const errorMessage = err.message || "Registration Failed";
        setToast({
          message: errorMessage,
          type: 'error'
        });
        setError(errorMessage);
      }
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleToastClose = () => {
    setToast(null);
  };

  const getPasswordStrengthClass = () => {
    const { length, hasUppercase, hasLowercase, hasNumber, hasSpecial } = passwordStrength;
    const criteria = [length, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (criteria === 0) return "";
    if (criteria < 3) return "weak";
    if (criteria < 5) return "medium";
    return "strong";
  };

  return (
    <div className="register">
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
            <h1>Create an Account</h1>
            <p>Join Havenly Homes and find your dream property</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="inputGroup">
              <label htmlFor="username">Username</label>
              <div className="inputWithIcon">
                <FaUser className="inputIcon" />
                <input 
                  id="username"
                  name="username" 
                  type="text" 
                  placeholder="Choose a username" 
                  required
                  minLength={3}
                  maxLength={20}
                />
              </div>
              <p className="inputHint">Username must be between 3-20 characters</p>
            </div>

            <div className="inputGroup">
              <label htmlFor="email">Email</label>
              <div className="inputWithIcon">
                <FaEnvelope className="inputIcon" />
                <input 
                  id="email"
                  name="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  required
                  pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                  title="Please enter a valid email address"
                  value={email}
                  onChange={handleEmailChange}
                  className={emailError && email ? "error-input" : ""}
                />
              </div>
              {emailError && email ? (
                <p className="inputHint error">Please enter a valid email address</p>
              ) : (
                <p className="inputHint">Please enter a valid email address (e.g., example@domain.com)</p>
              )}
            </div>

            <div className="inputGroup">
              <label htmlFor="password">Password</label>
              <div className="inputWithIcon">
                <FaLock className="inputIcon" />
                <input 
                  id="password"
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a password" 
                  required
                  minLength={8}
                  value={password}
                  onChange={handlePasswordChange}
                  className={getPasswordStrengthClass()}
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
              {password && (
                <div className="passwordValidation">
                  <div className={`validationItem ${passwordStrength.length ? 'valid' : 'invalid'}`}>
                    {passwordStrength.length ? <FaCheck /> : <FaTimes />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`validationItem ${passwordStrength.hasUppercase ? 'valid' : 'invalid'}`}>
                    {passwordStrength.hasUppercase ? <FaCheck /> : <FaTimes />}
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`validationItem ${passwordStrength.hasLowercase ? 'valid' : 'invalid'}`}>
                    {passwordStrength.hasLowercase ? <FaCheck /> : <FaTimes />}
                    <span>One lowercase letter</span>
                  </div>
                  <div className={`validationItem ${passwordStrength.hasNumber ? 'valid' : 'invalid'}`}>
                    {passwordStrength.hasNumber ? <FaCheck /> : <FaTimes />}
                    <span>One number</span>
                  </div>
                  <div className={`validationItem ${passwordStrength.hasSpecial ? 'valid' : 'invalid'}`}>
                    {passwordStrength.hasSpecial ? <FaCheck /> : <FaTimes />}
                    <span>One special character</span>
                  </div>
                </div>
              )}
            </div>

            <button 
              className={`submitButton ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loadingSpinner"></span>
              ) : (
                <>
                  <FaUserPlus className="buttonIcon" />
                  <span>Create Account</span>
                </>
              )}
            </button>

            {error && <div className="errorMessage">{error}</div>}

            <div className="loginLink">
              Already have an account? <Link to="/login">Sign In</Link>
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

export default Register;