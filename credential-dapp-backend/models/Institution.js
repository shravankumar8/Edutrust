const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Changed from ObjectId to String to match clerkId
      ref: "User", // Still references the User model
      required: true,
    },
    name: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    contact: { type: String, trim: true, default: "" },
    officialEmail: { type: String, required: true, unique: true, trim: true },
    website: { type: String, trim: true, default: "" },
    registrationNumber: { type: String, required: true, unique: true },
    walletAddress: { type: String, required: true, unique: true, trim: true },
    documents: { type: [String], default: [] },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institution", institutionSchema);
