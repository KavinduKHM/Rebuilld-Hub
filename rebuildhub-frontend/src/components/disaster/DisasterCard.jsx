import React from "react";
import { Link } from "react-router-dom";

const normalizeText = (value) => (value ?? "").toString().trim();

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

const formatSeverity = (severityLevel) => {
  const score = severityScore(severityLevel);
  if (score >= 5) return "Critical";
  if (score >= 4) return "High";
  if (score >= 3) return "Moderate";
  if (score >= 2) return "Low";
  return normalizeText(severityLevel) || "Unknown";
};

const getSeverityTone = (severityLevel) => {
  const score = severityScore(severityLevel);
  if (score >= 5) return "critical";
  if (score >= 4) return "high";
  if (score >= 3) return "moderate";
  return "low";
};

const formatTimeAgo = (value) => {
  if (!value) return "Just updated";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Just updated";

  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const DisasterCard = ({ disaster, index = 0 }) => {
  const title = normalizeText(disaster.title) || "Untitled disaster";
  const type = normalizeText(disaster.type) || "Unknown type";
  const location = normalizeText(disaster.location?.name || disaster.location?.address || "Location pending");
  const severityLabel = formatSeverity(disaster.severityLevel);
  const severityTone = getSeverityTone(disaster.severityLevel);
  const updatedLabel = formatTimeAgo(disaster.updatedAt || disaster.createdAt);
  const isVerified = normalizeText(disaster.verificationStatus) === "Verified";
  const heroImage = disaster.images?.[0];
  const mediaStyle = heroImage
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(9, 22, 48, 0.1), rgba(9, 22, 48, 0.48)), url(${heroImage})`,
      }
    : undefined;

  return (
    <article className="page-card disaster-card">
      <Link to={`/disasters/${disaster._id}`} className="disaster-card__media" style={mediaStyle}>
        <span className={`disaster-badge disaster-badge--${severityTone}`}>{severityLabel}</span>
        <span className="disaster-card__index">#{index + 1}</span>
      </Link>

      <div className="disaster-card__body">
        <div className="disaster-card__meta">
          <span>{type}</span>
          <small>{updatedLabel}</small>
        </div>

        <h3>{title}</h3>
        <p className="disaster-card__location">{location}</p>

        <div className="disaster-card__stats">
          <div>
            <span>Severity</span>
            <strong>{severityLabel}</strong>
          </div>
          <div>
            <span>Type</span>
            <strong>{type}</strong>
          </div>
        </div>

        <div className="disaster-card__actions">
          <Link to={`/disasters/${disaster._id}`} className="btn-secondary">
            Inspect
          </Link>
          {isVerified ? (
            <Link
              to="/reports/new"
              state={{
                prefillReport: {
                  disasterId: disaster._id,
                  damageDescription: normalizeText(disaster.description),
                  location: {
                    latitude: disaster.location?.latitude ?? "",
                    longitude: disaster.location?.longitude ?? "",
                    address: disaster.location?.address || disaster.location?.name || "",
                  },
                },
              }}
              className="btn-primary"
            >
              Report Damage
            </Link>
          ) : (
            <span className="btn-primary btn-disabled" aria-disabled="true" title="Available after admin verification">
              Report Damage
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default DisasterCard;