import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDisasters, verifyDisaster } from "../../services/disasterService";
import Loader from "../../components/common/Loader";
import { clearAuthSession } from "../../services/authSession";

const normalizeText = (value) => (value ?? "").toString().trim();

const getSeverityClass = (severity) => {
  if (severity === "Critical") return "tac-severity tac-severity--critical";
  if (severity === "High") return "tac-severity tac-severity--high";
  if (severity === "Medium") return "tac-severity tac-severity--medium";
  return "tac-severity tac-severity--low";
};

const formatClock = (date) => {
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return `${time} ZULU`;
};

const formatShortDate = (value) => {
  if (!value) return "Unknown time";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown time";
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const chartTypes = [
  { key: "Flood", color: "#2563eb" },
  { key: "Earthquake", color: "#ef4444" },
  { key: "Landslide", color: "#f59e0b" },
  { key: "Cyclone", color: "#10b981" },
  { key: "Other", color: "#8b5cf6" },
];

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const timer = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const verifiedCount = useMemo(
    () => disasters.filter((item) => item.verificationStatus === "Verified").length,
    [disasters]
  );

  const pendingDisasters = useMemo(
    () => disasters.filter((disaster) => (disaster.verificationStatus || "Pending") === "Pending"),
    [disasters]
  );

  const orderedQueue = useMemo(() => {
    const rank = (status) => {
      if (status === "Pending") return 0;
      if (status === "Rejected") return 1;
      if (status === "Verified") return 2;
      return 3;
    };

    return [...disasters].sort((a, b) => {
      const aStatus = a.verificationStatus || "Pending";
      const bStatus = b.verificationStatus || "Pending";
      return rank(aStatus) - rank(bStatus);
    });
  }, [disasters]);

  const filteredQueue = useMemo(() => {
    const term = normalizeText(searchTerm).toLowerCase();
    return orderedQueue.filter((disaster) => {
      const status = (disaster.verificationStatus || "Pending").toLowerCase();
      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }

      const title = normalizeText(disaster.title).toLowerCase();
      const location = normalizeText(disaster.location?.name || disaster.location?.address).toLowerCase();
      const type = normalizeText(disaster.type).toLowerCase();
      if (!term) return true;
      return title.includes(term) || location.includes(term) || type.includes(term);
    });
  }, [orderedQueue, searchTerm, statusFilter]);

  const activeCount = disasters.filter((item) => item.status === "Active").length;
  const highRiskCount = disasters.filter(
    (item) => item.severityLevel === "Critical" || item.severityLevel === "High"
  ).length;
  const deploymentEfficiency = disasters.length
    ? Math.min(100, Math.round((verifiedCount / disasters.length) * 100))
    : 0;

  const recentAlerts = [...disasters]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 4);

  const displayedDisasters = filteredQueue;

  const chartData = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleString(undefined, { month: "short" });
      return { key, label };
    });

    const bucketIndex = buckets.reduce((acc, bucket, index) => {
      acc[bucket.key] = index;
      return acc;
    }, {});

    const series = chartTypes.map((type) => ({
      ...type,
      counts: new Array(buckets.length).fill(0),
    }));

    disasters.forEach((disaster) => {
      const createdAt = new Date(disaster.createdAt || disaster.updatedAt);
      if (Number.isNaN(createdAt.getTime())) return;

      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const index = bucketIndex[key];
      if (index === undefined) return;

      const typeKey = chartTypes.some((type) => type.key === disaster.type) ? disaster.type : "Other";
      const target = series.find((item) => item.key === typeKey) || series[series.length - 1];
      target.counts[index] += 1;
    });

    const maxCount = Math.max(1, ...series.flatMap((item) => item.counts));
    return { buckets, series, maxCount };
  }, [disasters]);

  const renderLinePoints = (counts, width, height, padding) => {
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    return counts
      .map((value, index) => {
        const x = padding.left + (innerWidth * index) / Math.max(1, counts.length - 1);
        const y = padding.top + innerHeight - (innerHeight * value) / chartData.maxCount;
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="tac-shell">
      <aside className="tac-sidebar">
        <div>
          <h1>Tactical Command</h1>
          <span className="tac-sidebar-subtitle">Sector 7G - Active</span>
        </div>

        <div className="admin-status-pill">System Status: Active</div>

        <nav className="admin-nav">
          <a href="#disasters" className="admin-nav-link admin-nav-link--active">Disasters</a>
          <Link to="/admin/volunteers" className="admin-nav-link">Volunteers</Link>
          <a href="#resources" className="admin-nav-link">Resources</a>
          <a href="#aid-requests" className="admin-nav-link">Aid Requests</a>
        </nav>

        <div className="tac-sidebar-footer">
          <button className="btn-secondary" type="button" onClick={handleLogout}>Logout</button>
          
        </div>
      </aside>

      <main className="tac-main">
        <header className="tac-topbar">
          <div>
            <span className="section-label">Tactical Intelligence Dashboard</span>
            <h2>Strategic Command</h2>
          </div>

          <div className="tac-topbar__actions">
            <input
              type="search"
              className="tac-search"
              placeholder="Search parameters..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            
          </div>
        </header>

        <section className="tac-status-grid">
          <article className="tac-status tac-status--neutral">
            <span>Active Incidents</span>
            <strong>{disasters.length}</strong>
            <small>{highRiskCount} high-risk records</small>
          </article>

          <article className="tac-status tac-status--critical">
            <span>Critical Queue</span>
            <strong>{pendingDisasters.length}</strong>
            <small>Requiring immediate response</small>
          </article>

          <article className="tac-status tac-status--primary">
            <span>Deployment Status</span>
            <strong>{deploymentEfficiency}%</strong>
            <small>Operational efficiency</small>
          </article>

          <article className="tac-status tac-status--ghost">
            <span>Current Time</span>
            <strong>{clock}</strong>
            <small>{activeCount} active disasters</small>
          </article>
        </section>

        <section className="tac-content-grid" id="disasters">
          <div className="tac-queue-column">
            <div className="tac-panel tac-panel--queue">
              <div className="tac-panel__head">
                <h3>High-Fidelity Incident Queue</h3>
                <div className="tac-filter-row">
                  <button
                    type="button"
                    className={`tac-filter-pill ${statusFilter === "all" ? "tac-filter-pill--active" : ""}`}
                    onClick={() => setStatusFilter("all")}
                  >
                    All ({disasters.length})
                  </button>
                  <button
                    type="button"
                    className={`tac-filter-pill ${statusFilter === "pending" ? "tac-filter-pill--active" : ""}`}
                    onClick={() => setStatusFilter("pending")}
                  >
                    Pending ({pendingDisasters.length})
                  </button>
                  <button
                    type="button"
                    className={`tac-filter-pill ${statusFilter === "verified" ? "tac-filter-pill--active" : ""}`}
                    onClick={() => setStatusFilter("verified")}
                  >
                    Verified ({verifiedCount})
                  </button>
                  <button
                    type="button"
                    className={`tac-filter-pill ${statusFilter === "rejected" ? "tac-filter-pill--active" : ""}`}
                    onClick={() => setStatusFilter("rejected")}
                  >
                    Rejected ({disasters.length - pendingDisasters.length - verifiedCount})
                  </button>
                </div>
              </div>

              {loading ? (
                <Loader />
              ) : displayedDisasters.length === 0 ? (
                <p className="empty-state">No disasters match your filter or search.</p>
              ) : (
                <div className="tac-incident-list">
                  {displayedDisasters.map((disaster) => (
                    <article key={disaster._id} className="tac-incident-card">
                      <div
                        className="tac-incident-media"
                        style={{
                          backgroundImage: disaster.images?.[0]
                            ? `linear-gradient(180deg, rgba(10,18,38,0.12), rgba(10,18,38,0.45)), url(${disaster.images[0]})`
                            : "linear-gradient(140deg, rgba(42,98,216,0.52), rgba(217,45,32,0.48))",
                        }}
                      >
                        <span className={getSeverityClass(disaster.severityLevel)}>
                          {disaster.severityLevel || "Low"}
                        </span>
                      </div>

                      <div className="tac-incident-body">
                        <div className="tac-incident-head">
                          <h4>{normalizeText(disaster.title) || "Untitled Disaster"}</h4>
                          <small>{formatShortDate(disaster.createdAt)}</small>
                        </div>

                        <p className="tac-incident-location">
                          {normalizeText(disaster.location?.name || disaster.location?.address || "Location pending")}
                        </p>

                        <div className="tac-incident-metrics">
                          <div>
                            <span>Verification</span>
                            <strong>{disaster.verificationStatus || "Pending"}</strong>
                          </div>
                          <div>
                            <span>Type</span>
                            <strong>{disaster.type || "Other"}</strong>
                          </div>
                          <div>
                            <span>Status</span>
                            <strong>{disaster.status || "Under Assessment"}</strong>
                          </div>
                        </div>

                        <div className="tac-incident-actions">
                          <Link to={`/disasters/${disaster._id}`} className="btn-secondary">Details</Link>
                          
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="tac-panel tac-panel--heatmap" id="analytics">
              <div>
                <span className="section-label">Tactical Heat Map Overlay</span>
                <h3>Threat Density Snapshot</h3>
              </div>
              <div className="tac-line-chart">
                <svg className="tac-line-chart__svg" viewBox="0 0 640 320" role="img" aria-label="Disaster trends over time">
                  <rect x="0" y="0" width="640" height="320" rx="14" fill="#121927" />
                  {[0, 1, 2, 3, 4].map((tick) => (
                    <line
                      key={`grid-${tick}`}
                      x1="50"
                      y1={40 + tick * 55}
                      x2="620"
                      y2={40 + tick * 55}
                      stroke="rgba(255,255,255,0.12)"
                    />
                  ))}
                  {[0, 1, 2, 3, 4, 5].map((tick) => (
                    <line
                      key={`grid-x-${tick}`}
                      x1={50 + tick * 114}
                      y1="40"
                      x2={50 + tick * 114}
                      y2="270"
                      stroke="rgba(255,255,255,0.1)"
                    />
                  ))}
                  {chartData.series.map((series) => (
                    <polyline
                      key={series.key}
                      fill="none"
                      stroke={series.color}
                      strokeWidth="2.6"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={renderLinePoints(series.counts, 640, 320, { top: 40, right: 20, bottom: 50, left: 50 })}
                    />
                  ))}
                  {chartData.buckets.map((bucket, index) => (
                    <text
                      key={bucket.key}
                      x={50 + index * 114}
                      y="300"
                      fill="#9fb0d5"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {bucket.label}
                    </text>
                  ))}
                </svg>
                <div className="tac-line-chart__legend">
                  {chartData.series.map((series) => (
                    <div key={series.key}>
                      <span style={{ backgroundColor: series.color }} />
                      {series.key}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="tac-right-column">
            

            <article className="tac-panel tac-panel--alerts" id="logistics">
              <div className="tac-panel__head">
                <h3>Global Alerts</h3>
                <span className="tac-live-dot">Live</span>
              </div>

              {recentAlerts.length === 0 ? (
                <p className="empty-state">No alert records available.</p>
              ) : (
                <div className="tac-alert-list">
                  {recentAlerts.map((item) => (
                    <div key={item._id} className="tac-alert-item">
                      <span className="tac-alert-line" />
                      <div>
                        <small>{formatShortDate(item.updatedAt || item.createdAt)}</small>
                        <strong>{normalizeText(item.title) || "Untitled disaster"}</strong>
                        <p>{normalizeText(item.location?.name || item.location?.address || "Location pending")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
