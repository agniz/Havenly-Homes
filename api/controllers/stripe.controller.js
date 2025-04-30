import prisma from '../lib/prisma.js';
import stripe from '../lib/stripe.js';


const PRICING_PLANS = {
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID, 
    yearly: process.env.STRIPE_YEARLY_PRICE_ID,
};

export const createCheckoutSession =async(req,res)=>{
    const tokenUserId = req.userId;
    const {priceId} = req.body;
    if(!priceId){
        res.json({ success:false, message:'Invalid Price Id' });

    }
    try {
        const user = await prisma.user.findUnique({
            where:{id:tokenUserId}
        })
        
        let stripeCustomerId = user.stripeCustomerId || undefined
        const success_url = `${process.env.CLIENT_URL}/billing/success`
        const cancel_url = `${process.env.CLIENT_URL}/billing/success`

        const stripeSession = await stripe.checkout.sessions.create({
            line_items:[{price:priceId,quantity:1}],
            mode:'subscription',
            success_url,
            cancel_url,
            customer:stripeCustomerId,
            customer_email:stripeCustomerId ? undefined : user.email,
            metadata:{
                userId: tokenUserId
            },
            subscription_data:{
                metadata:{
                    userId: tokenUserId
                }
            },
            custom_text:{
                terms_of_service_acceptance:{
                    message:"I have read Hevanly terms and agree to them"
                }
            },
            consent_collection:{
                terms_of_service:'required'
            }

        })
        if(!stripeSession.url){
            throw new Error('Failed to procees payment')
        }
        res.json({ success:true, data:{
            url:stripeSession.url
        } });
        
    } catch (error) {
        res.json({success:false,message:'error'})
        
    }
}

export const stripeWebhook = async(req,res)=>{
    try {
        let event;
        const signature = req.headers['stripe-signature']
        if(!signature){
            return res.status(400).json({success:false,message:'Missing stripe signature'})
        }
        console.log(event)
        event = stripe.webhooks.constructEvent(req.body,signature,process.env.STRIPE_WEBHOOK_SECRET)
        switch (event.type){
            case "checkout.session.completed":
                await handleSessionCompleted(event.data.object)
                break;
            case "customer.subscription.created":
            case "customer.subscription.updated":
                await handleSubscriptionCreatedOrUpdated(event.data.object.id)
                break;
            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object)
                break
            default:
                console.log("Unhandled event type:", event.type)
                break
        }
        return res.status(200).json({success:true,message:'Event Received'})
        
    } catch (error) {
    console.log(error)
        return res.status(500).json({success:false,message:"Something went wrong! Please try again"})
    }
}


const handleSessionCompleted = async(session)=>{
    const userId = session.metadata.userId
    if(!userId){
        throw new Error('User id is missing')
    }
    await prisma.user.update({
        where:{id:userId},
        data:{stripeCustomerId:session.customer }
    })

}
const handleSubscriptionCreatedOrUpdated = async(subscriptionId)=>{
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    if(subscription.status === 'active' || subscription.status === 'trialing'|| subscription.status === 'past_due'){
        await Promise.all([
            prisma.userSubscription.upsert({
                where:{
                    userId:subscription.metadata.userId
                },create:{
                    userId:subscription.metadata.userId,
                    stripeSubscriptionId:subscription.id,
                    stripeCustomerId:subscription.customer,
                    stripePriceId:subscription.items.data[0].price.id,
                    stripeCurrentPeriodEnd:new Date(subscription.current_period_end * 1000),
                    stripeCancelAtPeriodEnd:subscription.cancel_at_period_end,
                },
                update:{
                    stripePriceId:subscription.items.data[0].price.id,
                    stripeCancelAtPeriodEnd:subscription.cancel_at_period_end,
                    stripeCurrentPeriodEnd:new Date(subscription.cancel_at_period_end * 1000)
                }
            })
        ])
        prisma.user.update({
            where:{
                id:subscription.metadata.userId
            },data:{
                stripeCustomerId:subscription.customer
            }
        })
    }else{
        await Promise.all([
            prisma.userSubscription.deleteMany({
                where:{
                    stripeCustomerId:subscription.customer
                }
            }),
            prisma.user.update({
                where:{
                    id:subscription.metadata.userId
                },
                data:{
                    stripePriceId:null
                }
            })
        ])
    }
}
const handleSubscriptionDeleted=async(subscription)=>{
    await Promise.all([
        prisma.userSubscription.deleteMany({
            where:{
                stripeCustomerId:subscription.customer
            }
        }),
        prisma.user.update({
            where:{
                id:subscription.metadata.userId
            },
            data:{
                stripeCustomerId:null
            }
        })
    ])
}


export const createCustomerPortalSession =async(req,res)=>{
    try {
        console.log('hwllo')
        const tokenUserId = req.userId;
        const user =await prisma.user.findUnique({
            where:{
                id:tokenUserId,
            },
            select:{
                stripeCustomerId:true,
            }
        })
        if(!user || !user.stripeCustomerId){
            throw new Error('Np stripe customer id')
        }
        const stripeCustomerId = user.stripeCustomerId 
        const return_url =  `${process.env.CLIENT_URL}/billing`
        const stripeSession = await stripe.billingPortal.sessions.create({
            customer:stripeCustomerId,
            return_url
        })
        if(!stripeSession.url){
            throw new Error('Couldnot create customer portal session')
        }
        res.json({ success:true, data:{
            url:stripeSession.url
        } });
    } catch (error) {        
        console.log(error)
        return res.status(500).json({success:false,message:"Something went wrong! Please try again"})
    }
    


}