import jwt from "jsonwebtoken"

export const verifyToken = (req,res,next) => {
    const token = req.cookies.token;
    
        if(!token) return res.status(401).json({message:"Not Aunthenticated!" });
    
        jwt.verify(token, process.env.JWT_SECERT_KEY, async (err, payload) => {
            
            if (err) return res.status(403).json({ message: "Token is not Valid!" });
            req.userId = payload.id;

            next();
        });
    
}