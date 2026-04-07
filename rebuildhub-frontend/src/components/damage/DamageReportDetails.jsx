import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReportById, verifyReport } from "../../services/damageService";
import Loader from "../common/Loader";

const DamageReportDetails = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await getReportById(id);
      setReport(res.data.data || res.data);
    } catch (err) {
      setError("Failed to load report details");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status) => {
    try {
      await verifyReport(id, status);
      alert(`Report marked as ${status}`);
      fetchReport();
    } catch (err) {
      alert("Verification failed");
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="error">{error}</p>;
  if (!report) return <p>Report not found</p>;

  return (
    <div className="container">
      <h2>Damage Report Details</h2>
      <div className="card">
        <p><strong>Disaster ID:</strong> {report.disasterId?._id || report.disasterId}</p>
        <p><strong>Reporter Name:</strong> {report.reporterName}</p>
        <p><strong>Contact Number:</strong> {report.contactNumber}</p>
        <p><strong>Damage Type:</strong> {report.damageType}</p>
        <p><strong>Description:</strong> {report.damageDescription}</p>
        <p><strong>Estimated Loss:</strong> ${report.estimatedLoss?.toLocaleString()}</p>
        <p><strong>Verification Status:</strong> 
          <span style={{ 
            color: report.verificationStatus === "Verified" ? "#2ecc71" : 
                   report.verificationStatus === "Rejected" ? "#e74c3c" : "#f39c12",
            marginLeft: "0.5rem"
          }}>
            {report.verificationStatus}
          </span>
        </p>
        
        {report.location && (report.location.latitude || report.location.longitude) && (
          <div>
            <strong>Location:</strong><br />
            Lat: {report.location.latitude}, Lng: {report.location.longitude}<br />
            Address: {report.location.address || "N/A"}
          </div>
        )}

        {report.googleMap?.viewLocation && (
          <div style={{ marginTop: "1rem" }}>
            <a href={report.googleMap.viewLocation} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Open in Google Maps
            </a>
          </div>
        )}

        {report.images && report.images.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <strong>Evidence Images:</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
              {report.images.map((img, idx) => (
                <img key={idx} src={img} alt="evidence" style={{ width: "150px", borderRadius: "8px" }} />
              ))}
            </div>
          </div>
        )}

        {role === "authority" && report.verificationStatus === "Pending" && (
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
            <button onClick={() => handleVerify("Verified")} className="btn-primary">Verify Report</button>
            <button onClick={() => handleVerify("Rejected")} className="btn-danger">Reject Report</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DamageReportDetails;