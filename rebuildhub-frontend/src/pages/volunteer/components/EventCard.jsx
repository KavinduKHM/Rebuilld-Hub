// src/pages/volunteer/components/EventCard.jsx
import React, { useState } from "react";

const EventCard = ({ event, onInterest }) => {
  const [isInterested, setIsInterested] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState(false);

  const handleInterest = async () => {
    setIsInterested(true);
    setError(false);

    try {
      if (onInterest) {
        await onInterest({
          eventId: event._id || event.nasaEventId || event.id,
          eventData: event,
        });
      }
    } catch (err) {
      setError(true);
      setIsInterested(false);
      console.error("Interest registration failed:", err);
    }
  };

  const categoryKey = (category) => {
    return String(category || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  };

  // Different icons for different disaster types with better visuals
  const getCategoryIcon = (category) => {
    const icons = {
      floods: "flood",
      earthquake: "earthquake",
      cyclones: "cyclone",
      cyclone: "cyclone",
      landslide: "landslide",
      landslides: "landslide",
      tsunami: "tsunami",
      wildfires: "local_fire_department",
      wildfire: "local_fire_department",
      drought: "water_drop",
      storm: "thunderstorm",
      severestorms: "storm",
      volcano: "volcano",
      earthquakes: "earthquake",
      severe_storms: "storm",
    };
    return icons[categoryKey(category)] || "warning";
  };

  const getCategoryColor = (category) => {
    const colors = {
      floods: "#3b82f6",
      earthquake: "#ef4444",
      earthquakes: "#ef4444",
      cyclone: "#8b5cf6",
      cyclones: "#8b5cf6",
      landslide: "#f59e0b",
      landslides: "#f59e0b",
      tsunami: "#06b6d4",
      wildfire: "#ea580c",
      wildfires: "#ea580c",
      drought: "#d97706",
      storm: "#6366f1",
      severestorms: "#4f46e5",
      severe_storms: "#4f46e5",
      volcano: "#dc2626",
    };
    return colors[categoryKey(category)] || "#00677e";
  };

  // Human-readable category name
  const getCategoryName = (category) => {
    const names = {
      floods: "🌊 Floods",
      earthquake: "🏔️ Earthquake",
      earthquakes: "🏔️ Earthquakes",
      cyclone: "🌀 Cyclone",
      cyclones: "🌀 Cyclones",
      landslide: "⛰️ Landslide",
      landslides: "⛰️ Landslides",
      tsunami: "🌊 Tsunami",
      wildfire: "🔥 Wildfire",
      wildfires: "🔥 Wildfires",
      drought: "💧 Drought",
      storm: "⛈️ Storm",
      volcano: "🌋 Volcano",
      severestorms: "⚡ Severe Storms",
      severe_storms: "⚡ Severe Storms",
    };
    const key = categoryKey(category);
    return names[key] || category || "⚠️ Disaster";
  };

  return (
    <div className="event-card-component glass">
      <div className="event-card-header">
        <div
          className="event-category-icon"
          style={{ backgroundColor: `${getCategoryColor(event.category)}15` }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: getCategoryColor(event.category) }}
          >
            {getCategoryIcon(event.category)}
          </span>
        </div>
        <span
          className="event-status"
          style={{ color: event.status === "ACTIVE" ? "#2ecc71" : "#f39c12" }}
        >
          {event.status === "ACTIVE" ? "● ACTIVE" : "○ MONITORING"}
        </span>
      </div>

      <div className="event-category-name">
        {getCategoryName(event.category)}
      </div>

      <h3 className="event-card-title">{event.title}</h3>

      <div className="event-card-location">
        <span className="material-symbols-outlined">location_on</span>
        <span>
          {event.districts?.slice(0, 2).join(", ") ||
            event.countries?.join(", ") ||
            "Location TBD"}
        </span>
      </div>

      <p className="event-card-description">
        {showDetails
          ? event.description
          : `${event.description?.substring(0, 100)}...`}
        {event.description?.length > 100 && (
          <button
            className="read-more"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Show less" : "Read more"}
          </button>
        )}
      </p>

      <div className="event-card-skills">
        <span className="skills-label">Skills needed:</span>
        <div className="skills-list">
          {event.requiredSkills?.slice(0, 3).map((skill, i) => (
            <span key={i} className="skill-chip">
              {skill}
            </span>
          ))}
          {event.requiredSkills?.length > 3 && (
            <span className="skill-chip">
              +{event.requiredSkills.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="event-card-footer">
        <div className="event-date">
          <span className="material-symbols-outlined">calendar_today</span>
          <span>
            {new Date(event.dateStarted || event.date).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            )}
          </span>
        </div>
        <button
          className={`interest-btn ${isInterested ? "interested" : ""} ${error ? "error" : ""}`}
          onClick={handleInterest}
          disabled={isInterested}
        >
          {isInterested ? (
            <>
              <span className="material-symbols-outlined">check</span>
              Request Sent!
            </>
          ) : error ? (
            <>
              <span className="material-symbols-outlined">error</span>
              Try Again
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">
                volunteer_activism
              </span>
              I'm Interested
            </>
          )}
        </button>
      </div>

      <style>{`
        .event-card-component {
          padding: 20px;
          border-radius: 20px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        .event-card-component:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        }

        .event-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .event-category-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .event-category-icon .material-symbols-outlined {
          font-size: 24px;
        }

        .event-category-name {
          font-size: 0.7rem;
          font-weight: 600;
          color: #00677e;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .event-status {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .event-card-title {
          font-family: "Plus Jakarta Sans", sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #161a33;
        }

        .event-card-location {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #00677e;
          margin-bottom: 12px;
        }

        .event-card-location .material-symbols-outlined {
          font-size: 16px;
        }

        .event-card-description {
          font-size: 0.85rem;
          color: #46464d;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .read-more {
          background: none;
          border: none;
          color: #00d2fd;
          font-weight: 600;
          cursor: pointer;
          margin-left: 4px;
        }

        .event-card-skills {
          margin-bottom: 20px;
        }

        .skills-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #8b92b2;
          display: block;
          margin-bottom: 8px;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-chip {
          padding: 4px 10px;
          background: #f4f2ff;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #00677e;
        }

        .event-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(199, 197, 206, 0.2);
        }

        .event-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #8b92b2;
        }

        .event-date .material-symbols-outlined {
          font-size: 14px;
        }

        .interest-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #00677e, #00d2fd);
          border: none;
          border-radius: 40px;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .interest-btn:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 103, 126, 0.3);
        }

        .interest-btn.interested {
          background: #2ecc71;
        }

        .interest-btn.error {
          background: #e74c3c;
        }

        .interest-btn:disabled {
          cursor: default;
        }

        .interest-btn .material-symbols-outlined {
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default EventCard;
