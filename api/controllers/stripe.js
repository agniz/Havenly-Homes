const express = require('express');
const stripe = require('stripe')(process.env.Ssk_test_51R0xeVBC8xgEjOOOV3Lm61fTrJzNz9ESTf5C52n7OnKwLe87NNzNY5OM4oDzj0RAWf2C4s0xPDmSMFQ722D9ReY900nM1ds1ym);
const prisma = require('../prisma/client');
const router = express.Router();

const PRICING_PLANS = {
    monthly: process.env.STRIPE_MONTHLY_PLAN_ID, 
    yearly: process.env.STRIPE_YEARLY_PLAN_ID,
};

// Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    const { userId, plan } = req.body;
    if (!PRICING_PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: PRICING_PLANS[plan], quantity: 1 }],
        success_url: `${process.env.FRONTEND_URL}/subscription-success`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription-cancel`,
        metadata: { userId },
    });

    res.json({ url: session.url });
});

// Stripe Webhook to Handle Payments
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const event = req.body;

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;

        await prisma.user.update({
            where: { id: userId },
            data: { subscriptionStatus: 'active', subscriptionId: session.subscription },
        });
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        await prisma.user.updateMany({
            where: { subscriptionId: subscription.id },
            data: { subscriptionStatus: 'inactive' },
        });
    }

    res.sendStatus(200);
});

module.exports = router;
