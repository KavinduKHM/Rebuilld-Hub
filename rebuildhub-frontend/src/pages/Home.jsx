import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <main className="theme-shell">
      <section className="hero-section" id="dashboard">
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
              <Link to="/disasters/new" className="btn-primary">Get Started</Link>
              <Link to="/disasters" className="btn-secondary">Learn More</Link>
            </div>
          </div>

          <div className="ops-card ops-card--wide">
            <div className="ops-header">
              <div className="ops-title">Live Operations</div>
              <span className="ops-updated">Updated: Just Now</span>
            </div>
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
            <div className="ops-tags">
              <span className="ops-tag ops-tag--warning">Tsunami Warning - SE Asia</span>
              <span className="ops-tag ops-tag--success">Medical Supplies Dispatched</span>
            </div>
            <div className="ops-actions">
              <Link to="/disasters" className="btn-secondary">View Disasters</Link>
              <Link to="/aid/verified-reports" className="btn-primary">Request Aid</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="core-section" id="resources">
        <div className="container">
          <h2>Core Infrastructure</h2>
          <p className="section-sub">A comprehensive suite of tools designed to streamline disaster response and maximize impact.</p>
          <div className="feature-grid">
            <article className="feature-card">
              <h3>Damage Reporting</h3>
              <p>Real-time damage assessment and reporting with AI-powered severity classification.</p>
            </article>
            <article className="feature-card">
              <h3>Aid Management</h3>
              <p>End-to-end aid package tracking from warehouse to last-mile delivery.</p>
            </article>
            <article className="feature-card">
              <h3>Volunteer Coordination</h3>
              <p>Smart matching of volunteer skills to disaster response needs.</p>
            </article>
            <article className="feature-card">
              <h3>Resource Tracking</h3>
              <p>Live inventory management across all distribution centers and supply chains.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="stats-band" id="volunteer">
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
              Real-time tracking of ongoing operations worldwide.
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
    </main>
  );
};

export default Home;