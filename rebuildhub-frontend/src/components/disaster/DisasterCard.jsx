import React from "react";
import { Link } from "react-router-dom";

const DisasterCard = ({ disaster }) => {
  return (
    <div style={styles.card}>
      <h3>{disaster.title}</h3>
      <p><strong>Type:</strong> {disaster.type}</p>
      <p><strong>Severity:</strong> {disaster.severityLevel}</p>
      <p><strong>Location:</strong> {disaster.location?.name || "N/A"}</p>
      <Link to={`/disasters/${disaster._id}`} style={styles.button}>View Details</Link>
    </div>
  );
};

const styles = {
  card: { border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", margin: "1rem", width: "300px", display: "inline-block" },
  button: { display: "inline-block", marginTop: "0.5rem", background: "#3498db", color: "white", padding: "0.3rem 0.8rem", textDecoration: "none", borderRadius: "4px" }
};

export default DisasterCard;