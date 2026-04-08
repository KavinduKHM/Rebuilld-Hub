import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReportById, verifyReport } from "../../services/damageService";
import Loader from "../common/Loader";

const DamageReportDetails = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = localStorage.getItem("role");

  const fetchReport = useCallback(async () => {
    try {
      const res = await getReportById(id);
      setReport(res.data.data || res.data);
    } catch (err) {
      setError("Failed to load report details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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
  if (error) return <p className="empty-state">{error}</p>;
  if (!report) return <p>Report not found</p>;

  return (
    <div className="page-shell">
      <div className="container detail-stack">
        <div className="page-header">
          <div>
            <span className="section-label">Damage Detail</span>
            <h1 className="page-title">Damage Report Details</h1>
          </div>
        </div>
        <div className="page-card detail-stack">
          <p><strong>Disaster ID:</strong> {report.disasterId?._id || report.disasterId}</p>
          <p><strong>Reporter Name:</strong> {report.reporterName}</p>
          <p><strong>Contact Number:</strong> {report.contactNumber}</p>
          <p><strong>Damage Type:</strong> {report.damageType}</p>
          <p><strong>Description:</strong> {report.damageDescription}</p>
          <p><strong>Estimated Loss:</strong> ${report.estimatedLoss?.toLocaleString()}</p>
          <p><strong>Verification Status:</strong> 
            <span className={`status-chip ${report.verificationStatus === "Verified" ? "status-chip--verified" : report.verificationStatus === "Rejected" ? "status-chip--rejected" : "status-chip--pending"}`}>
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
            <div>
              <a href={report.googleMap.viewLocation} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                Open in Google Maps
              </a>
            </div>
          )}

          {report.images && report.images.length > 0 && (
            <div>
              <strong>Evidence Images:</strong>
              <div className="media-grid" style={{ marginTop: "0.75rem" }}>
                {report.images.map((img, idx) => (
                  <img key={idx} src={img} alt="evidence" style={{ width: "150px", height: "120px" }} />
                ))}
              </div>
            </div>
          )}

          {role === "admin" && report.verificationStatus === "Pending" && (
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button onClick={() => handleVerify("Verified")} className="btn-primary">Verify Report</button>
              <button onClick={() => handleVerify("Rejected")} className="btn-danger">Reject Report</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DamageReportDetails;