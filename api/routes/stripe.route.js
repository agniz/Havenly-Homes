import express from "express";
import {verifyToken} from "../middleware/verifyToken.js";
import { createCheckoutSession, createCustomerPortalSession } from "../controllers/stripe.controller.js";

const router = express.Router()

router.post("/create-checkout-session",verifyToken,createCheckoutSession);
router.post('/create-portal',verifyToken,createCustomerPortalSession)
export default router;

