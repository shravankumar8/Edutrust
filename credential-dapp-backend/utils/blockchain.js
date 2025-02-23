require("dotenv").config();
const { ethers } = require("ethers");
const contractData = require("../CredentialNFT.json");

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractData.abi,
  wallet
);

async function publishToBlockchain(credential) {
  const { studentId, credentialData } = credential;
  if (!ethers.isAddress(studentId)) {
    throw new Error("Invalid student address");
  }

  // Debug: Log contract and wallet addresses
  console.log("Contract address:", process.env.CONTRACT_ADDRESS);
  console.log("Wallet address:", wallet.address);

  try {
    const tx = await contract.issueCredential(
      studentId,
      credentialData.metadataURI || "ipfs://placeholder"
    );
    const receipt = await tx.wait();
    console.log("RECEIPT",receipt)
    return receipt.hash;
  } catch (err) {
    console.error("Blockchain error:", err);
    throw err;
  }
}

module.exports = { publishToBlockchain };
