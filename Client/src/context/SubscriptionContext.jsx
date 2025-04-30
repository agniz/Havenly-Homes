import { createContext, useContext } from "react"

const UserSubscriptionLevelContext = createContext(undefined)

export default function UserSubscriptionLevelProvider({
    children,userSubscriptionLevel
}){
    return (
        <UserSubscriptionLevelContext.Provider value={userSubscriptionLevel}>
            {children}
        </UserSubscriptionLevelContext.Provider>
    )
}

export function useUserSubscriptionLevel(){
    const context = useContext(UserSubscriptionLevelContext)
    if(context === undefined){
        throw new Error('useUserSubscriptionLevel must be used within a UserSubscriptionLevelProvider')
    }
    return context
}