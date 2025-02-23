import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react"; // Add useAuth
import LandingPage from "./components/LandingPage";
import UserDashboard from "./components/UserDashboard";
import InstitutionDashboard from "./components/InstitutionDashboard";
import ApplyInstitutionForm from "./components/ApplyInstitutionForm";
import Header from "./components/Header";
import { ethers } from "ethers";
import axios from "axios";
import "./App.css";
import VerificationPage from "./components/VerificationPage";

function App() {
  const { getToken } = useAuth(); // Add getToken for auth
  const [walletAddress, setWalletAddress] = useState(
    localStorage.getItem("walletAddress") || null
  );
  const [error, setError] = useState(null); // Track errors globally

  const updateWalletAddress = async (address) => {
    try {
      const token = await getToken();
      console.log(
        "Polling /api/wallet with token:",
        token.slice(0, 20) + "..."
      );
      console.log("Wallet address to save:", address);

      const response = await axios.post(
        "http://localhost:3000/api/user/wallet",
        { walletAddress: address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Wallet update response:", response.data);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update wallet");
      }
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Unknown error";
      console.error("Wallet update error:", err.response?.data || err);
      setError("Failed to sync wallet with server: " + errorMsg);
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            localStorage.setItem("walletAddress", accounts[0]);
          }
        } catch (err) {
          console.error("Failed to check wallet connection:", err);
        }
      } else {
        console.warn("MetaMask not detected");
      }
    };
    checkWalletConnection();
  }, []);

  // Poll /api/wallet whenever walletAddress changes
  useEffect(() => {
    if (walletAddress && typeof walletAddress === "string") {
      console.log(
        "Wallet address changed, polling /api/wallet:",
        walletAddress
      );
      // updateWalletAddress(walletAddress);
      localStorage.setItem("walletAddress", walletAddress);
    } else if (!walletAddress) {
      localStorage.removeItem("walletAddress");
    }
  }, [walletAddress, getToken]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <Header
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
        />
        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard/user"
            element={
              <>
                <SignedIn>
                  <UserDashboard
                    walletAddress={walletAddress}
                    setWalletAddress={setWalletAddress}
                  />
                </SignedIn>
                <SignedOut>
                  <div className="p-6 text-center text-gray-300">
                    Please sign in to access your dashboard.
                  </div>
                </SignedOut>
              </>
            }
          />
          <Route
            path="/dashboard/institution"
            element={
              <>
                <SignedIn>
                  <InstitutionDashboard
                    walletAddress={walletAddress}
                    setWalletAddress={setWalletAddress}
                  />
                </SignedIn>
                <SignedOut>
                  <div className="p-6 text-center text-gray-300">
                    Please sign in to access your institution dashboard.
                  </div>
                </SignedOut>
              </>
            }
          />
          <Route
            path="/apply-institution"
            element={
              <>
                <SignedIn>
                  <ApplyInstitutionForm walletAddress={walletAddress} />
                </SignedIn>
                <SignedOut>
                  <div className="p-6 text-center text-gray-300">
                    Please sign in to apply as an institution.
                  </div>
                </SignedOut>
              </>
            }
          />
          <Route path="/verify" element={<VerificationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
