import { useState, useEffect, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../lib/apiRequest';
import './subscriptionPlans.scss';

const stripePromise = loadStripe('pk_test_51R0xeVBC8xgEjOOOWASDhDDzO1s8iNKYCDSovA28ivlEX7u2pWF1InrFp3R1zuny0K88peEQbkybKq00RlmF8JsN00DXEREond'); // Replace with your Stripe publishable key

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    listings: 3,
    features: [
      'Up to 3 property listings',
      'Basic property analytics',
      'Standard support'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 29.99,
    listings: 10,
    features: [
      'Up to 10 property listings',
      'Advanced property analytics',
      'Priority support',
      'Featured listings'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49.99,
    listings: 'Unlimited',
    features: [
      'Unlimited property listings',
      'Premium property analytics',
      '24/7 Priority support',
      'Featured listings',
      'Custom branding'
    ]
  }
];

function SubscriptionPlans() {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await apiRequest.get('/users/subscription');
        setCurrentPlan(response.data.plan);
      } catch (err) {
        console.error('Error fetching user plan:', err);
      }
    };

    if (currentUser) {
      fetchUserPlan();
    }
  }, [currentUser]);

  const handleSubscribe = async (planId) => {
    try {
      setLoading(true);
      const stripe = await stripePromise;
      
      // Create checkout session
      const response = await apiRequest.post('/payment/create-checkout-session', {
        planId,
        userId: currentUser.id
      });

      // Redirect to checkout
      const result = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error('Error subscribing:', err);
      alert('Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscriptionPlans">
      <div className="plansHeader">
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your real estate needs</p>
      </div>
      <div className="plansContainer">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`planCard ${currentPlan === plan.id ? 'active' : ''}`}
          >
            <div className="planHeader">
              <h2>{plan.name}</h2>
              <div className="price">
                {plan.price === 0 ? (
                  <span>Free</span>
                ) : (
                  <>
                    <span className="amount">${plan.price}</span>
                    <span className="period">/month</span>
                  </>
                )}
              </div>
            </div>
            <div className="planFeatures">
              <div className="mainFeature">
                <span className="listings">{plan.listings}</span>
                <span className="label">Property Listings</span>
              </div>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <button 
              className={`subscribeBtn ${currentPlan === plan.id ? 'current' : ''}`}
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading || currentPlan === plan.id}
            >
              {currentPlan === plan.id ? 'Current Plan' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubscriptionPlans; 