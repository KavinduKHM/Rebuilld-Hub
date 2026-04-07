import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons for React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const defaultCenter = [6.9271, 79.8612]; // Sri Lanka center

// Helper component to handle map movement
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

const LocationMapEvents = ({ onChange }) => {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;

      // Reverse geocode using Nominatim (free, no API key needed)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        const locationName = data.address?.name || data.display_name || "";
        onChange({
          name: locationName.substring(0, 100),
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        });
      } catch (err) {
        // Fallback if reverse geocoding fails
        onChange({
          name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        });
      }
    },
  });

  return null;
};

const LocationMapPicker = ({ location, onChange }) => {
  const [center, setCenter] = useState(defaultCenter);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`
      );
      const data = await res.json();
      setSearchResults(data || []);
      setShowResults(true);

      // Move map to first result and show it
      if (data && data.length > 0) {
        const firstResult = data[0];
        const lat = Number(firstResult.lat);
        const lng = Number(firstResult.lon);
        setCenter([lat, lng]);
      }
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectResult = (result) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    setCenter([lat, lng]);
    onChange({
      name: result.display_name.substring(0, 100),
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    });
    setSearchQuery("");
    setShowResults(false);
  };

  useEffect(() => {
    if (location.latitude && location.longitude) {
      const lat = Number(location.latitude);
      const lng = Number(location.longitude);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        setCenter([lat, lng]);
      }
      return;
    }

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter([latitude, longitude]);
        },
        () => {
          setCenter(defaultCenter);
        }
      );
    }
  }, [location.latitude, location.longitude]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.helper}>
        Click on the map or search by location name to set the disaster location.
      </div>

      {/* Search Box */}
      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Search for location..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={styles.searchInput}
          onFocus={() => searchQuery && setShowResults(true)}
        />
        {searchLoading && <div style={styles.loadingText}>Searching...</div>}

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div style={styles.resultsDropdown}>
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                style={styles.resultItem}
                onClick={() => handleSelectResult(result)}
              >
                <div style={styles.resultName}>{result.display_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "320px", borderRadius: "16px", overflow: "hidden" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} />
        <LocationMapEvents onChange={onChange} />

        {/* Show search result markers (preview) */}
        {searchResults.length > 0 &&
          searchResults.map((result, idx) => (
            <Marker
              key={`search-${idx}`}
              position={[Number(result.lat), Number(result.lon)]}
              opacity={0.6}
            >
              <Popup>{result.display_name}</Popup>
            </Marker>
          ))}

        {/* Show selected location marker (permanent) */}
        {location.latitude && location.longitude && (
          <Marker position={[Number(location.latitude), Number(location.longitude)]}>
            <Popup>{location.name}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  helper: {
    color: "#cbd5e1",
    fontSize: "0.95rem",
  },
  searchBox: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  searchInput: {
    padding: "0.6rem 0.9rem",
    borderRadius: "8px",
    border: "1px solid #374151",
    background: "#1f2937",
    color: "#e5e7eb",
    fontSize: "0.95rem",
    outline: "none",
  },
  resultsDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "8px",
    marginTop: "4px",
    maxHeight: "250px",
    overflowY: "auto",
    zIndex: 10,
  },
  resultItem: {
    padding: "0.6rem 0.9rem",
    borderBottom: "1px solid #374151",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  resultName: {
    color: "#e5e7eb",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    marginTop: "0.3rem",
  },
};

export default LocationMapPicker;
