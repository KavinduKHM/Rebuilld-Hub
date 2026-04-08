import React, { useEffect, useState } from "react";
import { getDisasters } from "../../services/disasterService";
import DisasterCard from "./DisasterCard";
import Loader from "../common/Loader";
import { Link } from "react-router-dom";

const normalizeText = (value) => (value ?? "").toString().trim();

const getSortTime = (disaster) => {
  const source = disaster.updatedAt || disaster.createdAt;
  const parsed = source ? new Date(source).getTime() : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatTimeAgo = (value) => {
  if (!value) return "Time unavailable";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Time unavailable";

  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const severityScore = (severityLevel) => {
  if (typeof severityLevel === "number") return severityLevel;

  const text = normalizeText(severityLevel).toLowerCase();
  if (!text) return 0;
  if (text.includes("critical") || text.includes("extreme")) return 5;
  if (text.includes("high") || text.includes("severe")) return 4;
  if (text.includes("moderate") || text.includes("medium")) return 3;
  if (text.includes("low") || text.includes("minor")) return 2;

  const parsed = Number.parseFloat(text);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const isCriticalIncident = (disaster) => {
  const score = severityScore(disaster.severityLevel);
  return score >= 4;
};

const DisasterList = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const res = await getDisasters();
      setDisasters(res.data);
    } catch (err) {
      setError("Failed to load disasters");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="empty-state">{error}</p>;

    const sortedDisasters = [...disasters].sort((left, right) => getSortTime(right) - getSortTime(left));
    const categories = Array.from(
      new Set(sortedDisasters.map((disaster) => normalizeText(disaster.type)).filter(Boolean))
    );
    const filters = ["All", ...categories];
    const filteredDisasters =
      activeFilter === "All"
        ? sortedDisasters
        : sortedDisasters.filter(
            (disaster) => normalizeText(disaster.type).toLowerCase() === activeFilter.toLowerCase()
          );
    const criticalCount = disasters.filter(isCriticalIncident).length;
    const locationCount = new Set(
      disasters
        .map((disaster) => normalizeText(disaster.location?.name || disaster.location?.address || disaster.title))
        .filter(Boolean)
    ).size;
    const latestDisaster = sortedDisasters[0];
    const latestLabel = latestDisaster ? formatTimeAgo(latestDisaster.updatedAt || latestDisaster.createdAt) : "No recent updates";

  return (
      <div className="disaster-dashboard detail-stack">
        <section className="page-card disaster-hero">
          <div className="disaster-hero__copy">
            <span className="section-label">Tactical Overview</span>
            <h1 className="page-title">Active Emergency Operations</h1>
            <p className="page-subtitle">
              Real-time monitoring of reported incidents, response priority, and the current disaster queue.
            </p>
          </div>

          <div className="disaster-hero__stats">
            <div className="metric-card">
              <span>Active Incidents</span>
              <strong>{disasters.length}</strong>
            </div>
            <div className="metric-card metric-card--alert">
              <span>Critical Queue</span>
              <strong>{criticalCount}</strong>
            </div>
            <div className="metric-card">
              <span>Monitored Areas</span>
              <strong>{locationCount}</strong>
            </div>
            <div className="metric-card">
              <span>Latest Update</span>
              <strong>{latestLabel}</strong>
            </div>
          </div>
        </section>

        <div className="disaster-console">
          <aside className="page-card disaster-rail">
            <div>
              <span className="section-label">Incident Filters</span>
              <h2 className="disaster-rail__title">Disaster Types</h2>
              <p className="disaster-rail__text">
                Narrow the feed by incident type to focus on the active response queue.
              </p>
            </div>

            <div className="disaster-filter-list">
              {filters.map((filter) => {
                const count =
                  filter === "All"
                    ? disasters.length
                    : disasters.filter((disaster) => normalizeText(disaster.type).toLowerCase() === filter.toLowerCase()).length;

                return (
                  <button
                    key={filter}
                    type="button"
                    className={`filter-pill ${activeFilter === filter ? "filter-pill--active" : ""}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    <span>{filter}</span>
                    <strong>{count}</strong>
                  </button>
                );
              })}
            </div>

            <div className="disaster-rail__summary">
              <div>
                <span>Priority Flagged</span>
                <strong>{criticalCount}</strong>
              </div>
              <div>
                <span>Visible Now</span>
                <strong>{filteredDisasters.length}</strong>
              </div>
            </div>

            <Link to="/disasters/new" className="btn-primary disaster-rail__action">
              Report Incident
            </Link>
          </aside>

          <section className="disaster-main">
            <div className="disaster-workspace">
              <div className="disaster-workspace__header">
                <div>
                  <span className="section-label">Priority Queue</span>
                  <h2>Current Incidents</h2>
                </div>
                <p>
                  Showing {filteredDisasters.length} of {disasters.length}
                </p>
              </div>

              {filteredDisasters.length > 0 ? (
                <div className="disaster-grid">
                  {filteredDisasters.map((disaster, index) => (
                    <DisasterCard
                      key={disaster._id || `${disaster.title || "disaster"}-${index}`}
                      disaster={disaster}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <p className="empty-state">No disasters match the selected filter.</p>
              )}
            </div>
          </section>

          <aside className="page-card disaster-alerts">
            <div className="disaster-alerts__header">
              <span className="section-label">Recent Alerts</span>
              <span className="disaster-alerts__pulse" />
            </div>

            <div className="disaster-alerts__list">
              {sortedDisasters.slice(0, 4).map((disaster, index) => (
                <Link key={disaster._id || `${disaster.title || "alert"}-${index}`} to={`/disasters/${disaster._id}`} className="disaster-alert">
                  <span className={`disaster-alert__dot ${isCriticalIncident(disaster) ? "disaster-alert__dot--critical" : ""}`} />
                  <div>
                    <strong>{normalizeText(disaster.title) || "Untitled disaster"}</strong>
                    <p>
                      {normalizeText(disaster.location?.name || disaster.location?.address || "Location pending")}
                    </p>
                    <small>{formatTimeAgo(disaster.updatedAt || disaster.createdAt)}</small>
                  </div>
                </Link>
              ))}
            </div>

            <div className="disaster-signal">
              <span className="section-label">System Intel</span>
              <div className="disaster-signal__visual" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p>
                Current queue confidence remains high, with the latest incidents surfacing in the monitored zones above.
              </p>
            </div>
          </aside>
      </div>
    </div>
  );
};

export default DisasterList;