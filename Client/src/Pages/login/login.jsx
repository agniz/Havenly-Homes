import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import { FiUser, FiLock, FiArrowRight, FiMail } from "react-icons/fi";
import "./login.scss";

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
      {message}
      <button onClick={onClose} className="toast-close">
        ×
      </button>
    </div>
  );
};

function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await apiRequest.post("/auth/login", formData);
      
      setToast({
        message: "Login Successful! Redirecting...",
        type: 'success'
      });

      updateUser(res.data);
      
      setTimeout(() => navigate("/"), 2000);
    } catch(err) {
      const errorMessage = err.response?.data?.message || "Login Failed";
      setToast({ message: errorMessage, type: 'error' });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const email = prompt("Please enter your email address:");
    if (!email) return;

    try {
      await apiRequest.post("/auth/forgot-password", { email });
      setToast({
        message: "Password reset link sent to your email!",
        type: 'success'
      });
    } catch (err) {
      setToast({
        message: "Error sending reset link. Please try again.",
        type: 'error'
      });
    }
  };

  const handleToastClose = () => setToast(null);

  return (
    <div className="login">
      {toast && <Toast message={toast.message} type={toast.type} onClose={handleToastClose} />}

      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Welcome Back</h1>
          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              name="username"
              type="text"
              placeholder="Username or Email"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          

          <button 
            type="submit" 
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                Login <FiArrowRight className="button-icon" />
              </>
            )}
          </button>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="auth-links">
            
            <Link to="/register" className="auth-link">
              Sign Up
            </Link>
            <span>Don't have an account? </span>
          </div>
          <div className="form-options">
            <Link 
              to="#" 
              onClick={handleForgotPassword}
              className="forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="Decorative background" />
      </div>
    </div>
  );
}

export default Login;