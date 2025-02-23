import { useState, useEffect } from "react";
import axios from "axios";
import { useClerk, useUser } from "@clerk/clerk-react";
import { ethers } from "ethers";
import CertificateList from "./Certificates.jsx";

function Dashboard({ walletAddress, setWalletAddress }) {
  const { getToken } = useClerk();
  const { user } = useUser();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Connect MetaMask if not already connected
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("Please install MetaMask!");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

    } catch (err) {
      setError("Failed to connect wallet: " + err.message);
    }
  };



  // Fetch certificates when wallet is connected
  useEffect(() => {
    if (walletAddress) {
      const fetchCertificates = async () => {
        setLoading(true);
        try {
          const token = await getToken();
          const response = await axios.get("/api/certificates", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setCertificates(response.data.certificates);
            setError(null);
          } else {
            setError(response.data.error);
          }
        } catch (err) {
          setError("Failed to fetch certificates: " + err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCertificates();
    }
  }, [walletAddress, getToken]);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-white mb-6">Dashboard</h1>
      {user && (
        <p className="text-gray-300 mb-4">
          Welcome, {user.firstName || user.emailAddresses[0].emailAddress}!
        </p>
      )}
      {walletAddress ? (
        <>
          <p className="text-gray-300 mb-4">Wallet: {walletAddress}</p>
          {loading ? (
            <p className="text-gray-300">Loading certificates...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <CertificateList certificates={certificates} />
          )}
        </>
      ) : (
        <div>
          <p className="text-gray-300 mb-4">
            Connect your MetaMask wallet to view your credentials.
          </p>
          <button
            onClick={connectWallet}
            className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-full transition"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
