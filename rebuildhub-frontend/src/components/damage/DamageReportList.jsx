import React from "react";
import { Link } from "react-router-dom";

const DamageReportList = ({ reports, disasterId }) => {
  if (!reports || reports.length === 0) {
    return <p>No damage reports found for this disaster.</p>;
  }

  return (
    <div>
      <h3>Damage Reports</h3>
      {reports.map((report) => (
        <div key={report._id} className="card">
          <p><strong>Reporter:</strong> {report.reporterName}</p>
          <p><strong>Contact:</strong> {report.contactNumber}</p>
          <p><strong>Damage Type:</strong> {report.damageType}</p>
          <p><strong>Description:</strong> {report.damageDescription}</p>
          <p><strong>Estimated Loss:</strong> ${report.estimatedLoss?.toLocaleString()}</p>
          <p><strong>Status:</strong> 
            <span style={{ 
              color: report.verificationStatus === "Verified" ? "#2ecc71" : 
                     report.verificationStatus === "Rejected" ? "#e74c3c" : "#f39c12" 
            }}>
              {report.verificationStatus}
            </span>
          </p>
          {report.googleMap?.viewLocation && (
            <a href={report.googleMap.viewLocation} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: "inline-block", marginTop: "0.5rem" }}>
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