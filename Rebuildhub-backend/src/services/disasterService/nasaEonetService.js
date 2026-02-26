const axios = require("axios");

// Sri Lanka bounding box
const SRI_LANKA_BOUNDS = {
  minLat: 5.9,
  maxLat: 9.9,
  minLng: 79.5,
  maxLng: 81.9,
};

const isWithinSriLanka = (lat, lng) => {
  return (
    lat >= SRI_LANKA_BOUNDS.minLat &&
    lat <= SRI_LANKA_BOUNDS.maxLat &&
    lng >= SRI_LANKA_BOUNDS.minLng &&
    lng <= SRI_LANKA_BOUNDS.maxLng
  );
};

exports.getSriLankaDisastersFromNASA = async () => {
  try {
    const response = await axios.get(
      "https://eonet.gsfc.nasa.gov/api/v3/events",
      {
        headers: {
          "User-Agent": "RebuildHub-Backend",
        },
      }
    );

    const events = response.data.events;

    //Showing worldwide disasters
    //return events;

    // 🔥 Filter disasters inside Sri Lanka only
    const sriLankaEvents = events.filter((event) => {
      if (!event.geometry || event.geometry.length === 0) return false;

      // Get latest coordinates of event
      const latestGeometry = event.geometry[event.geometry.length - 1];

      if (!latestGeometry.coordinates) return false;

      const [lng, lat] = latestGeometry.coordinates;

      return isWithinSriLanka(lat, lng);
    });

    return sriLankaEvents;
  } catch (error) {
    console.error("NASA API Error:", error.message);
    throw new Error("Failed to fetch NASA disaster data");
  }
};