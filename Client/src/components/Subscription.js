import { useState, useEffect } from 'react';

const Subscription = ({ userId }) => {
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);

    useEffect(() => {
        fetch(`/api/user/${userId}`)
            .then(res => res.json())
            .then(data => setSubscriptionStatus(data.subscriptionStatus));
    }, [userId]);

    const subscribe = async (plan) => {
        const response = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, plan })
        });
        const data = await response.json();
        window.location.href = data.url;
    };

    return (
        <div>
            <h2>Subscription Plan</h2>
            {subscriptionStatus === 'active' ? (
                <p>You have an active subscription.</p>
            ) : (
                <>
                    <button onClick={() => subscribe('monthly')}>Subscribe Monthly</button>
                    <button onClick={() => subscribe('yearly')}>Subscribe Yearly</button>
                </>
            )}
        </div>
    );
};

export default Subscription;
