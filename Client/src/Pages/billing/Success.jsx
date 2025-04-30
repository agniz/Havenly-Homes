import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Success.scss';
import { FaCheckCircle, FaHome, FaCrown } from 'react-icons/fa';

const Success = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-header">
          <div className="success-icon">
            <FaCheckCircle />
          </div>
          <div className="crown-icon">
            <FaCrown />
          </div>
        </div>
        
        <h1>Payment Successful!</h1>
        <div className="message-container">
          <p className="main-message">Thank you for upgrading your subscription!</p>
          <p className="sub-message">Your premium features are now activated.</p>
          <div className="benefits">
            <h3>Your Premium Benefits:</h3>
            <ul>
              <li>✨ Unlimited Property Listings</li>
              <li>🌟 Priority Support</li>

            </ul>
          </div>
        </div>
        
        <div className="action-section">
          <p className="redirect-text">Redirecting to homepage in {countdown} seconds...</p>
          <div className="button-group">
            <button className="home-button primary" onClick={() => navigate('/')}>
              <FaHome /> Return to Home
            </button>
            <button className="dashboard-button secondary" onClick={() => navigate('/profile')}>
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success; 