import React from "react";
import DisasterList from "../../components/disaster/DisasterList";
import { Link } from "react-router-dom";

const DisasterPage = () => {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="section-label">Disaster Feed</span>
            <h1 className="page-title">Reported Disasters</h1>
            <p className="page-subtitle">
              Browse active incidents, inspect details, and jump into the live response flow.
            </p>
          </div>
          <div className="page-actions">
            <Link to="/disasters/new" className="btn-primary">Report New Disaster</Link>
          </div>
        </div>
        <DisasterList />
      </div>
    </div>
  );
};

export default DisasterPage;