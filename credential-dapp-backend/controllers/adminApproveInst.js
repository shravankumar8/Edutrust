require("dotenv").config();
const { ethers } = require("ethers");
const contractData = require("../CredentialNFT.json");
const express = require("express");
const {
  auth,
  authUser,
  authInstitution,
  authAdmin,
} = require("../middleware/auth");
const User = require("../models/User");
const Institution = require("../models/Institution");
const {
  registerInstitutionOnBlockchain,
} = require("../helpers/blockchainHelper");
const router = express.Router();

const { provider } = require("../blockchain.config.js");

// Hardcoded secure admin password (move to .env in production)
const SECURE_ADMIN_PASSWORD = "SuperSecretAdmin123";

// User Dashboard: Fetch certificates


// Institution Dashboard: Placeholder


// Apply to become an institution
router.post("/apply-institution", authUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "user") {
      return res
        .status(400)
        .json({ message: "Only users can apply to become institutions" });
    }

    if (user.institutionApplicationStatus !== "none") {
      return res.status(400).json({ message: "Application already submitted" });
    }

    if (!user.walletAddress) {
      return res
        .status(400)
        .json({ message: "Wallet address must be linked before applying" });
    }

    const {
      officialEmail,
      registrationNumber,
      walletAddress,
      name,
      address,
      contact,
      website,
      adminPassword,
    } = req.body;

    if (!officialEmail || !registrationNumber || !walletAddress) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ message: "Invalid wallet address" });
    }

    const institution = await Institution.create({
      userId: userId,
      officialEmail,
      registrationNumber,
      walletAddress: walletAddress.toLowerCase(),
      name,
      address,
      contact,
      website,
    });

    user.institutionApplicationStatus = "pending";
    await user.save();

    if (adminPassword === SECURE_ADMIN_PASSWORD) {
      try {
        const txHash = await registerInstitutionOnBlockchain(walletAddress);
        return res.status(200).json({
          success: true,
          message: "Application submitted and registered on blockchain",
          institutionId: institution._id,
          txHash,
        });
      } catch (blockchainError) {
        return res.status(500).json({
          success: false,
          message: "Application submitted but blockchain registration failed",
          institutionId: institution._id,
          details: blockchainError.message,
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        message:
          "Application submitted for review (admin password required for blockchain registration)",
        institutionId: institution._id,
      });
    }
  } catch (error) {
    console.error("Institution Application Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
      details: error.message,
    });
  }
});

// Update wallet address


// Approve Institution (New Route)
router.put("/:id", authAdmin, async (req, res) => {
  try {
    const { id } = req.params; // Institution ID from URL parameter

    // Find the institution by MongoDB _id
    const institution = await Institution.findById(id);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // Update institution status to verified
    institution.isVerified = true;
    await institution.save();

    // Update the associated user's role to "admin"
    const user = await User.findOneAndUpdate(
      { clerkId: institution.userId }, // Match by clerkId
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Associated user not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Institution approved and user role updated to admin",
      institutionId: institution._id,
    });
  } catch (error) {
    console.error("Institution Approval Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve institution",
      details: error.message,
    });
  }
});

module.exports = router;
