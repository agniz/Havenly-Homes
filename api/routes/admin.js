const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");

// Get all users
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get all listings
router.get("/listings", async (req, res) => {
  const listings = await Listing.find();
  res.json(listings);
});

module.exports = router;
