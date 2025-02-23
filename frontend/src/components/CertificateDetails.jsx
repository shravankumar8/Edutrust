import { useState, useEffect } from "react";
import axios from "axios";
import CertificateCard from "./CertificateCard";

function CertificateDetails() {
  const [certificate, setCertificate] = useState(null);
  const hash = window.location.pathname.split("/").pop(); // Extract hash from URL

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await axios.get(`/api/certificate/${hash}`);
        if (response.data.success) setCertificate(response.data.certificate);
      } catch (error) {
        console.error("Error fetching certificate:", error);
      }
    };
    fetchCertificate();
  }, [hash]);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-white mb-6">
        Certificate Details
      </h1>
      {certificate ? (
        <CertificateCard certificate={certificate} />
      ) : (
        <p className="text-gray-300">Loading certificate...</p>
      )}
    </div>
  );
}

export default CertificateDetails;
