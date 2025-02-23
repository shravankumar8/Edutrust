import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import CertificateList from "./Certificates.jsx";

function UserDashboard({ walletAddress, setWalletAddress }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("Please install MetaMask!");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress(); // Returns a string
      setWalletAddress(address);

    } catch (err) {
      setError("Failed to connect wallet: " + err.message);
    }
  };

 

  const handleApplyForInstitution = () => {
    if (!walletAddress) {
      setError("Please connect your wallet before applying.");
      return;
    }
    navigate("/apply-institution");
  };

  useEffect(() => {
    if (walletAddress) {
      const fetchCertificates = async () => {
        setLoading(true);
        try {
          const token = await getToken();
          const response = await axios.get("/api/dashboard/user", {
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
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">User Dashboard</h1>
      {user && (
        <p className="text-gray-300 mb-4">
          Welcome, {user.firstName || user.emailAddresses[0].emailAddress}!
        </p>
      )}
      {walletAddress ? (
        <div>
          <p className="text-gray-300 mb-4">
            Wallet:{" "}
            {typeof walletAddress === "string" ? walletAddress : "Connected"}
          </p>
          {loading ? (
            <p className="text-gray-300">Loading certificates...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <CertificateList certificates={certificates} />
          )}
          <button
            onClick={handleApplyForInstitution}
            className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-full transition"
          >
            Apply to Become an Institution
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-300 mb-4">
            Connect your MetaMask wallet to view your credentials and apply as
            an institution.
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

export default UserDashboard;
