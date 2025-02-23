import { Link } from "react-router-dom";
import { ethers } from "ethers";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

function Header({ walletAddress, setWalletAddress }) {
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
      console.log("Connected wallet address from Header:", address);
      setWalletAddress(address); // Triggers useEffect in App.jsx
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  return (
    <header className="flex justify-between items-center p-6 bg-gray-800 shadow-lg">
      <Link to="/" className="text-2xl font-bold text-cyan-400">
        EduTrust
      </Link>
      <nav className="space-x-6 flex items-center">
        <Link to="/" className="text-gray-300 hover:text-cyan-400 transition">
          Home
        </Link>
        <Link
          to="/dashboard/user"
          className="text-gray-300 hover:text-cyan-400 transition"
        >
          User Dashboard
        </Link>
        <Link
          to="/dashboard/institution"
          className="text-gray-300 hover:text-cyan-400 transition"
        >
          Institution Dashboard
        </Link>
        {walletAddress ? (
          <>
            <span className="text-gray-300">
              Wallet:{" "}
              {typeof walletAddress === "string"
                ? walletAddress.slice(0, 6) + "..."
                : "Connected"}
            </span>
            <button
              onClick={disconnectWallet}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full transition"
            >
              Disconnect Wallet
            </button>
          </>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-full transition"
          >
            Connect Wallet
          </button>
        )}
        <SignedOut>
          <SignInButton
            mode="modal"
            className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-full transition"
          >
            Sign In
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
}

export default Header;
