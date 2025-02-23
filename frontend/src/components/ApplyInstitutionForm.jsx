import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function ApplyInstitutionForm({ walletAddress }) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    officialEmail: "",
    registrationNumber: "",
    walletAddress: walletAddress || "",
    name: "",
    address: "",
    contact: "",
    website: "",
    documents: [],
  });
  const [message, setMessage] = useState(null); // Unified message state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null); // Clear message when user types
  };

  const handleNext = () => setStep(step + 1);
  const handlePrevious = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      setMessage("Wallet address is required to submit the application.");
      return;
    }
    try {
      const token = await getToken();
      const response = await axios.post(
        "http://localhost:3000/api/institutions/register", // Corrected endpoint
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(response.data.message); // Display backend message (success or failure)
      if (response.data.success) {
        setTimeout(() => navigate("/dashboard/user"), 2000); // Navigate on success
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to submit application"
      ); // Display error message from backend
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    focus: { scale: 1.02, transition: { duration: 0.2 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="p-6 flex justify-center items-center min-h-screen bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Apply to Become an Institution (Step {step}/2)
        </h1>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                <label className="block text-gray-300 mb-2">
                  Official Email *
                </label>
                <input
                  type="email"
                  name="officialEmail"
                  value={formData.officialEmail}
                  onChange={handleChange}
                  required
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </motion.div>
              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                <label className="block text-gray-300 mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  required
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </motion.div>
              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                <label className="block text-gray-300 mb-2">
                  Wallet Address *
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  required
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={!!walletAddress}
                />
              </motion.div>
              <motion.button
                onClick={handleNext}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-full transition mt-4"
              >
                Next
              </motion.button>
            </>
          )}
          {step === 2 && (
            <>
              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                <label className="block text-gray-300 mb-2">
                  Institution Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </motion.div>
              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                <label className="block text-gray-300 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </motion.div>
              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                <label className="block text-gray-300 mb-2">Contact</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </motion.div>
              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                <label className="block text-gray-300 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </motion.div>
              <div className="flex space-x-4">
                <motion.button
                  onClick={handlePrevious}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-full transition"
                >
                  Previous
                </motion.button>
                <motion.button
                  type="submit"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-full transition"
                >
                  Submit Application
                </motion.button>
              </div>
            </>
          )}
        </form>
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white mt-2" // Neutral color, adjust based on context
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export default ApplyInstitutionForm;
