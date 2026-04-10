import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getDisasters } from "../services/disasterService";
import { formatCurrencyLKR } from "../utils/formatters";

// Fix Leaflet marker icons for React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const mapCenter = [7.8731, 80.7718];

const Home = () => {
  const [disasters, setDisasters] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  useEffect(() => {
    let timer;

    const loadDisasters = async () => {
      try {
        const response = await getDisasters();
        setDisasters(response.data || []);
        setLastUpdated(new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }));
      } catch (error) {
        // Keep previous data if fetch fails.
      }
    };

    loadDisasters();
    timer = setInterval(loadDisasters, 20000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const activeDisasters = useMemo(
    () => disasters.filter((item) => item.status === "Active"),
    [disasters]
  );

  const pendingDisasters = useMemo(
    () => disasters.filter((item) => (item.verificationStatus || "Pending") === "Pending"),
    [disasters]
  );

  const totalDisasters = disasters.length;
  const activeAidRequests = pendingDisasters.length;
  const registeredVolunteers = 120000;
  const resourceBudget = 2400000000;

  const mapMarkers = activeDisasters
    .map((item) => {
      const lat = Number(item.location?.latitude);
      const lng = Number(item.location?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return { id: item._id, lat, lng, title: item.title, type: item.type };
    })
    .filter(Boolean);

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
              <span className="ops-updated">Updated: {lastUpdated}</span>
            </div>
            <div className="ops-metrics">
              <div>
                <p>Active Requests</p>
                <strong>{activeAidRequests}</strong>
              </div>
              <div>
                <p>Efficiency Rate</p>
                <strong>{totalDisasters ? Math.min(100, Math.round((activeDisasters.length / totalDisasters) * 100)) : 0}%</strong>
              </div>
            </div>
            <div className="ops-tags">
              <span className="ops-tag ops-tag--warning">Active incidents: {activeDisasters.length}</span>
              <span className="ops-tag ops-tag--success">Pending verification: {pendingDisasters.length}</span>
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
          <div className="stats-grid__item"><span>Total Disasters</span><strong>{totalDisasters}</strong><small>Actively Monitored</small></div>
          <div className="stats-grid__item"><span>Active Aid Requests</span><strong>{activeAidRequests}</strong><small>Processing 24/7</small></div>
          <div className="stats-grid__item"><span>Registered Volunteers</span><strong>{Math.round(registeredVolunteers / 1000)}k</strong><small>Global Network</small></div>
          <div className="stats-grid__item stats-grid__item--wide"><span>Resources Available</span><strong>24000</strong><small>Allocated Relief</small></div>
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
            <MapContainer
              center={mapCenter}
              zoom={7}
              scrollWheelZoom={false}
              className="world-map-embed"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapMarkers.map((marker) => (
                <Marker key={marker.id} position={[marker.lat, marker.lng]}>
                  <Popup>
                    <strong>{marker.title || "Active Disaster"}</strong>
                    <div>{marker.type || "Other"}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;