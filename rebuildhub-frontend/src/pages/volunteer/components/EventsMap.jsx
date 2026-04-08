// src/pages/volunteer/components/EventsMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons for different disaster types with unique icons
const getMarkerIcon = (category) => {
  const disasterIcons = {
    Floods: "🌊",
    Earthquake: "🏔️",
    Cyclone: "🌀",
    Landslide: "⛰️",
    Tsunami: "🌊",
    Wildfire: "🔥",
    Drought: "💧",
    Storm: "⛈️",
    Volcano: "🌋",
    "Severe Storms": "⚡",
  };

  const colors = {
    Floods: "#3b82f6",
    Earthquake: "#ef4444",
    Cyclone: "#8b5cf6",
    Landslide: "#f59e0b",
    Tsunami: "#06b6d4",
    Wildfire: "#ea580c",
    Drought: "#d97706",
    Storm: "#6366f1",
    Volcano: "#dc2626",
    "Severe Storms": "#4f46e5",
  };

  const icon = disasterIcons[category] || "⚠️";
  const color = colors[category] || "#00677e";

  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      border: 2px solid white;
      font-size: 20px;
    ">
      ${icon}
    </div>`,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Component to fit map bounds to events
const FitBounds = ({ events }) => {
  const map = useMap();

  useEffect(() => {
    if (events && events.length > 0) {
      const validCoordinates = events
        .map((event) => {
          const coords =
            event.location?.coordinates ||
            event.geometry?.[0]?.coordinates ||
            (event.lat && event.lng ? [event.lng, event.lat] : null);
          return coords && coords[0] && coords[1]
            ? [coords[1], coords[0]]
            : null;
        })
        .filter((coord) => coord !== null);

      if (validCoordinates.length > 0) {
        const bounds = L.latLngBounds(validCoordinates);
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        map.setView([7.8731, 80.7718], 7);
      }
    } else {
      map.setView([7.8731, 80.7718], 7);
    }
  }, [events, map]);

  return null;
};

const EventsMap = ({ events, onEventSelect }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Get coordinates from event
  const getEventCoordinates = (event) => {
    if (event.location?.coordinates) {
      return [event.location.coordinates[1], event.location.coordinates[0]];
    }
    if (event.geometry?.[0]?.coordinates) {
      return [
        event.geometry[0].coordinates[1],
        event.geometry[0].coordinates[0],
      ];
    }
    if (event.lat && event.lng) {
      return [event.lat, event.lng];
    }
    if (event.latitude && event.longitude) {
      return [event.latitude, event.longitude];
    }
    return null;
  };

  const handleMarkerClick = (event) => {
    setSelectedEvent(event);
    if (onEventSelect) onEventSelect(event);
  };

  const handleInterest = async (eventId) => {
    if (onEventSelect) {
      // This will trigger the parent's handleInterest function
      onEventSelect({ ...selectedEvent, expressInterest: true });
    }
    setSelectedEvent(null);
  };

  // Filter events with valid coordinates
  const eventsWithCoordinates = events.filter(
    (event) => getEventCoordinates(event) !== null,
  );

  return (
    <div className="events-map-wrapper">
      <div className="map-header">
        <h3>
          <span className="material-symbols-outlined">map</span>
          Disaster Event Locations
        </h3>
        <p>{eventsWithCoordinates.length} events shown on map</p>
      </div>

      <div className="map-container">
        <MapContainer
          center={[7.8731, 80.7718]}
          zoom={7}
          style={{ height: "450px", width: "100%", borderRadius: "20px" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <FitBounds events={eventsWithCoordinates} />

          {eventsWithCoordinates.map((event, idx) => {
            const coordinates = getEventCoordinates(event);
            if (!coordinates) return null;

            return (
              <Marker
                key={event._id || event.nasaEventId || idx}
                position={coordinates}
                icon={getMarkerIcon(event.category)}
                eventHandlers={{
                  click: () => handleMarkerClick(event),
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <div className="popup-category">
                      {event.category || "Disaster"}
                    </div>
                    <h4>{event.title}</h4>
                    <p>{event.description?.substring(0, 100)}...</p>
                    <div className="popup-location">
                      <span className="material-symbols-outlined">
                        location_on
                      </span>
                      {event.districts?.join(", ") ||
                        event.countries?.join(", ") ||
                        "Location TBD"}
                    </div>
                    <button
                      className="popup-button"
                      onClick={() => handleMarkerClick(event)}
                    >
                      View Details →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Selected Event Details Sidebar */}
      {selectedEvent && (
        <div className="selected-event-sidebar glass">
          <button
            className="close-sidebar"
            onClick={() => setSelectedEvent(null)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="event-detail">
            <span className="event-category-badge">
              {selectedEvent.category}
            </span>
            <h4>{selectedEvent.title}</h4>
            <p className="event-description">{selectedEvent.description}</p>
            <div className="event-meta">
              <div className="meta-item">
                <span className="material-symbols-outlined">location_on</span>
                <span>
                  {selectedEvent.districts?.join(", ") ||
                    selectedEvent.countries?.join(", ") ||
                    "Location TBD"}
                </span>
              </div>
              <div className="meta-item">
                <span className="material-symbols-outlined">groups</span>
                <span>
                  Required:{" "}
                  {selectedEvent.requiredSkills?.slice(0, 3).join(", ")}
                </span>
              </div>
              <div className="meta-item">
                <span className="material-symbols-outlined">
                  calendar_today
                </span>
                <span>
                  {new Date(
                    selectedEvent.dateStarted || selectedEvent.date,
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="event-skills">
              {selectedEvent.requiredSkills?.map((skill, i) => (
                <span key={i} className="skill-badge">
                  {skill}
                </span>
              ))}
            </div>
            <button
              className="interest-button"
              onClick={() =>
                handleInterest(selectedEvent._id || selectedEvent.nasaEventId)
              }
            >
              I'm Interested →
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .events-map-wrapper {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: 24px;
          border: 1px solid rgba(199, 197, 206, 0.1);
        }

        .map-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(199, 197, 206, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .map-header h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: "Plus Jakarta Sans", sans-serif;
          font-size: 1.25rem;
        }

        .map-container {
          padding: 16px;
        }

        .map-container .leaflet-container {
          border-radius: 20px;
          z-index: 1;
        }

        /* Popup Styles */
        .map-popup {
          min-width: 200px;
          max-width: 260px;
          padding: 4px;
        }

        .popup-category {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(0, 210, 253, 0.15);
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #00677e;
          margin-bottom: 8px;
        }

        .map-popup h4 {
          font-size: 0.9rem;
          margin-bottom: 6px;
          color: #161a33;
        }

        .map-popup p {
          font-size: 0.75rem;
          color: #46464d;
          margin-bottom: 8px;
        }

        .popup-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          color: #00677e;
          margin-bottom: 10px;
        }

        .popup-location .material-symbols-outlined {
          font-size: 14px;
        }

        .popup-button {
          width: 100%;
          padding: 6px 12px;
          background: linear-gradient(135deg, #00677e, #00d2fd);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
        }

        /* Selected Event Sidebar */
        .selected-event-sidebar {
          position: fixed;
          right: 24px;
          bottom: 24px;
          width: 340px;
          max-width: calc(100% - 48px);
          padding: 24px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          animation: slideInRight 0.3s ease;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .close-sidebar {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: #8b92b2;
        }

        .event-category-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #00d2fd;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          color: white;
          margin-bottom: 12px;
        }

        .selected-event-sidebar h4 {
          font-size: 1.2rem;
          margin-bottom: 12px;
          color: #161a33;
        }

        .event-description {
          font-size: 0.85rem;
          color: #46464d;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #46464d;
        }

        .meta-item .material-symbols-outlined {
          font-size: 18px;
          color: #00677e;
        }

        .event-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .skill-badge {
          padding: 4px 10px;
          background: #f4f2ff;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #00677e;
        }

        .interest-button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #00677e, #00d2fd);
          border: none;
          border-radius: 16px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .interest-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 103, 126, 0.3);
        }

        @media (max-width: 768px) {
          .selected-event-sidebar {
            left: 16px;
            right: 16px;
            bottom: 16px;
            width: auto;
          }

          .map-container {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default EventsMap;
