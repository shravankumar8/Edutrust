// ✅ Ensure this path is correct
const { sendInstitutionApprovalEmail } = require("../helpers/emailHelper");
const {
  registerInstitutionOnBlockchain,
} = require("../helpers/blockchainHelper");
const Institution = require("../models/Institution.js");
const User = require("../models/User");

require("dotenv").config();


const Credential = require("../models/Credentials.js"); // Add this import
exports.applyInstitution = async (req, res) => {
  try {
    const {
      name = "",
      address = "",
      contact = "",
      officialEmail,
      website = "",
      registrationNumber,
      walletAddress,
      documents = [],
    } = req.body;

    // Ensure only a user (not an existing institution or admin) can apply
    if (req.user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Only users can apply for institution status" });
    }

    // Check if institution application already exists
    if (await Institution.findOne({ userId: req.user.id })) {
      return res
        .status(400)
        .json({ message: "Institution application already submitted" });
    }

    // Validate required fields
    if (!officialEmail || !registrationNumber || !walletAddress) {
      return res.status(400).json({
        message:
          "Missing required fields: officialEmail, registrationNumber, walletAddress",
      });
    }

    // Create institution application
    const institution = await Institution.create({
      userId: req.user.id,
      name,
      address,
      contact,
      officialEmail,
      website,
      registrationNumber,
      walletAddress,
      documents,
      isVerified: false, // Requires admin approval
    });

    res.status(201).json({
      message: "Institution application submitted. Awaiting admin approval.",
      institutionId: institution._id,
    });
  } catch (error) {
    console.error("Institution Application Error:", error);
    res.status(500).json({ message: "Server error, please try again" });
  }
};

exports.getInstitutionById = async (req, res) => {
  try {
    const { id } = req.params;

    const institution = await Institution.findById(id).select("-userId -__v");

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    res.status(200).json({ institution });
  } catch (error) {
    console.error("Error fetching institution details:", error);
    res.status(500).json({ message: "Server error, please try again" });
  }
};
exports.getAllInstitutions = async (req, res) => {
  try {
    // Fetch only verified institutions
    const institutions = await Institution.find({ isVerified: true }).select(
      "-userId -__v"
    ); // Exclude sensitive fields

    res.status(200).json({ institutions });
  } catch (error) {
    console.error("Error fetching institutions:", error);
    res.status(500).json({ message: "Server error, please try again" });
  }
};

exports.approveInstitution = async (req, res) => {
  try {
    const { id } = req.headers; // Institution application ID from headers

    // Find the institution by MongoDB _id
    const application = await Institution.findById(id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Update institution status to verified
    application.isVerified = true;
    await application.save();

    // Update user role to "admin"
    const user = await User.findOneAndUpdate(
      { clerkId: application.userId },
      { role: "admin", institutionApplicationStatus: "approved" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Associated user not found" });
    }

    // Register institution on blockchain
    const txHash = await registerInstitutionOnBlockchain(
      application.walletAddress
    );

    await sendInstitutionApprovalEmail(
      application.officialEmail,
      application.name,
      application.walletAddress
    );

    res.json({
      success: true,
      message:
        "Institution approved, user role updated to admin, and registered on blockchain",
      institutionId: application._id,
      txHash,
    });
  } catch (error) {
    console.error("Institution Approval Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve institution",
      details: error.message,
    });
  }
};
const contractData = require("../CredentialNFT.json");
const { ethers } = require("ethers");
const provider = new ethers.JsonRpcProvider(
  process.env.PROVIDER_URL || "http://127.0.0.1:8545"
);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractData.abi,
  provider
);
exports.dashboard = async (req, res) => {
  try {
    const clerkId = req.user.id;
    console.log("Clerk ID from token:", clerkId);
    const user = await User.findOne({ clerkId });
    console.log("User found:", user);

    if (!user || !user.walletAddress) {
      return res.status(404).json({
        success: false,
        message: "User not found or no wallet linked",
      });
    }

    const institution = await Institution.findOne({
      userId: clerkId,
      isVerified: true,
    });
    if (!institution) {
      return res.status(403).json({
        success: false,
        message: "No verified institution found for this user",
      });
    }

    // Ad-hoc: Fetch credentials from MongoDB
    const credentials = await Credential.find({
      issuer: institution._id,
    }).lean();
    console.log("Fetched credentials from MongoDB:", credentials);

    // Map credentials to match expected frontend format
    const certificates = credentials.map((cred) => ({
      certificateHash: cred.transactionHash, // Use tx hash as hash
      recipient: cred.studentId.toLowerCase(),
      metadataURI: cred.credentialData.metadataURI || "", // Extract from credentialData
      isRevoked: false, // MongoDB doesn't track revocation, assume false for now
      timestamp: Math.floor(cred.issuedAt.getTime() / 1000).toString(), // Convert to seconds
    }));

    console.log("Processed certificates:", certificates);

    return res.status(200).json({
      success: true,
      walletAddress: institution.walletAddress.toLowerCase(),
      institutionName: institution.name || "Unnamed Institution",
      officialEmail: institution.officialEmail,
      totalCertificatesIssued: certificates.length,
      certificates,
      role: user.role,
    });
  } catch (error) {
    console.error("Institution Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch institution dashboard data",
      details: error.message,
    });
  }
};