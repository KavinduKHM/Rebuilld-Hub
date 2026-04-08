import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReportById, verifyReport } from "../../services/damageService";
import Loader from "../common/Loader";
import { formatCurrencyLKR } from "../../utils/formatters";

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
    <div className="page-shell damage-detail-shell">
      <div className="container detail-stack">
        <header className="page-card damage-detail-header">
          <div>
            <span className="section-label">Damage Detail</span>
            <h1 className="page-title">Damage Report Details</h1>
            <p className="page-subtitle">Full field submission with verification context and evidence assets.</p>
          </div>
          <div className="damage-detail-meta">
            <span className={`status-chip ${(report.verificationStatus === "Verified" || report.verificationStatus === "Approved") ? "status-chip--verified" : report.verificationStatus === "Rejected" ? "status-chip--rejected" : "status-chip--pending"}`}>
              {report.verificationStatus}
            </span>
            <div>
              <small>Estimated Loss</small>
              <strong>{formatCurrencyLKR(report.estimatedLoss)}</strong>
            </div>
          </div>
        </header>

        <section className="damage-detail-grid">
          <div className="damage-detail-main">
            <div className="page-card damage-detail-summary">
              <div>
                <span className="section-label">Report Summary</span>
                <h2>{report.damageType || "Damage Report"}</h2>
                <p className="damage-detail-description">{report.damageDescription}</p>
              </div>
              <div className="damage-detail-badges">
                <div>
                  <span>Reporter</span>
                  <strong>{report.reporterName || "Unknown"}</strong>
                </div>
                <div>
                  <span>Contact</span>
                  <strong>{report.contactNumber || "N/A"}</strong>
                </div>
                <div>
                  <span>Disaster ID</span>
                  <strong>{report.disasterId?._id || report.disasterId}</strong>
                </div>
              </div>
            </div>

            {report.images && report.images.length > 0 && (
              <div className="page-card damage-detail-evidence">
                <div className="damage-detail-section-head">
                  <span className="section-label">Evidence Images</span>
                  <strong>{report.images.length} Files</strong>
                </div>
                <div className="damage-detail-evidence-grid">
                  {report.images.map((img, idx) => (
                    <img key={idx} src={img} alt="evidence" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="damage-detail-side">
            <div className="page-card damage-detail-location">
              <div className="damage-detail-section-head">
                <span className="section-label">Location</span>
              </div>
              {report.location && (report.location.latitude || report.location.longitude) ? (
                <div className="damage-detail-location-info">
                  <p><strong>Lat:</strong> {report.location.latitude}</p>
                  <p><strong>Lng:</strong> {report.location.longitude}</p>
                  <p><strong>Address:</strong> {report.location.address || "N/A"}</p>
                </div>
              ) : (
                <p className="empty-state">Location not recorded.</p>
              )}
              {report.googleMap?.viewLocation && (
                <a href={report.googleMap.viewLocation} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  Open in Google Maps
                </a>
              )}
            </div>

            {role === "admin" && report.verificationStatus === "Pending" && (
              <div className="page-card damage-detail-actions">
                <span className="section-label">Admin Actions</span>
                <button onClick={() => handleVerify("Approved")} className="btn-primary">Approve Report</button>
                <button onClick={() => handleVerify("Rejected")} className="btn-danger">Reject Report</button>
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
};

export default DamageReportDetails;