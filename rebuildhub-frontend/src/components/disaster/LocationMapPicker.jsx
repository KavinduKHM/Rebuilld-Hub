import React, { useEffect, useRef, useState } from "react";
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
const sriLankaBounds = {
  minLat: 5.7,
  maxLat: 10.1,
  minLng: 79.4,
  maxLng: 82.1,
};

const isInSriLankaBounds = (lat, lng) => (
  lat >= sriLankaBounds.minLat
  && lat <= sriLankaBounds.maxLat
  && lng >= sriLankaBounds.minLng
  && lng <= sriLankaBounds.maxLng
);

const sriLankaLocalFallback = [
  { lat: 6.9271, lon: 79.8612, display_name: "Colombo, Sri Lanka" },
  { lat: 6.0535, lon: 80.221, display_name: "Galle, Sri Lanka" },
  { lat: 7.2906, lon: 80.6337, display_name: "Kandy, Sri Lanka" },
  { lat: 9.6615, lon: 80.0255, display_name: "Jaffna, Sri Lanka" },
  { lat: 8.3114, lon: 80.4037, display_name: "Anuradhapura, Sri Lanka" },
  { lat: 8.5874, lon: 81.2152, display_name: "Trincomalee, Sri Lanka" },
  { lat: 6.0328, lon: 80.2168, display_name: "Matara, Sri Lanka" },
  { lat: 7.2083, lon: 79.8358, display_name: "Negombo, Sri Lanka" },
  { lat: 6.9497, lon: 80.7891, display_name: "Nuwara Eliya, Sri Lanka" },
  { lat: 6.715, lon: 80.3847, display_name: "Ratnapura, Sri Lanka" },
  { lat: 7.4863, lon: 80.3647, display_name: "Kurunegala, Sri Lanka" },
  { lat: 6.8721, lon: 81.3507, display_name: "Monaragala, Sri Lanka" },
  { lat: 7.717, lon: 81.7005, display_name: "Batticaloa, Sri Lanka" },
  { lat: 7.9403, lon: 81.0188, display_name: "Polonnaruwa, Sri Lanka" },
  { lat: 7.5765, lon: 79.7957, display_name: "Puttalam, Sri Lanka" },
];

const searchLocalFallback = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }

  return sriLankaLocalFallback
    .filter((item) => item.display_name.toLowerCase().includes(q))
    .slice(0, 5);
};

const getNearestFallbackPlaceName = (lat, lng) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || sriLankaLocalFallback.length === 0) {
    return "Selected location";
  }

  let nearest = sriLankaLocalFallback[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  sriLankaLocalFallback.forEach((place) => {
    const dLat = place.lat - lat;
    const dLng = place.lon - lng;
    const dist = (dLat * dLat) + (dLng * dLng);
    if (dist < bestDistance) {
      bestDistance = dist;
      nearest = place;
    }
  });

  return formatSearchLocationName(nearest.display_name) || "Selected location";
};

const formatSearchLocationName = (displayName) => {
  if (!displayName) {
    return "";
  }

  const parts = displayName
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]}, ${parts[1]}`.substring(0, 100);
  }

  return displayName.substring(0, 100);
};

const searchNominatim = async (query, signal) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      `${query}, Sri Lanka`
    )}&limit=5&countrycodes=lk&addressdetails=1`,
    { signal }
  );
  if (!res.ok) {
    throw new Error(`Nominatim search failed: ${res.status}`);
  }
  const data = await res.json();

  return (data || [])
    .map((item) => ({
      lat: Number(item?.lat),
      lon: Number(item?.lon),
      display_name: item?.display_name || "",
    }))
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lon))
    .filter((item) => isInSriLankaBounds(item.lat, item.lon));
};

