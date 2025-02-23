const express = require("express");
const { ethers } = require("ethers");

const contractData = require("../CredentialNFT.json");
require("dotenv").config();
const Credential = require("../models/Credentials");
const router = express.Router();

// Setup blockchain provider & contract
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractData.abi,
  provider
);

// ✅ Verification Route: /api/verify/:txHash
router.get("/:txHash", async (req, res) => {
  const { txHash } = req.params;

  try {
    // 1️⃣ Get transaction receipt and parse the event logs
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      return res.status(404).json({
        valid: false,
        message: "Transaction not found.",
      });
    }

    console.log("Transaction receipt found:", receipt.hash);

    // Parse the CredentialIssued event from the logs
    const credentialIssuedEvent = receipt.logs
      .map(log => {
        try {
          return contract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find(event => event && event.name === 'CredentialIssued');

    if (!credentialIssuedEvent) {
      return res.status(404).json({
        valid: false,
        message: "No credential issuance found in this transaction.",
      });
    }

    console.log("Credential event found:", credentialIssuedEvent.args);

    // Extract certificate hash and recipient from the event
    const certificateHash = credentialIssuedEvent.args.certificateHash;
    const recipient = credentialIssuedEvent.args.recipient;

    // 3️⃣ Verify the certificate on-chain
    const isValid = await contract.isCertificateValid(certificateHash);
    console.log("Certificate validity:", isValid);

    // 4️⃣ Get additional certificate details from the contract
    const certificateDetails = await contract.certificates(certificateHash);
    console.log("Certificate details:", certificateDetails);

    // 2️⃣ Check if certificate exists in MongoDB (optional)
    let mongoData = null;
    try {
      const credential = await Credential.findOne({
        transactionHash: txHash,
      }).populate("issuer");
      
      if (credential && credential.issuer) {
        mongoData = {
          credentialData: credential.credentialData,
          issuedAt: credential.issuedAt,
          issuerName: credential.issuer.name,
          issuerDetails: credential.issuer
        };
      }
    } catch (mongoErr) {
      console.warn("MongoDB lookup failed:", mongoErr.message);
    }

    // 5️⃣ Format response
    const response = {
      valid: isValid,
      certificateHash: certificateHash,
      studentId: recipient,
      issuer: mongoData?.issuerName || "Unknown Issuer",
      issuedAt: new Date(Number(certificateDetails.timestamp) * 1000).toISOString(),
      metadataURI: certificateDetails.metadataURI,
      isRevoked: certificateDetails.isRevoked,
      onChainData: {
        recipient: certificateDetails.recipient,
        timestamp: certificateDetails.timestamp.toString(),
      },
      mongoDbData: mongoData,
      message: isValid
        ? "Certificate is valid"
        : "Certificate has been revoked or is invalid.",
    };

    res.json(response);

  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ 
      valid: false,
      message: "Verification failed.",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Optional: Add a route to get all certificates for a student
router.get("/student/:address", async (req, res) => {
  try {
    const studentAddress = req.params.address;
    
    // Get certificate hashes from the contract
    const certificateHashes = await contract.getCertificatesByOwner(studentAddress);
    
    // Get details for each certificate
    const certificates = await Promise.all(
      certificateHashes.map(async (hash) => {
        const isValid = await contract.isCertificateValid(hash);
        const details = await contract.certificates(hash);
        
        return {
          certificateHash: hash,
          isValid: isValid,
          metadataURI: details.metadataURI,
          issuedAt: new Date(Number(details.timestamp) * 1000).toISOString(),
          isRevoked: details.isRevoked
        };
      })
    );

    res.json({
      studentAddress,
      certificateCount: certificates.length,
      certificates
    });

  } catch (err) {
    console.error("Error fetching student certificates:", err);
    res.status(500).json({ 
      message: "Failed to fetch certificates",
      error: err.message 
    });
  }
});

module.exports = router;
