import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <main className="theme-shell">
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="system-pill">System Online: Global Status Green</span>
            <h1>
              Smart Disaster Relief
              <br />
              <span>&amp; Aid Management</span>
            </h1>
            <p>
              RebuildHub bridges the gap between chaos and coordination. A high-performance
              ecosystem designed for real-time aid deployment, resource tracking, and
              volunteer mobilization.
            </p>
            <div className="hero-actions">
              <Link to="/disasters/new" className="btn-primary">Report Disaster</Link>
              <Link to="/disasters" className="btn-secondary">View Disasters</Link>
            </div>
          </div>

          <div className="ops-card">
            <div className="ops-title">Live Operations Dashboard</div>
            <div className="ops-metrics">
              <div>
                <p>Active Requests</p>
                <strong>1,284</strong>
              </div>
              <div>
                <p>Efficiency Rate</p>
                <strong>94.2%</strong>
              </div>
            </div>
            <div className="ops-event">Tsunami Warning - SE Asia <em>Critical</em></div>
            <div className="ops-event">Medical Supplies Dispatched <em>In Transit</em></div>
          </div>
        </div>
      </section>

      <section className="core-section">
        <div className="container">
          <h2>Core Infrastructure</h2>
          <p className="section-sub">Our integrated modules provide a seamless pipeline for disaster management.</p>
          <div className="feature-grid">
            <article className="feature-card">
              <h3>Damage Reporting</h3>
              <p>Capture field damage with photos, geolocation, and verified severity context.</p>
            </article>
            <article className="feature-card">
              <h3>Aid Management</h3>
              <p>Route supplies by urgency, demographics, and dynamic accessibility patterns.</p>
            </article>
            <article className="feature-card">
              <h3>Volunteer Coordination</h3>
              <p>Match skills and proximity for faster ground-level response operations.</p>
            </article>
            <article className="feature-card">
              <h3>Resource Tracking</h3>
              <p>Maintain end-to-end logistics visibility from intake to last-mile delivery.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="stats-band">
        <div className="container stats-grid">
          <div><span>Total Disasters</span><strong>412</strong><small>Actively Monitored</small></div>
          <div><span>Active Aid Requests</span><strong>8.5k</strong><small>Processing 24/7</small></div>
          <div><span>Registered Volunteers</span><strong>120k</strong><small>Global Network</small></div>
          <div><span>Resources Available</span><strong>$2.4B</strong><small>Allocated Relief</small></div>
        </div>
      </section>

      <section className="impact-section">
        <div className="container impact-grid">
          <div>
            <h2>Global Impact Visualization</h2>
            <p>
              Our live map gives teams an instant view of disaster zones,
              distribution hubs, and pending requests in one place.
            </p>
            <ul className="legend-list">
              <li>Active Disaster Zone</li>
              <li>Distribution Hub</li>
              <li>Pending Request</li>
            </ul>
          </div>
          <div className="world-map-panel">
            <iframe
              title="Sri Lanka map"
              className="world-map-embed"
              src="https://www.openstreetmap.org/export/embed.html?bbox=79.5215%2C5.9168%2C81.8790%2C9.9417&amp;layer=mapnik"
            />
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3>RebuildHub</h3>
            <p>The disaster response platform for rapid coordination and transparent aid delivery.</p>
          </div>
          <div>
            <h4>Platform</h4>
            <p>Crisis Analytics</p>
            <p>Logistics Engine</p>
            <p>Volunteer Portal</p>
          </div>
          <div>
            <h4>Support</h4>
            <p>Emergency Contact</p>
            <p>Help Center</p>
            <p>Status Page</p>
          </div>
          <div>
            <h4>Newsletter</h4>
            <p>Get critical updates on relief operations.</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;