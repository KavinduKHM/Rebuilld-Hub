import eventService from "../../services/eventService/eventService.js";
import Volunteer from "../../models/volunteerModel/volunteerModel.js";
import Event from "../../models/eventModel/eventModel.js";

// Fetch and store events from NASA
export const fetchAndStoreEvents = async (req, res) => {
  try {
    const { location = "worldwide", category = "all" } = req.query;

    const result = await eventService.fetchAndStoreEvents(location, category);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        total: result.total,
        new: result.new,
        updated: result.updated,
        location: result.location,
        categories: result.categories,
      },
    });
  } catch (error) {
    console.error("❌ Error in fetchAndStoreEvents:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get events for volunteers - FIXED VERSION
export const getEvents = async (req, res) => {
  try {
    const volunteerId = req.user?.id; // If you have authentication
    const {
      location = "worldwide",
      category,
      days = 30,
      limit = 50,
    } = req.query;

    console.log(`📊 Getting events with filters:`, {
      location,
      category,
      days,
      limit,
    });

    // Build query directly here instead of using service
    let query = { status: "ACTIVE" };

    // Location filter
    if (location === "srilanka") {
      query.countries = "Sri Lanka";
    }

    // Category filter - Case insensitive
    if (category) {
      query.$or = [
        { categoryId: new RegExp(`^${String(category)}$`, "i") },
        { category: new RegExp(`^${String(category)}$`, "i") },
      ];
      console.log(`🔍 Searching for category: ${String(category)}`);
    }

    // Date filter
    if (days && !isNaN(parseInt(days))) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
      query.dateStarted = { $gte: cutoffDate };
      console.log(`📅 Filtering events since: ${cutoffDate.toISOString()}`);
    }

    console.log("📊 Final query:", JSON.stringify(query, null, 2));

    // Execute query
    const events = await Event.find(query)
      .sort({ dateStarted: -1 })
      .limit(parseInt(limit));

    console.log(`📊 Found ${events.length} events matching criteria`);

    res.status(200).json({
      success: true,
      count: events.length,
      location: location,
      category: category || "all",
      data: events,
    });
  } catch (error) {
    console.error("❌ Error in getEvents:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("❌ Error in getEventById:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Volunteer expresses interest in an event
export const expressInterest = async (req, res) => {
  try {
    // Check if volunteer exists and is verified
    const volunteer = await Volunteer.findOne({
      user: req.user?.id,
      verificationStatus: "VERIFIED",
      availability: "AVAILABLE",
    });

    if (!volunteer) {
      return res.status(403).json({
        success: false,
        message: "Only verified and available volunteers can express interest",
      });
    }

    const result = await eventService.expressInterest(
      req.params.id,
      volunteer._id,
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("❌ Error in expressInterest:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get event categories
export const getCategories = async (req, res) => {
  try {
    const categories = [
      { id: "wildfires", name: "Wildfires" },
      { id: "severeStorms", name: "Severe Storms" },
      { id: "volcanoes", name: "Volcanoes" },
      { id: "floods", name: "Floods" },
      { id: "earthquakes", name: "Earthquakes" },
      { id: "landslides", name: "Landslides" },
      { id: "drought", name: "Drought" },
      { id: "seaLakeIce", name: "Sea and Lake Ice" },
    ];

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("❌ Error in getCategories:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get live events directly from NASA EONET (no DB write)
export const getLiveEvents = async (req, res) => {
  try {
    const {
      location = "worldwide",
      category = "all",
      days = 30,
      limit = 100,
    } = req.query;

    const result = await eventService.fetchLiveEvents({
      location,
      category,
      days,
      limit,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error in getLiveEvents:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Live Sri Lanka events shortcut endpoint
export const getLiveSriLankaEvents = async (req, res) => {
  try {
    const { category = "all", days = 30, limit = 100 } = req.query;

    const result = await eventService.fetchLiveEvents({
      location: "srilanka",
      category,
      days,
      limit,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error in getLiveSriLankaEvents:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Live events as GeoJSON for map rendering
export const getLiveEventsMap = async (req, res) => {
  try {
    const {
      location = "worldwide",
      category = "all",
      days = 30,
      limit = 200,
    } = req.query;

    const result = await eventService.fetchLiveEvents({
      location,
      category,
      days,
      limit,
    });

    res.status(200).json({
      success: true,
      source: result.source,
      location: result.location,
      category: result.category,
      count: result.count,
      geojson: eventService.toGeoJSON(result.data),
    });
  } catch (error) {
    console.error("❌ Error in getLiveEventsMap:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Server-rendered map viewer (no frontend folder/files)
export const getLiveEventsMapViewer = async (req, res) => {
  const { location = "worldwide", category = "all", days = 30, limit = 200 } =
    req.query;

  const mapApiUrl =
    `/api/events/live/map?location=${encodeURIComponent(location)}` +
    `&category=${encodeURIComponent(category)}` +
    `&days=${encodeURIComponent(days)}` +
    `&limit=${encodeURIComponent(limit)}`;

  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RebuildHub Live Disaster Map</title>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
  <style>
    html, body { margin: 0; height: 100%; }
    #map { height: 100vh; width: 100%; }
    .info {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.95);
      padding: 10px 12px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      font-size: 14px;
      line-height: 1.4;
    }
    .error {
      color: #b00020;
      margin-top: 6px;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="info">
    <div><strong>RebuildHub Live Map</strong></div>
    <div id="meta">Loading live NASA EONET data...</div>
    <div id="error" class="error"></div>
  </div>
  <div id="map"></div>

  <script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""
  ></script>
  <script>
    const map = L.map("map").setView([20, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const metaEl = document.getElementById("meta");
    const errEl = document.getElementById("error");

    function formatDate(value) {
      if (!value) return "-";
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
    }

    async function loadMapData() {
      try {
        const response = await fetch(${JSON.stringify(mapApiUrl)});
        const payload = await response.json();

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to load map data");
        }

        const geo = payload.geojson || { type: "FeatureCollection", features: [] };
        const layer = L.geoJSON(geo, {
          pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
            radius: 6,
            color: "#e53935",
            weight: 1,
            fillColor: "#ef5350",
            fillOpacity: 0.75,
          }),
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(
              '<strong>' + (p.title || "Unknown Event") + '</strong><br/>' +
              'Category: ' + (p.category || "-") + '<br/>' +
              'Status: ' + (p.status || "-") + '<br/>' +
              'Started: ' + formatDate(p.dateStarted)
            );
          }
        }).addTo(map);

        const count = Array.isArray(geo.features) ? geo.features.length : 0;
        metaEl.textContent =
          'Location: ' + (payload.location || '-') +
          ' | Category: ' + (payload.category || '-') +
          ' | Live points: ' + count;

        if (count > 0) {
          map.fitBounds(layer.getBounds(), { padding: [20, 20] });
        }
      } catch (error) {
        errEl.textContent = error.message || String(error);
        metaEl.textContent = "Could not load live map data.";
      }
    }

    loadMapData();
  </script>
</body>
</html>`);
};
