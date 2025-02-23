const { ethers } = require("ethers");
const credentialNFTData = require("../CredentialNFT.json"); // Load the full JSON
const credentialNFTABI = credentialNFTData.abi; // Extract the ABI array
const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  credentialNFTABI,
  provider
);
module.exports = contract;
