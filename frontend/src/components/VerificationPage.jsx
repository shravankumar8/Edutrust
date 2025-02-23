import { useState } from "react";
import { ethers } from "ethers";
import PinataSDK from "@pinata/sdk";

// Initialize Pinata client from environment variables
const pinata = new PinataSDK({
  pinataApiKey: process.env.REACT_APP_PINATA_API_KEY,
  pinataSecretApiKey: process.env.REACT_APP_PINATA_SECRET_API_KEY,
});

// Example ABI for the EduTrust certificate contract (adjust as per your contract)
const contractABI = [
  "function getCertificateByTxHash(string memory txHash) public view returns (address recipient, string memory metadataURI, bool isValid, bool isRevoked, uint256 timestamp, address issuer)",
];

function VerificationPage() {
  const [transactionHash, setTransactionHash] = useState("");
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setTransactionHash(e.target.value);
    setCertificateData(null);
    setError(null);
  };

  const fetchCertificateFromBlockchain = async (txHash) => {
    try {
      setIsLoading(true);
      setError(null);

      // Connect to Polygon Amoy network
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.REACT_APP_AMOY_RPC_URL
      );
      const contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        contractABI,
        provider
      );

      // Fetch certificate data from the smart contract
      const [recipient, metadataURI, isValid, isRevoked, timestamp, issuer] =
        await contract.getCertificateByTxHash(txHash);

      // Fetch metadata from IPFS using Pinata
      const ipfsHash = metadataURI.replace("ipfs://", "");
      const metadataResponse = await pinata.pinJSONToIPFS({
        pinataContent: { txHash }, // Temporary fetch, replace with actual IPFS fetch logic if hosted
      });
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      const metadataFetch = await fetch(metadataUrl);
      const metadata = await metadataFetch.json();

      // Construct certificate data
      const certificate = {
        txHash,
        recipientAddress: recipient,
        metadataURI,
        isValid,
        isRevoked,
        timestamp: timestamp.toString(),
        issuerAddress: issuer,
        metadata: {
          studentName: metadata.studentName || "Unknown",
          course: metadata.course || "Unknown",
          grade: metadata.grade || "N/A",
          issuer: metadata.issuer || "EduTrust Academy",
        },
        pdfUrl: metadata.pdfUrl || null, // Assuming metadata includes a PDF URL
      };

      setCertificateData(certificate);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to fetch certificate data. Invalid transaction hash or network issue."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!transactionHash) {
      setError("Please enter a transaction hash");
      return;
    }
    fetchCertificateFromBlockchain(transactionHash);
  };

  const handleShare = () => {
    if (certificateData) {
      const shareText = `EduTrust Verified Certificate\nTransaction Hash: ${certificateData.txHash}\nStudent: ${certificateData.metadata.studentName}\nCourse: ${certificateData.metadata.course}`;
      navigator.clipboard.writeText(shareText);
      alert("Certificate details copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex items-center justify-center p-6">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-3xl">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-400">
          EduTrust Certificate Verification
        </h1>
        <p className="text-gray-300 mb-6 text-center">
          Verify the authenticity of EduTrust certificates by entering a
          transaction hash from the Polygon Amoy blockchain.
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <input
              type="text"
              value={transactionHash}
              onChange={handleInputChange}
              placeholder="Enter transaction hash (e.g., 0x...)"
              className="w-full p-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-full font-semibold transition ${
              isLoading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isLoading ? "Fetching Data..." : "Verify Certificate"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-900 rounded-lg text-red-200">
            <p>{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg text-center">
            <p className="text-blue-400 animate-pulse">
              Fetching certificate from blockchain...
            </p>
          </div>
        )}

        {certificateData && !isLoading && (
          <div className="mt-8 p-6 bg-gray-700 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-green-400">
              Certificate Status:{" "}
              {certificateData.isValid ? "Valid" : "Invalid"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Transaction Hash:</strong>{" "}
                  {certificateData.txHash.slice(0, 10)}...
                  {certificateData.txHash.slice(-10)}
                </p>
                <p>
                  <strong>Recipient Address:</strong>{" "}
                  {certificateData.recipientAddress.slice(0, 6)}...
                  {certificateData.recipientAddress.slice(-4)}
                </p>
                <p>
                  <strong>Issuer Address:</strong>{" "}
                  {certificateData.issuerAddress.slice(0, 6)}...
                  {certificateData.issuerAddress.slice(-4)}
                </p>
                <p>
                  <strong>Metadata URI:</strong>{" "}
                  <a
                    href={certificateData.metadataURI}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    View on IPFS
                  </a>
                </p>
                <p>
                  <strong>Issued On:</strong>{" "}
                  {new Date(
                    parseInt(certificateData.timestamp) * 1000
                  ).toLocaleString()}
                </p>
                <p>
                  <strong>Revoked:</strong>{" "}
                  {certificateData.isRevoked ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Certificate Details
                </h3>
                <p>
                  <strong>Student:</strong>{" "}
                  {certificateData.metadata.studentName}
                </p>
                <p>
                  <strong>Course:</strong> {certificateData.metadata.course}
                </p>
                <p>
                  <strong>Grade:</strong> {certificateData.metadata.grade}
                </p>
                <p>
                  <strong>Issuer:</strong> {certificateData.metadata.issuer}
                </p>
              </div>
            </div>

            {certificateData.pdfUrl && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">
                  Certificate Document
                </h3>
                <iframe
                  src={certificateData.pdfUrl}
                  width="100%"
                  height="500px"
                  className="rounded-lg border-2 border-gray-600"
                  title="Certificate Preview"
                />
                <div className="mt-4 flex space-x-4">
                  <a
                    href={certificateData.pdfUrl}
                    download={`${certificateData.metadata.studentName}_certificate.pdf`}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-full transition"
                  >
                    Download PDF
                  </a>
                  <button
                    onClick={handleShare}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full transition"
                  >
                    Share
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VerificationPage;
