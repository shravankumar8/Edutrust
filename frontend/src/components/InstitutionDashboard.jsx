import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ethers } from "ethers";

function InstitutionDashboard({ walletAddress, setWalletAddress }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    recipientAddress: "",
    studentName: "",
    course: "",
    grade: "",
    file: null,
  });
  const [certificateUrl, setCertificateUrl] = useState(null);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    setMessage(null);
    setCertificateUrl(null);

    try {
      const token = await getToken();
      const form = new FormData();
      form.append("recipientAddress", formData.recipientAddress);
      form.append("studentName", formData.studentName);
      form.append("course", formData.course);
      form.append("grade", formData.grade);
      if (formData.file) form.append("file", formData.file);

      const response = await axios.post(
        "http://localhost:3000/api/credentials/pubish/issue",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);
      if (response.data.certificateUrl) {
        setCertificateUrl(response.data.certificateUrl);
      }
      setFormData({
        recipientAddress: "",
        studentName: "",
        course: "",
        grade: "",
        file: null,
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to issue certificate");
    }
  };

  useEffect(() => {
    if (walletAddress) {
      const fetchInstitutionData = async () => {
        setLoading(true);
        try {
          const token = await getToken();
          const response = await axios.get(
            "http://localhost:3000/api/institutions/dashboard",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.data.success) {
            setData(response.data);
            setRole(response.data.role);
            setError(null);
          } else {
            setError(response.data.message || "Unknown error from server");
          }
        } catch (err) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to fetch institution data"
          );
        } finally {
          setLoading(false);
        }
      };
      fetchInstitutionData();
    }
  }, [walletAddress, getToken]);

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Institution Dashboard</h1>
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
            <p className="text-gray-300">Loading institution data...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : data ? (
            <>
              <p className="text-gray-300 mb-4">
                Institution: {data.institutionName}
              </p>
              <p className="text-gray-300 mb-4">
                Total Certificates Issued: {data.totalCertificatesIssued}
              </p>
              {role === "admin" ? (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-yellow-400 mb-2">
                    Disclaimer: Certificate issuance is only available to admin
                    role users.
                  </p>
                  <h2 className="text-2xl font-semibold mb-4">
                    Issue Certificate
                  </h2>
                  <form onSubmit={handleIssueCertificate}>
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        Recipient Address
                      </label>
                      <input
                        type="text"
                        name="recipientAddress"
                        value={formData.recipientAddress}
                        onChange={handleInputChange}
                        placeholder="0x..."
                        className="w-full p-2 bg-gray-600 text-white rounded"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        Student Name
                      </label>
                      <input
                        type="text"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full p-2 bg-gray-600 text-white rounded"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">Course</label>
                      <input
                        type="text"
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        placeholder="Mathematics"
                        className="w-full p-2 bg-gray-600 text-white rounded"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">Grade</label>
                      <input
                        type="text"
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        placeholder="A"
                        className="w-full p-2 bg-gray-600 text-white rounded"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        Upload Certificate File (PDF)
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full p-2 bg-gray-600 text-white rounded"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-full"
                    >
                      Issue Certificate
                    </button>
                  </form>
                  {message && <p className="text-white mt-2">{message}</p>}
                  {certificateUrl && (
                    <p className="text-white mt-2">
                      <a href={certificateUrl} download="certificate.pdf" className="text-cyan-400">
                        Download Certificate
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-yellow-400">
                  Disclaimer: Certificate issuance is only available to admin
                  role users.
                </p>
              )}
              {data.certificates && data.certificates.length > 0 ? (
                <ul className="space-y-2 mt-4">
                  {data.certificates.map((cert) => (
                    <li key={cert.certificateHash} className="text-gray-300">
                      {cert.recipient} - {cert.metadataURI}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-300 mt-4">
                  No certificates issued yet.
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-300">No institution data available.</p>
          )}
        </div>
      ) : (
        <div>
          <p className="text-gray-300 mb-4">
            Connect your MetaMask wallet to access your institution dashboard.
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

export default InstitutionDashboard;
