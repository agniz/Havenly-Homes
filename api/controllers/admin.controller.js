import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    console.log(users)
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
export const getUserCount = async (req, res) => {
  try {
    const count = await prisma.user.count();
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ error: "Failed to fetch user count" });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};


// Get all listings
export const getAllListings = async (req, res) => {
  try {
    console.log('form listing')
    const listings = await prisma.post.findMany();
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};
export const getListingCount = async (req, res) => {
  try {
    const count = await prisma.post.count({
      where: { isApproved: true }
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching listing count:", error);
    res.status(500).json({ error: "Failed to fetch listing count" });
  }
};

// Delete a listing
export const deleteListing = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.post.delete({where:{id}})
    res.status(200).json({message:"Deleted Success"});
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to delete listing" });
  }
};
export const approveProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await prisma.post.update({
      where: { id },
      data: { isApproved: true },
    });

    res.status(200).json({ message: "Property approved successfully", property });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve property" });
  }
};
export const getUnapprovedProperties = async (req, res) => {
  try {
    const properties = await prisma.post.findMany({
      where: { isApproved: false },
    });

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching unapproved properties:", error);
    res.status(500).json({ error: "Failed to fetch unapproved properties" });
  }
};
// Dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [userCount, listingCount, unapprovedCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count({ where: { isApproved: true } }),
      prisma.post.count({ where: { isApproved: false } })
    ]);

    res.status(200).json({
      userCount,
      listingCount,
      unapprovedCount,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};