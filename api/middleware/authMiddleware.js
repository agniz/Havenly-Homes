import jwt from "jsonwebtoken";
// import prisma from "../prismaClient.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECERT_KEY);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    console.log('succwss')
    req.user = user;
    next();
  } catch (error) {
    console.log(error)
    res.status(401).json({ message: "Not authorized" });
  }
};
