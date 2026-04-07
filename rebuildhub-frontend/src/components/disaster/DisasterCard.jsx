import React from "react";
import { Link } from "react-router-dom";

const DisasterCard = ({ disaster }) => {
  return (
    <div className="page-card">
      <h3>{disaster.title}</h3>
      <p><strong>Type:</strong> {disaster.type}</p>
      <p><strong>Severity:</strong> {disaster.severityLevel}</p>
      <p><strong>Location:</strong> {disaster.location?.name || "N/A"}</p>
      <Link to={`/disasters/${disaster._id}`} className="btn-primary" style={{ marginTop: "0.8rem" }}>View Details</Link>
    </div>
  );
};

export default DisasterCard;