const searchPhotonFallback = async (query, signal) => {
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(`${query} Sri Lanka`)}&limit=5`,
    { signal }
  );
  if (!res.ok) {
    throw new Error(`Photon search failed: ${res.status}`);
  }
  const data = await res.json();

  return (data?.features || [])
    .map((feature) => {
      const coords = feature?.geometry?.coordinates || [];
      const lon = Number(coords[0]);
      const lat = Number(coords[1]);
      const name = [
        feature?.properties?.name,
        feature?.properties?.city,
        feature?.properties?.state,
        feature?.properties?.country,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        lat,
        lon,
        display_name: name || "Sri Lanka location",
      };
    })
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lon))
    .filter((item) => isInSriLankaBounds(item.lat, item.lon));
};

// Helper component to handle map movement
const MapController = ({ center, jumpToken }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 0.8 });
  }, [center, jumpToken, map]);
  return null;
};

const LocationMapEvents = ({ onChange, onUserInteract }) => {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onUserInteract();

      // Reverse geocode using Nominatim (free, no API key needed)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        const locationName = data.address?.city
          || data.address?.town
          || data.address?.village
          || data.address?.suburb
          || data.address?.county
          || data.address?.state_district
          || data.address?.state
          || data.address?.name
          || data.display_name
          || "";

        const safeName = locationName
          ? locationName.substring(0, 100)
          : getNearestFallbackPlaceName(lat, lng);

        onChange({
          name: safeName,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        });
      } catch (err) {
        // Fallback if reverse geocoding fails: keep a place name, never raw coordinates.
        onChange({
          name: getNearestFallbackPlaceName(lat, lng),
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
  const [jumpToken, setJumpToken] = useState(0);
  const latestSearchIdRef = useRef(0);
  const userInteractedRef = useRef(false);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const searchCacheRef = useRef(new Map());

  const markUserInteracted = () => {
    userInteractedRef.current = true;
  };

  const applySelectedLocation = (result) => {
    if (!result) {
      return;
    }

    const lat = Number(result.lat);
    const lng = Number(result.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    const name = formatSearchLocationName(result.display_name);
    markUserInteracted();
    setCenter([lat, lng]);
    setJumpToken((prev) => prev + 1);
    onChange({
      name,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    });
  };

  const jumpToFirstResult = (results) => {
    if (!results || results.length === 0) {
      return;
    }

    applySelectedLocation(results[0]);
  };

  const runSearch = async (query) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      setSearchResults([]);
      setShowResults(false);
      setSearchLoading(false);
      return;
    }

    const searchId = latestSearchIdRef.current + 1;
    latestSearchIdRef.current = searchId;

    if (searchCacheRef.current.has(normalizedQuery)) {
      const cached = searchCacheRef.current.get(normalizedQuery);
      setSearchResults(cached);
      setShowResults(true);
      jumpToFirstResult(cached);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSearchLoading(true);
    try {
      let sriLankaOnly = await searchNominatim(normalizedQuery, controller.signal);

      // Fallback provider if primary service is rate-limited/empty.
      if (sriLankaOnly.length === 0) {
        sriLankaOnly = await searchPhotonFallback(normalizedQuery, controller.signal);
      }

      // Final local fallback for reliability when external providers fail/throttle.
      if (sriLankaOnly.length === 0) {
        sriLankaOnly = searchLocalFallback(normalizedQuery);
      }

      // Ignore stale responses from older keystrokes.
      if (searchId !== latestSearchIdRef.current) {
        return;
      }

      searchCacheRef.current.set(normalizedQuery, sriLankaOnly);
      setSearchResults(sriLankaOnly);
      setShowResults(true);
      jumpToFirstResult(sriLankaOnly);
    } catch (err) {
      if (err?.name === "AbortError") {
        return;
      }
      if (searchId === latestSearchIdRef.current) {
        const localResults = searchLocalFallback(normalizedQuery);
        setSearchResults(localResults);
        setShowResults(localResults.length > 0);
        jumpToFirstResult(localResults);
      }
    } finally {
      if (searchId === latestSearchIdRef.current) {
        setSearchLoading(false);
      }
    }
  };

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setShowResults(false);
      setSearchLoading(false);
      return;
    }

    // Ignore very short inputs to cut request volume and avoid provider throttling.
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setSearchLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      runSearch(query);
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const handleSelectResult = (result) => {
    applySelectedLocation(result);
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
          if (userInteractedRef.current) {
            return;
          }
          const { latitude, longitude } = position.coords;
          setCenter([latitude, longitude]);
        },
        () => {
          if (!userInteractedRef.current) {
            setCenter(defaultCenter);
          }
        }
      );
    }
  }, [location.latitude, location.longitude]);

  return (
    <div className="map-picker">
      <div className="map-picker__header">
        
        <span className={location.latitude && location.longitude ? "map-picker__status map-picker__status--set" : "map-picker__status"}>
          {location.latitude && location.longitude ? "Location locked" : "No location set"}
        </span>
      </div>

      {/* Search Box */}
      <div className="map-picker__search">
        <input
          type="text"
          placeholder="Search Sri Lanka location..."
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            if (value.trim()) {
              markUserInteracted();
            }
            setSearchQuery(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (searchResults.length > 0) {
                handleSelectResult(searchResults[0]);
              } else if (searchQuery.trim().length >= 2) {
                runSearch(searchQuery.trim());
              }
            }
          }}
          className="map-picker__input"
          onFocus={() => searchQuery && setShowResults(true)}
        />
        {searchLoading && <div className="map-picker__loading">Searching...</div>}

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="map-picker__results">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                type="button"
                className="map-picker__result"
                onClick={() => handleSelectResult(result)}
              >
                <span className="map-picker__result-name">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={13}
        className="map-picker__map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} jumpToken={jumpToken} />
        <LocationMapEvents onChange={onChange} onUserInteract={markUserInteracted} />

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

export default LocationMapPicker;
