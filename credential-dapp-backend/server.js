require("dotenv").config();
const express = require("express");
const ethers = require("ethers");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const institutionRoutes = require("./routes/institution");
const credentialRoutes = require("./routes/credential");
const contractData = require("./CredentialNFT.json");
const fileUpload = require("express-fileupload");
const userRoutes= require("./routes/userRoutes");
const { authUser } = require("./middleware/auth");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(fileUpload());
app.use(express.json());

// Load and validate ABI
const abi = contractData.abi;
if (!Array.isArray(abi)) {
  throw new Error("ABI is not an array");
}

// Set up provider for local Hardhat node
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress) {
  throw new Error("CONTRACT_ADDRESS not set in .env");
}
const contract = new ethers.Contract(contractAddress, abi, provider);

// Test blockchain connection
provider
  .getBlockNumber()
  .then((blockNumber) =>
    console.log("Connected to Hardhat node. Block number:", blockNumber)
  )
  .catch((err) => console.error("Failed to connect to Hardhat node:", err));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/credentials", credentialRoutes);
app.use("/api/user", authUser, userRoutes); 

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export contract for routes
module.exports = { app, contract };
