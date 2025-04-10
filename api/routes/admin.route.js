import express from "express";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import { getAllUsers, deleteUser, getAllListings, deleteListing, getUserCount, getDashboardStats, getListingCount } from "../controllers/admin.controller.js";
import { approveProperty, getUnapprovedProperties } from "../controllers/admin.controller.js";

const router = express.Router();

// Admin-only routes
router.get("/users", verifyAdmin, getAllUsers);
router.get('/users/count', getUserCount);
router.delete("/users/:id", verifyAdmin, deleteUser);

// fetch getUnapprovedProperties
router.get("/proprties/unapproved", verifyAdmin, getUnapprovedProperties);

// Moderator & Admin can access
router.get("/listings", verifyAdmin, getAllListings);
router.get('/listings/count', getListingCount);

router.delete("/listings/:id", verifyAdmin, deleteListing);
router.put("/listings/:id/approve",verifyAdmin, approveProperty);

// Dashboard route
router.get('/stats/listing', getDashboardStats);




export default router;
