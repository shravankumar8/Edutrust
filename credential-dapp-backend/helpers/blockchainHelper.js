require("dotenv").config();
const { ethers } = require("ethers");
const contractData = require("../CredentialNFT.json");

const provider = new ethers.JsonRpcProvider(
  process.env.PROVIDER_URL || "http://127.0.0.1:8545"
);
const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractData.abi,
  wallet
);

async function registerInstitutionOnBlockchain(institutionAddress) {
  if (!ethers.isAddress(institutionAddress)) {
    throw new Error("Invalid institution address");
  }

  console.log("Contract address:", process.env.ADMIN_PRIVATE_ADDRESS);
  console.log("Admin wallet address:", wallet.address);

  try {
    const tx = await contract.registerInstitution(institutionAddress);
    const receipt = await tx.wait();
    console.log("Transaction Receipt:", receipt);
    return receipt.hash; // Return transaction hash
  } catch (err) {
    console.error("Blockchain Registration Error:", err);
    throw err;
  }
}

module.exports = { registerInstitutionOnBlockchain };
