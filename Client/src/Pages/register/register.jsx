import React, { useState, useEffect } from "react";
import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiX, FiArrowRight } from "react-icons/fi";

// Enhanced Toast Component with icons
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <span className="toast-icon">
        {type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <FiX />
      </button>
    </div>
  );
};

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validations, setValidations] = useState({
    usernameValid: true,
    emailValid: true,
    passwordValid: true
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation feedback
    if (name === "username") {
      setValidations(prev => ({
        ...prev,
        usernameValid: value.length >= 3 && value.length <= 20
      }));
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setValidations(prev => ({
        ...prev,
        emailValid: emailRegex.test(value)
      }));
    } else if (name === "password") {
      setValidations(prev => ({
        ...prev,
        passwordValid: value.length >= 8
      }));
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const validateForm = (username, email, password) => {
    if (username.length < 3 || username.length > 20) {
      throw new Error("Username must be between 3 and 20 characters");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { username, email, password } = formData;

    try {
      validateForm(username, email, password);

      await apiRequest.post("/auth/register", { username, email, password });
      
      setToast({
        message: "Registration Successful! Redirecting to login...",
        type: "success",
      });
      
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Registration Failed";
      setToast({
        message: errorMessage,
        type: "error",
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToastClose = () => {
    setToast(null);
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "#ddd";
    if (passwordStrength === 1) return "#f44336";
    if (passwordStrength === 2) return "#ff9800";
    if (passwordStrength === 3) return "#4caf50";
    return "#2e7d32";
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
        <form onSubmit={handleSubmit}>
          <h1>Create an Account</h1>
          <p className="subtitle">Join our community today</p>
          
          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              required
              minLength={3}
              maxLength={20}
              value={formData.username}
              onChange={handleInputChange}
              className={formData.username && !validations.usernameValid ? "error" : ""}
            />
            {formData.username && !validations.usernameValid && (
              <div className="validation-message">Username must be between 3 and 20 characters</div>
            )}
          </div>
          
          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={formData.email && !validations.emailValid ? "error" : ""}
            />
            {formData.email && !validations.emailValid && (
              <div className="validation-message">Please enter a valid email address</div>
            )}
          </div>
          
          <div className="input-group">
            <FiLock className="input-icon" />
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleInputChange}
                className={formData.password && !validations.passwordValid ? "error" : ""}
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            
            {formData.password && (
              <>
                <div className="password-strength-meter">
                  <div className="strength-bar">
                    {[...Array(4)].map((_, index) => (
                      <div 
                        key={index} 
                        className={`bar-segment ${index < passwordStrength ? "active" : ""}`}
                        style={{ backgroundColor: index < passwordStrength ? getPasswordStrengthColor() : "" }}
                      />
                    ))}
                  </div>
                  <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                
                <div className="password-requirements">
                  <div className={`requirement ${formData.password.length >= 8 ? "met" : ""}`}>
                    At least 8 characters
                  </div>
                  <div className={`requirement ${/[A-Z]/.test(formData.password) ? "met" : ""}`}>
                    One uppercase letter
                  </div>
                  <div className={`requirement ${/[0-9]/.test(formData.password) ? "met" : ""}`}>
                    One number
                  </div>
                  <div className={`requirement ${/[^A-Za-z0-9]/.test(formData.password) ? "met" : ""}`}>
                    One special character
                  </div>
                </div>
              </>
            )}
            
            {formData.password && !validations.passwordValid && (
              <div className="validation-message">Password must be at least 8 characters long</div>
            )}
          </div>
          
          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                Create Account <FiArrowRight className="button-icon" />
              </>
            )}
          </button>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="auth-links">
            <span>Already have an account? </span>
            <Link className="auth-link" to="/login">Sign in</Link>
          </div>
        </form>
      </div>
      
      <div className="imgContainer">
        <img src="/bg.png" alt="Decorative background" className="medium-image" />
      </div>
    </div>
  );
}

export default Register;