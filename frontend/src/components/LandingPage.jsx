import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";

function LandingPage() {
  const { user } = useUser();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const hoverScale = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  return (
    <div className="bg-gray-900 text-white font-sans">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex flex-col items-center justify-center min-h-screen text-center px-6 bg-gradient-to-b from-gray-800 to-gray-900"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4">
          Secure Credentials,{" "}
          <span className="text-cyan-400">Trusted Forever</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mb-8">
          EduTrust harnesses blockchain to deliver unforgeable, transparent
          credentials that empower your educational journey.
        </p>
        <SignedOut>
          <SignInButton
            mode="modal"
            className="bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-8 rounded-full text-lg font-semibold transition"
          >
            Sign In with Google
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <p className="text-gray-300 mb-4">
            Welcome, {user?.firstName || user?.emailAddresses[0].emailAddress}!
          </p>
          <Link
            to="/dashboard"
            className="bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-8 rounded-full text-lg font-semibold transition"
          >
            Go to Dashboard
          </Link>
        </SignedIn>
      </motion.section>

      {/* About Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="py-16 px-6 bg-gray-800"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Transparent & Trustworthy Credentials
          </h2>
          <motion.p
            variants={hoverScale}
            whileHover="hover"
            className="text-lg text-gray-300 max-w-3xl mx-auto"
          >
            Forget flimsy paper certificates. EduTrust locks your achievements
            on the blockchain—immutable, verifiable, and yours forever.
          </motion.p>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="py-16 px-6 bg-gray-900"
      >
        <h2 className="text-4xl font-bold text-center text-white mb-12">
          Secure. Simple. Scalable.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <motion.div
            variants={hoverScale}
            whileHover="hover"
            className="bg-gray-700 p-6 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">Secure</h3>
            <p className="text-gray-300">
              Blockchain encryption ensures your credentials are tamper-proof
              and safe from fraud.
            </p>
          </motion.div>
          <motion.div
            variants={hoverScale}
            whileHover="hover"
            className="bg-gray-700 p-6 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">Simple</h3>
            <p className="text-gray-300">
              Manage and verify your credentials with a few clicks—no complex
              processes.
            </p>
          </motion.div>
          <motion.div
            variants={hoverScale}
            whileHover="hover"
            className="bg-gray-700 p-6 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">
              Scalable
            </h3>
            <p className="text-gray-300">
              Built for the future, EduTrust grows with you—from one certificate
              to a global network.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Call-to-Action Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="py-16 px-6 bg-gray-800 text-center"
      >
        <h2 className="text-4xl font-bold text-white mb-6">
          Be Part of the Education Revolution
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
          EduTrust isn’t just a platform—it’s a movement. Join educators,
          learners, and innovators shaping the future of trusted credentials.
        </p>
        <Link
          to="/dashboard"
          className="bg-cyan-500 hover:bg-cyan-600 text-white py-4 px-10 rounded-full text-xl font-semibold transition"
        >
          Join Now
        </Link>
      </motion.section>

      {/* Footer */}
      <footer className="py-6 bg-gray-900 text-center text-gray-400">
        <p>© 2025 EduTrust. Powered by Blockchain Innovation.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
