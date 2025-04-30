import React from 'react'
import apiRequest from '../../lib/apiRequest'
import { toast } from 'react-toastify'
import usePremiumModal from '../../store/usePremiumModal'
import { useUserSubscriptionLevel } from '../../context/SubscriptionContext'
import ManageSubscriptionButton from '../../components/ManageSubscriptionButton'
import { FaCheck, FaCrown, FaArrowRight, FaCreditCard, FaHistory, FaUserShield } from 'react-icons/fa'
import './Billing.scss'

const Billing = () => {
  const {setOpenPremiumModal} = usePremiumModal()
  const level = useUserSubscriptionLevel()
  const handlePremiumClick =()=>{
    setOpenPremiumModal(true)
  }
  const isFree = level === "FREE"

  const features = [
    "Unlimited Property Listings",
    "Priority Customer Support",

  ];

  // If user is subscribed, show subscription management page
  if (!isFree) {
    return (
      <div className="billing-page">
        <div className="billing-container">
          <div className="billing-header">
            <h1 className="billing-title">
              Manage Your <span className="highlight">Subscription</span>
            </h1>
            <p className="billing-subtitle">
              View and manage your premium subscription details
            </p>
          </div>

          <div className="subscription-management">
            <div className="subscription-card">
              <div className="subscription-header">
                <h3>Current Plan</h3>
                <span className="plan-badge premium">
                  <FaCrown className="crown-icon" /> Premium
                </span>
              </div>
              
              <div className="subscription-details">
                <div className="detail-item">
                  <FaCreditCard className="detail-icon" />
                  <div className="detail-content">
                    <h4>Payment Method</h4>
                    <p>Manage your payment details</p>
                  </div>
                </div>

                <div className="detail-item">
                  <FaHistory className="detail-icon" />
                  <div className="detail-content">
                    <h4>Billing History</h4>
                    <p>View your past payments</p>
                  </div>
                </div>

                <div className="detail-item">
                  <FaUserShield className="detail-icon" />
                  <div className="detail-content">
                    <h4>Subscription Status</h4>
                    <p>Active - Premium Plan</p>
                  </div>
                </div>
              </div>

              <div className="subscription-actions">
                <ManageSubscriptionButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If user is not subscribed, show premium plans page
  return (
    <div className="billing-page">
      <div className="billing-container">
        <div className="billing-header">
          <h1 className="billing-title">
            Choose Your <span className="highlight">Plan</span>
          </h1>
          <p className="billing-subtitle">
            Unlock premium features to enhance your real estate experience
          </p>
        </div>

        <div className="plans-grid">
          {/* Free Plan */}
          <div className="plan-card free-plan">
            <div className="plan-header">
              <h3 className="plan-title">Free Plan</h3>
              <span className="plan-badge current">Current</span>
            </div>
            <p className="plan-description">Perfect for getting started</p>
            <div className="plan-price">
              <span className="price-amount">$0</span>
              <span className="price-period">/month</span>
            </div>
            <ul className="plan-features">
              <li className="feature-item">
                <FaCheck className="feature-icon" />
                <span>Basic Property Listings upto 3 times </span>
              </li>
            </ul>
          </div>

          {/* Premium Plan */}
          <div className="plan-card premium-plan">
            <div className="plan-header">
              <h3 className="plan-title">Premium Plan</h3>
              <span className="plan-badge premium">
                <FaCrown className="crown-icon" /> Premium
              </span>
            </div>
            <p className="plan-description">For serious real estate professionals</p>
            <div className="plan-price">
              <span className="price-amount">$4.99</span>
              <span className="price-period">/month</span>
            </div>
            <ul className="plan-features">
              {features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <FaCheck className="feature-icon" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handlePremiumClick}
              className="upgrade-button"
            >
              <span>Upgrade to Premium</span>
              <FaArrowRight className="arrow-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Billing