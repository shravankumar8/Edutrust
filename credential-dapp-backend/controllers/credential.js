const express = require("express");

const jwt = require("jsonwebtoken");

const Institution = require("../models/Institution");
const Credential = require("../models/Credentials");
const User = require("../models/User");
const contractData = require("../CredentialNFT.json");
const path = require("path");
require("dotenv").config();
const { ethers } = require("ethers");

const router = express.Router();
const pinataSDK = require("@pinata/sdk"); // Add Pinata SDK
const fs = require("fs");
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

const PERMITTED_ORIGINS = ["http://localhost:5173"];

// Initialize blockchain connection
const provider = new ethers.JsonRpcProvider(
  process.env.PROVIDER_URL || "http://127.0.0.1:8545"
);
const wallet = new ethers.Wallet(
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  provider
);
const contract = new ethers.Contract(
  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  contractData.abi,
  wallet
);

// Define route handler
router.post("/issue", async (req, res) => {
  const { recipientAddress, studentName, course, grade } = req.body;
  const file = req.files?.file;
  const authHeader = req.header("Authorization");
  console.log("Auth Header for /certificates/issue:", authHeader);

  try {
    // Token verification
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    const CLERK_PEM_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7yZbF/Qq0btlNEMh421f
Hg0VQJISUSOG5aZ6g6N6DQFEYv+WzkCXDH6WCt15ornYjTDw1PwOkJEGa5yfwqC7
+os9dAv9wEcF8T5H21l5j3UjnLnmR4AeBa2ahNzomlz9JLUPNgmnSZ2U10gl/wpk
DUDR3UsNmVMxOQdeJSVKiZ7aYNbc1epQ13W6vV7Kvb8iPBU3qmg4MBglpelrW/M2
+U8xgS1xmMPYyoZZokSwUmw/LLVuKb0rgdPL6kYJUEkrj5SlJZtfcAPy/pvgJ4g/
7nXugYl2NCe1f+c0R4Cl7iOan4LFGLr6hCrQQtoOjMw4oTCQdpDizRVzPC5HLpGB
QwIDAQAB
-----END PUBLIC KEY-----`;
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, CLERK_PEM_PUBLIC_KEY, {
      algorithms: ["RS256"],
    });
    console.log("Decoded Token:", decoded);

    // const currentTime = Math.floor(Date.now() / 1000);
    // if (decoded.exp < currentTime) throw new Error("Token has expired");
    // if (decoded.nbf > currentTime) throw new Error("Token is not yet valid");
    // if (decoded.azp && !PERMITTED_ORIGINS.includes(decoded.azp)) {
    //   throw new Error("Invalid 'azp' claim: Unauthorized origin");
    // }

    console.log("User validated ----------------------------------------");

    const clerkId = decoded.sub;
    const user = await User.findOne({ clerkId });
    if (!user || !user.walletAddress) {
      return res.status(404).json({
        success: false,
        message: "User not found or no wallet linked",
      });
    }

    let metadataURI = "";
    // Verify institution admin
    const institution = await Institution.findOne({
      userId: clerkId,
      isVerified: true,
    });
    if (!institution || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only verified institution admins can issue credentials",
      });
    }

    // Validate inputs
    if (!ethers.isAddress(recipientAddress)) {
      return res.status(400).json({ message: "Invalid recipient address" });
    }
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    

    const certificateData = {
      studentName,
      course,
      grade,
      issuer: institution.name || "Unnamed Institution",
      issuedAt: new Date().toISOString(),
    };
    if (file) {
      const filePath = path.join(__dirname, "uploads", file.name);
      await file.mv(filePath); // Save file temporarily
      const pinataResponse = await pinata.pinFileToIPFS(
        fs.createReadStream(filePath),
        {
          pinataMetadata: { name: `${studentName}_${course}_certificate.pdf` },
        }
      );
      metadataURI = `ipfs://${pinataResponse.IpfsHash}`;
      fs.unlinkSync(filePath); // Clean up
    } else {
      const pinataResponse = await pinata.pinJSONToIPFS(certificateData, {
        pinataMetadata: { name: `${studentName}_${course}_certificate.json` },
      });
      metadataURI = `ipfs://${pinataResponse.IpfsHash}`;
    }

    console.log("Issuing credential on-chain for recipient:", recipientAddress);

    // Issue credential
    const tx = await contract.issueCredential(recipientAddress, metadataURI, {
      gasLimit: 300000,
    });
    const receipt = await tx.wait();

    const certificateHash = ethers.keccak256(
      ethers.toUtf8Bytes(
        `${recipientAddress}${metadataURI}${receipt.blockNumber}`
      )
    );

    // Save to database
    const credential = new Credential({
      studentId: recipientAddress.toLowerCase(),
      issuer: institution._id,
      issuedAt: new Date(),
      credentialData: { ...certificateData, metadataURI },
      transactionHash: receipt.hash,
    });
    await credential.save();
    console.log("Saved credential to MongoDB:", credential);
    const certificateUrl = file
      ? `https://gateway.pinata.cloud/ipfs/${metadataURI.replace(
          "ipfs://",
          ""
        )}`
      : null;
    return res.status(200).json({
      success: true,
      message: "Certificate issued successfully",
      txHash: receipt.hash,
      recipientAddress,
      metadataURI,
      certificateHash,
    });
  } catch (error) {
    console.error("Error issuing credential:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to issue credential",
      details: error.message,
    });
  }
});

module.exports = router;
