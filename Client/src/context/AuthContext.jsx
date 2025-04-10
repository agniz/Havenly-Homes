import { createContext, useEffect, useState } from "react";
// import { data } from "react-router-dom";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null

    );

    const updateUser = (data) => {
        setCurrentUser(data);
    };

    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(currentUser));
        console.log(currentUser)
    }, [currentUser]);

    return (
        <AuthContext.Provider value = {{ currentUser,updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};