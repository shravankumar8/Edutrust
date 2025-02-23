require("dotenv").config();
const { ethers } = require("ethers");
const contractData = require("./CredentialNFT.json");

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
    // Issue the credential
    const tx = await contract.issueCredential(
      studentId,
      credentialData.metadataURI || "ipfs://placeholder"
    );
    const receipt = await tx.wait();
    
    // Get the certificate hash from the event logs
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
      throw new Error("Credential issued event not found");
    }

    const certificateHash = credentialIssuedEvent.args.certificateHash;
    console.log("Certificate Hash:", certificateHash);
    return certificateHash;

  } catch (err) {
    console.error("Blockchain error:", err);
    throw err;
  }
}

async function verifyCertificate(certificateHash) {
  try {
    const isValid = await contract.isCertificateValid(certificateHash);
    console.log("Certificate Validity:", isValid);
    return isValid;
  } catch (error) {
    console.error("Verification error:", error);
    throw error;
  }
}

// Run the function with an example credential
async function run() {
  // Example credential data
  const credential = {
    studentId: "0x1234567890abcdef1234567890abcdef12345678", // Replace with actual address
    credentialData: {
      metadataURI: "ipfs://yourMetadataURI", // Replace with actual metadata URI
    },
  };

  try {
    // Issue the credential and get the certificate hash
    const certificateHash = await publishToBlockchain(credential);
    console.log("Certificate issued with hash:", certificateHash);

    // Verify the certificate
    const isValid = await verifyCertificate(certificateHash);
    console.log("Certificate is valid:", isValid);

    // You can also get all certificates for the student
    const studentCertificates = await contract.getCertificatesByOwner(credential.studentId);
    console.log("Student certificates:", studentCertificates);

  } catch (error) {
    console.error("Error:", error);
  }
}

run(); // Call the run function to execute the logic
