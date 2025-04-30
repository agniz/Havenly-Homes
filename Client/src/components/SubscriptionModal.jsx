import React, { useState } from 'react';
import usePremiumModal from '../store/usePremiumModal';
import { STRIPE_MONTHLY_PRICE_ID, STRIPE_YEARLY_PRICE_ID } from '../../utils';
import { toast } from 'react-toastify';
import apiRequest from '../lib/apiRequest';
import ManageSubscriptionButton from './ManageSubscriptionButton';

/**
 * A modal that prompts free users to upgrade to a premium subscription.
 * Opens and closes based on openPremiumModal state from the hook.
 */
export default function SubscriptionModal({ currentPlan }) {
  const { openPremiumModal, setOpenPremiumModal } = usePremiumModal();
  const isFreePlan = currentPlan === 'FREE';
  const [loading, setLoading] = useState(false);

    const handlePremiumClick = async(priceId)=>{
        setLoading(true)
        console.log(priceId)
        const res = await apiRequest.post('/stripe/create-checkout-session',{priceId})
        console.log(res)
        if(res.data.success){
            window.location.href  =res.data.data.url
        }else{
            toast.error('Something went wrong')
        }
        setLoading(false)
    }

  // Don't render if modal is closed
  if (!openPremiumModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={() => setOpenPremiumModal(false)}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 24,
          maxWidth: 600,
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 16 }}>
          {isFreePlan ? 'Choose Your Plan' : 'Manage Subscription'}
        </h2>
        <p style={{ marginBottom: 24 }}>
          {isFreePlan
            ? 'Free plan allows up to 3 house postings. Upgrade to monthly or yearly for unlimited postings.'
            : 'You are on a premium plan. Manage or cancel your subscription below.'}
        </p>

        {isFreePlan ? (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {/* Monthly Plan Card */}
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16,
                flex: '1 1 200px',
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
                Monthly
              </h3>
              <p style={{ fontSize: 24, fontWeight: 600, margin: '8px 0' }}>$4.99/mo</p>
              <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                <li>Unlimited house postings</li>
              </ul>
              <button
                onClick={async() => await handlePremiumClick(STRIPE_MONTHLY_PRICE_ID)}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: 4,
                  backgroundColor: '#0070f3',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                {loading ? 'Processing...' : 'Buy Now'}
              </button>
            </div>

            {/* Yearly Plan Card */}
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16,
                flex: '1 1 200px',
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
                Yearly
              </h3>
              <p style={{ fontSize: 24, fontWeight: 600, margin: '8px 0' }}>$49.99/yr</p>
              <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                <li>Unlimited house postings</li>
              </ul>
              <button
                onClick={async() => await handlePremiumClick(STRIPE_YEARLY_PRICE_ID)}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: 4,
                  backgroundColor: '#0070f3',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                {loading ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'right' }}>
           <ManageSubscriptionButton/>
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button
            onClick={() => setOpenPremiumModal(false)}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
