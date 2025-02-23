// models/Credential.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const credentialSchema = new Schema({
  studentId: {
    type: String, // Ethereum address
    required: true,
  },
  issuer: {
    type: Schema.Types.ObjectId,
    ref: "Institution", // Links to Institution model
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  credentialData: {
    type: Object, // e.g., { course: "Math", grade: "A", metadataURI: "ipfs://..." }
    required: true,
  },
  transactionHash: {
    type: String, // Blockchain tx hash
    required: true,
    unique: true
  },
});

module.exports = mongoose.model("Credential", credentialSchema);
