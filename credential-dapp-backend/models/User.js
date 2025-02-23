const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true }, // Clerk user ID (sub)
    walletAddress: { type: String, unique: true, trim: true }, // MetaMask address
    role: {
      type: String,
      enum: ["user", "institution", "admin"],
      default: "user",
    },
    institutionApplicationStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none", // Tracks application to become an institution
    },
  },
  { timestamps: true }
);

userSchema.index({ clerkId: 1, walletAddress: 1 });

module.exports = mongoose.model("User", userSchema);
