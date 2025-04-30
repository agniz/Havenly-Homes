

export const STRIPE_YEARLY_PRICE_ID='price_1RHFYmBC8xgEjOOOr1HYxjuX'
export const STRIPE_MONTHLY_PRICE_ID='price_1RD3xoBC8xgEjOOOXdsskzDG'

export function canCreatePost(subscriptionLevel,currentPostCount){
    const maxPostMap= {
        FREE:3,
        MONTHLY:Infinity,
        YEARLY:Infinity
    }
    const maxPost = maxPostMap[subscriptionLevel]
    return currentPostCount < maxPost
}