import React from "react";
import { Link } from "react-router-dom";
import { formatCurrencyLKR } from "../../utils/formatters";

const DamageReportList = ({ reports, disasterId }) => {
  if (!reports || reports.length === 0) {
    return <p>No damage reports found for this disaster.</p>;
  }

  return (
    <div className="detail-stack">
      <h3>Damage Reports</h3>
      {reports.map((report) => (
        <div key={report._id} className="page-card">
          <p><strong>Reporter:</strong> {report.reporterName}</p>
          <p><strong>Contact:</strong> {report.contactNumber}</p>
          <p><strong>Damage Type:</strong> {report.damageType}</p>
          <p><strong>Description:</strong> {report.damageDescription}</p>
          <p><strong>Estimated Loss:</strong> {formatCurrencyLKR(report.estimatedLoss)}</p>
          <p><strong>Status:</strong> 
            <span className={`status-chip ${(report.verificationStatus === "Verified" || report.verificationStatus === "Approved") ? "status-chip--verified" : report.verificationStatus === "Rejected" ? "status-chip--rejected" : "status-chip--pending"}`}>
              {report.verificationStatus}
            </span>
          </p>
          {report.googleMap?.viewLocation && (
            <a href={report.googleMap.viewLocation} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: "inline-flex", marginTop: "0.5rem" }}>
              View on Map
            </a>
          )}
          <Link to={`/damage/${report._id}`} style={{ marginLeft: "1rem" }} className="btn-primary">
            Details
          </Link>
        </div>
      ))}
    </div>
  );
};

export default DamageReportList;