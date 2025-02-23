require("dotenv").config();
const { ethers } = require("ethers");
const contractData = require("./CredentialNFT.json");

const provider = new ethers.JsonRpcProvider(
  process.env.PROVIDER_URL || "http://127.0.0.1:8545"
);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractData.abi,
  provider
);

module.exports = { provider, contract };
