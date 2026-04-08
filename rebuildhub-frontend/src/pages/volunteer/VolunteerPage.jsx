// src/pages/volunteer/VolunteerPage.jsx
import React from "react";
import VolunteerForm from "../../components/volunteer/VolunteerForm";
import "./VolunteerPage.css";

const VolunteerPage = () => {
  return (
    <div className="volunteer-page">
      {/* Abstract Background Elements */}
      <div className="background-blobs">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {/* Left Side: Context & Trust */}
          <div className="left-panel">
            <div className="mission-badge">
              <span className="badge-line"></span>
              Join the Mission
            </div>
            <h1 className="hero-title">
              Be the beacon in the <span className="highlight">aftermath.</span>
            </h1>
            <p className="hero-description">
              RebuildHub connects skilled individuals with emergency response
              zones across Sri Lanka. Your expertise can save lives and restore
              communities.
            </p>
            <div className="features">
              <div className="feature-item">
                <div className="feature-icon">
                  <span className="material-symbols-outlined">
                    verified_user
                  </span>
                </div>
                <div>
                  <h3>Verified Coordination</h3>
                  <p>
                    Work within a structured, military-grade logistics network.
                  </p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <span className="material-symbols-outlined">speed</span>
                </div>
                <div>
                  <h3>Rapid Deployment</h3>
                  <p>
                    Real-time alerts for critical situations in your chosen
                    district.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Application Form */}
          <div className="right-panel">
            <VolunteerForm />
            <p className="form-disclaimer">
              By submitting, you agree to RebuildHub's code of conduct and
              emergency protocols.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="material-symbols-outlined">shield</span>
            <span>SECURED COMMAND CENTER</span>
          </div>
          <div className="footer-right">
            © 2026 RebuildHub Disaster Response Network. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VolunteerPage;
