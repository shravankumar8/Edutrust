require("dotenv").config();
const { ethers } = require("ethers");
const contractData = require("../CredentialNFT.json");
const express = require("express");
const CLERK_PEM_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7yZbF/Qq0btlNEMh421f
Hg0VQJISUSOG5aZ6g6N6DQFEYv+WzkCXDH6WCt15ornYjTDw1PwOkJEGa5yfwqC7
+os9dAv9wEcF8T5H21l5j3UjnLnmR4AeBa2ahNzomlz9JLUPNgmnSZ2U10gl/wpk
DUDR3UsNmVMxOQdeJSVKiZ7aYNbc1epQ13W6vV7Kvb8iPBU3qmg4MBglpelrW/M2
+U8xgS1xmMPYyoZZokSwUmw/LLVuKb0rgdPL6kYJUEkrj5SlJZtfcAPy/pvgJ4g/
7nXugYl2NCe1f+c0R4Cl7iOan4LFGLr6hCrQQtoOjMw4oTCQdpDizRVzPC5HLpGB
QwIDAQAB
-----END PUBLIC KEY-----`;
const {
  auth,
  authUser,
  authInstitution,
  authAdmin,
} = require("../middleware/auth");
const User = require("../models/User");
const Institution = require("../models/Institution");

const jwt = require("jsonwebtoken");
const {
  registerInstitutionOnBlockchain,
} = require("../helpers/blockchainHelper");
const router = express.Router();

const { provider } = require("../blockchain.config.js");

// Hardcoded secure admin password (move to .env in production)
const SECURE_ADMIN_PASSWORD = "SuperSecretAdmin123";

// User Dashboard: Fetch certificates
router.get("/dashboard/user", authUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ clerkId: userId });
    if (!user || !user.walletAddress) {
      return res
        .status(404)
        .json({ error: "User not found or no wallet linked" });
    }

    const walletAddress = user.walletAddress.toLowerCase();
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractData.abi,
      provider
    );
    const certificateHashes = await contract.getCertificatesByOwner(
      walletAddress
    );
    const certificates = [];

    for (const hash of certificateHashes) {
      const cert = await contract.certificates(hash);
      certificates.push({
        certificateHash: hash,
        recipient: cert.recipient,
        metadataURI: cert.metadataURI,
        isRevoked: cert.isRevoked,
        timestamp: cert.timestamp.toString(),
      });
    }

    return res.status(200).json({
      success: true,
      owner: walletAddress,
      total: certificates.length.toString(),
      certificates,
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch certificates",
      details: error.message,
    });
  }
});

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

    // Create institution in MongoDB
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

    // Check secure admin password and register on blockchain
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
const PERMITTED_ORIGINS = ["http://localhost:5173"];
// Update wallet address
router.post("/wallet", async (req, res) => {
  const { walletAddress } = req.body;
  const authHeader = req.header("Authorization");
  console.log("Auth Header for /wallet:", authHeader);

  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, CLERK_PEM_PUBLIC_KEY, {
      algorithms: ["RS256"],
    });
    console.log("Decoded Token for /wallet:", decoded);

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      throw new Error("Token has expired");
    }
    if (decoded.nbf > currentTime) {
      throw new Error("Token is not yet valid");
    }
    if (decoded.azp && !PERMITTED_ORIGINS.includes(decoded.azp)) {
      throw new Error("Invalid 'azp' claim: Unauthorized origin");
    }

    const clerkId = decoded.sub;
    console.log("Clerk ID for /wallet:", clerkId);

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ message: "Invalid wallet address" });
    }

    console.log("Received wallet update request for Clerk ID:", clerkId);
    console.log("Wallet address to update:", walletAddress);

    const user = await User.findOneAndUpdate(
      { clerkId },
      { walletAddress: walletAddress.toLowerCase() },
      { new: true, upsert: true }
    );

    console.log("Updated user in DB:", user);

    if (!user) {
      return res
        .status(500)
        .json({ message: "Failed to update or create user" });
    }

    res.status(200).json({
      success: true,
      message: "Wallet updated successfully",
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    console.error("Error updating wallet:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update wallet",
      details: error.message,
    });
  }
});
router.get("/dashboard/user", authUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found or no wallet linked" });
    }

    const walletAddress = user.walletAddress.toLowerCase();
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractData.abi,
      provider
    );
    const certificateHashes = await contract.getCertificatesByOwner(
      walletAddress
    );
    const certificates = [];

    for (const hash of certificateHashes) {
      const cert = await contract.certificates(hash);
      certificates.push({
        certificateHash: hash,
        recipient: cert.recipient,
        metadataURI: cert.metadataURI,
        isRevoked: cert.isRevoked,
        timestamp: cert.timestamp.toString(),
      });
    }

    return res.status(200).json({
      success: true,
      owner: walletAddress,
      total: certificates.length.toString(),
      certificates,
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch certificates",
      details: error.message,
    });
  }
});

router.get("/dashboard/institution", authAdmin, async (req, res) => {
  try {
    const clerkId = req.user.id;
    console.log("Clerk ID from token:", clerkId); // Log the ID from JWT

    const userId = req.user.id; // Clerk ID of the admin user
    const user = await User.findOne({ clerkId: userId });
    console.log("User found:", user); // Log the full user object
    if (!user || !user.walletAddress) {
      return res.status(404).json({
        success: false,
        message: "User not found or no wallet linked",
      });
    }

    // Ensure user is an admin and tied to a verified institution
    const institution = await Institution.findOne({
      userId: userId,
      isVerified: true,
    });
    if (!institution) {
      return res
        .status(403)
        .json({ error: "No verified institution found for this user" });
    }

    // Fetch certificates issued by this institution's wallet address
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractData.abi,
      provider
    );
    const events = await contract.queryFilter(
      contract.filters.CertificateIssued(
        null,
        institution.walletAddress.toLowerCase()
      )
    );
    const certificates = await Promise.all(
      events.map(async (event) => {
        const { certificateHash, recipient } = event.args;
        const cert = await contract.certificates(certificateHash);
        return {
          certificateHash: certificateHash.toString(),
          recipient: recipient.toLowerCase(),
          metadataURI: cert.metadataURI,
          isRevoked: cert.isRevoked,
          timestamp: cert.timestamp.toString(),
        };
      })
    );

    return res.status(200).json({
      success: true,
      walletAddress: institution.walletAddress.toLowerCase(),
      institutionName: institution.name || "Unnamed Institution",
      officialEmail: institution.officialEmail,
      totalCertificatesIssued: certificates.length,
      certificates,
      role: user.role, // Confirm admin role
    });
  } catch (error) {
    console.error("Institution Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch institution dashboard data",
      details: error.message,
    });
  }
});

module.exports = router;
