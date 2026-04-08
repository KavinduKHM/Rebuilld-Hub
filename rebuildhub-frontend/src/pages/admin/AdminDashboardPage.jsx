import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDisasters, verifyDisaster } from "../../services/disasterService";
import Loader from "../../components/common/Loader";
import { clearAuthSession } from "../../services/authSession";

const commandSections = [
  {
    title: "Volunteers",
    summary: "Dummy section for future volunteer administration.",
    count: "128",
    accent: "#2563eb",
  },
  {
    title: "Resources",
    summary: "Inventory and resource management will be connected later.",
    count: "42",
    accent: "#0ea5e9",
  },
  {
    title: "Aid Requests",
    summary: "Request triage and fulfillment is not integrated yet.",
    count: "17",
    accent: "#f59e0b",
  },
  {
    title: "Disasters",
    summary: "Review and verify disaster entries from the public feed.",
    count: "Live",
    accent: "#ef4444",
  },
];

const normalizeText = (value) => (value ?? "").toString().trim();

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      setLoading(false);
      return;
    }

    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const response = await getDisasters();
      setDisasters(response.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/", { replace: true });
  };

  const handleVerify = async (id, status) => {
    setUpdatingId(id);
    try {
      await verifyDisaster(id, status);
      await fetchDisasters();
    } finally {
      setUpdatingId("");
    }
  };

  const pendingDisasters = disasters.filter((disaster) => (disaster.verificationStatus || "Pending") === "Pending");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar page-card">
        <div>
          <div className="admin-brand">Command Center</div>
          <p className="admin-brand-subtitle">Operational Lead</p>
        </div>

        <div className="admin-status-pill">System Status: Active</div>

        <nav className="admin-nav">
          <a href="#disasters" className="admin-nav-link admin-nav-link--active">Disasters</a>
          <Link to="/admin/volunteers" className="admin-nav-link">Volunteers</Link>
          <a href="#resources" className="admin-nav-link">Resources</a>
          <a href="#aid-requests" className="admin-nav-link">Aid Requests</a>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="btn-secondary admin-sidebar-action" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar page-card">
          <div>
            <span className="section-label">Tactical Clarity</span>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">
              Manage disaster verification now. Volunteers, resources, and aid requests are visible as placeholders until those modules are connected.
            </p>
          </div>
          <div className="admin-topbar__meta">
            <span>Pending disasters: {pendingDisasters.length}</span>
            <span>Verified disasters: {disasters.filter((item) => item.verificationStatus === "Verified").length}</span>
          </div>
        </header>

        <section className="admin-section-grid" id="volunteers">
          {commandSections.map((section) => (
            <article key={section.title} className="admin-section-card page-card">
              <div className="admin-section-card__accent" style={{ backgroundColor: section.accent }} />
              <div className="admin-section-card__body">
                <span className="admin-section-card__title">{section.title}</span>
                <strong>{section.count}</strong>
                <p>{section.summary}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="admin-workspace" id="disasters">
          <div className="admin-panel page-card">
            <div className="admin-panel__header">
              <div>
                <span className="section-label">Disaster Verification</span>
                <h2>Review Queue</h2>
              </div>
              <Link to="/disasters" className="btn-secondary">Open Disaster Feed</Link>
            </div>

            {loading ? (
              <Loader />
            ) : pendingDisasters.length === 0 ? (
              <p className="empty-state">No disaster verifications pending right now.</p>
            ) : (
              <div className="admin-verification-list">
                {pendingDisasters.map((disaster) => (
                  <article key={disaster._id} className="admin-verification-card">
                    <div>
                      <span className={`status-chip ${disaster.verificationStatus === "Verified" ? "status-chip--verified" : disaster.verificationStatus === "Rejected" ? "status-chip--rejected" : "status-chip--pending"}`}>
                        {disaster.verificationStatus || "Pending"}
                      </span>
                      <h3>{normalizeText(disaster.title) || "Untitled disaster"}</h3>
                      <p>{normalizeText(disaster.location?.name || disaster.location?.address || "Location pending")}</p>
                    </div>
                    <div className="admin-verification-actions">
                      <Link to={`/disasters/${disaster._id}`} className="btn-secondary">Details</Link>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleVerify(disaster._id, "Verified")}
                        disabled={updatingId === disaster._id}
                      >
                        {updatingId === disaster._id ? "Saving..." : "Verify"}
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleVerify(disaster._id, "Rejected")}
                        disabled={updatingId === disaster._id}
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="admin-dummy-grid">
          <div className="admin-panel page-card" id="resources">
            <span className="section-label">Resources</span>
            <h3>Coming Soon</h3>
            <p>Resource management remains a placeholder until inventory tools are integrated.</p>
          </div>
          <div className="admin-panel page-card" id="aid-requests">
            <span className="section-label">Aid Requests</span>
            <h3>Coming Soon</h3>
            <p>Request approvals and fulfillment will be connected in a later iteration.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
