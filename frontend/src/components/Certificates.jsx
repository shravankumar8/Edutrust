import { Link } from "react-router-dom";

function CertificateList({ certificates }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-4">
        Your Certificates
      </h2>
      {certificates.length > 0 ? (
        <ul className="space-y-4">
          {certificates.map((cert) => (
            <li
              key={cert.certificateHash}
              className="bg-gray-700 p-4 rounded-lg"
            >
              <p className="text-gray-300">
                Hash: {cert.certificateHash.slice(0, 10)}...
              </p>
              <p className="text-gray-300">Metadata: {cert.metadataURI}</p>
              <p className="text-gray-300">
                Status: {cert.isRevoked ? "Revoked" : "Valid"}
              </p>
              <Link
                to={`/certificate/${cert.certificateHash}`}
                className="text-cyan-400 hover:underline"
              >
                View Details
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-300">No certificates found.</p>
      )}
    </div>
  );
}

export default CertificateList;
