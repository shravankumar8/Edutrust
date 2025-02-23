import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-gray-800 shadow-lg">
        <div className="text-2xl font-bold text-cyan-400">EduTrust</div>
        <nav className="space-x-6">
          <a
            href="#features"
            className="text-gray-300 hover:text-cyan-400 transition"
          >
            Features
          </a>
          <a
            href="#about"
            className="text-gray-300 hover:text-cyan-400 transition"
          >
            About
          </a>
          <button
            onClick={connectWallet}
            className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-full transition"
          >
            {walletAddress
              ? `Connected: ${walletAddress.slice(0, 6)}...`
              : "Connect Wallet"}
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-screen text-center px-6 bg-gradient-to-b from-gray-800 to-gray-900">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
          Secure Credentials,{" "}
          <span className="text-cyan-400">Trusted Forever</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-8">
          EduTrust leverages blockchain technology to issue, verify, and manage
          educational credentials with unmatched security and transparency.
        </p>
        <a
          href="/dashboard" // Replace with your app route
          className="bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-8 rounded-full text-lg font-semibold transition"
        >
          Get Started
        </a>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-gray-800">
        <h2 className="text-4xl font-bold text-center text-white mb-12">
          Why EduTrust?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">
              Blockchain Security
            </h3>
            <p className="text-gray-300">
              Credentials are stored on the blockchain, ensuring they’re
              tamper-proof and verifiable forever.
            </p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">
              Instant Verification
            </h3>
            <p className="text-gray-300">
              Employers and institutions can verify credentials in seconds with
              a single hash.
            </p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">
              User Ownership
            </h3>
            <p className="text-gray-300">
              You control your credentials with your wallet—no intermediaries
              needed.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-900 text-center text-gray-400">
        <p>&copy; 2025 EduTrust. Built with ❤️ on the blockchain.</p>
        <div className="mt-2 space-x-4">
          <a href="#privacy" className="hover:text-cyan-400 transition">
            Privacy
          </a>
          <a href="#terms" className="hover:text-cyan-400 transition">
            Terms
          </a>
          <a href="#contact" className="hover:text-cyan-400 transition">
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
