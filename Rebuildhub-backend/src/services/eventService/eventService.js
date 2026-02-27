import axios from "axios";
import Event from "../../models/eventModel/eventModel.js";

class EventService {
  constructor() {
    this.baseURL = "https://eonet.gsfc.nasa.gov/api/v3";
    this.categories = {
      wildfires: "wildfires",
      severeStorms: "severeStorms",
      volcanoes: "volcanoes",
      seaLakeIce: "seaLakeIce",
      drought: "drought",
      floods: "floods",
      landslides: "landslides",
      earthquakes: "earthquakes",
      manmade: "manmade",
      snow: "snow",
      temperatureExtremes: "temperatureExtremes",
      waterColor: "waterColor",
    };
    this.defaultCategories = [
      "wildfires",
      "severeStorms",
      "volcanoes",
      "floods",
      "earthquakes",
      "landslides",
      "drought",
    ];
  }

  normalizeCategory(category) {
    if (!category) return null;
    const normalized = String(category).trim().toLowerCase();
    return this.categories[normalized] ? normalized : null;
  }

  buildLocationParams(location = "worldwide") {
    const params = {};

    if (location === "srilanka") {
      params.bbox = "79.6,5.8,81.9,9.8";
    } else if (location && location.includes(",")) {
      params.bbox = location;
    }

    return params;
  }

  buildDateParams(days) {
    const parsedDays = Number(days);
    if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
      return {};
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parsedDays);

    return {
      startDate: startDate.toISOString().slice(0, 10),
    };
  }

  // Fetch events with optional filters
  async fetchEvents(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add date range if provided
      if (params.startDate) queryParams.append("start", params.startDate);
      if (params.endDate) queryParams.append("end", params.endDate);

      // Add category filter
      if (params.category) queryParams.append("category", params.category);

      // Add status filter
      if (params.status) queryParams.append("status", params.status);

      // Add location filter (worldwide by default)
      // For Sri Lanka: bbox=79.6,5.8,81.9,9.8
      if (params.bbox) {
        queryParams.append("bbox", params.bbox);
      }

      const url = `${this.baseURL}/events${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
      console.log("📡 Fetching from NASA EONET:", url);

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          Accept: "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("❌ Error fetching from NASA:", error.message);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  // Fetch and store events in database
  async fetchAndStoreEvents(location = "worldwide", category = "all") {
    try {
      let params = {};

      // Set bbox based on location
      if (location === "srilanka") {
        // Sri Lanka bounding box
        params.bbox = "79.6,5.8,81.9,9.8";
        console.log("📍 Filtering for Sri Lanka events");
      } else if (location === "worldwide") {
        console.log("🌍 Fetching worldwide events");
        // No bbox = worldwide
      } else if (location.includes(",")) {
        // Custom bbox provided
        params.bbox = location;
      }

      const selectedCategory = this.normalizeCategory(category);
      const categoriesToFetch = selectedCategory
        ? [selectedCategory]
        : this.defaultCategories;

      const eventMap = new Map();

      for (const categoryKey of categoriesToFetch) {
        const data = await this.fetchEvents({
          ...params,
          category: categoryKey,
        });

        if (!data || !Array.isArray(data.events)) {
          continue;
        }

        console.log(
          `📊 Received ${data.events.length} ${categoryKey} events from NASA`,
        );

        for (const nasaEvent of data.events) {
          if (!eventMap.has(nasaEvent.id)) {
            eventMap.set(nasaEvent.id, nasaEvent);
          }
        }
      }

      const nasaEvents = Array.from(eventMap.values());

      if (nasaEvents.length === 0) {
        throw new Error("No events data received from NASA");
      }

      console.log(`📊 Processing ${nasaEvents.length} unique events`);

      let newCount = 0;
      let updatedCount = 0;

      for (const nasaEvent of nasaEvents) {
        // Process each event
        const existingEvent = await Event.findOne({
          nasaEventId: nasaEvent.id,
        });

        const eventData = this.parseEventData(nasaEvent, location);

        if (existingEvent) {
          // Update existing event
          await Event.findOneAndUpdate(
            { nasaEventId: nasaEvent.id },
            eventData,
            { new: true },
          );
          updatedCount++;
        } else {
          // Create new event
          await Event.create(eventData);
          newCount++;
        }
      }

      return {
        success: true,
        message: `Fetched ${nasaEvents.length} events across ${categoriesToFetch.length} categories. New: ${newCount}, Updated: ${updatedCount}`,
        total: nasaEvents.length,
        new: newCount,
        updated: updatedCount,
        location: location,
        categories: categoriesToFetch,
      };
    } catch (error) {
      console.error("❌ Error in fetchAndStoreEvents:", error);
      throw error;
    }
  }

  // Parse NASA event data to our schema
  parseEventData(nasaEvent, location) {
    // Extract country information from geometry/title
    let countries = [];
    let districts = [];

    // Check if event is in Sri Lanka
    const isSriLanka =
      location === "srilanka" ||
      (nasaEvent.title && nasaEvent.title.toLowerCase().includes("sri lanka"));

    if (isSriLanka) {
      countries = ["Sri Lanka"];
      // You can add district mapping logic here
      districts = this.extractSriLankaDistricts(nasaEvent);
    }

    const normalizedGeometry = this.normalizeGeometry(nasaEvent.geometry);

    // Get the latest geometry for coordinates
    const latestGeo =
      normalizedGeometry && normalizedGeometry.length > 0
        ? normalizedGeometry[normalizedGeometry.length - 1]
        : null;

    // Extract coordinates
    let coordinates = [0, 0];
    if (latestGeo && latestGeo.coordinates) {
      if (latestGeo.type === "Point") {
        coordinates = latestGeo.coordinates;
      } else if (
        latestGeo.type === "Polygon" ||
        latestGeo.type === "MultiPolygon"
      ) {
        // Use first coordinate for center point
        coordinates = latestGeo.coordinates[0][0] || [0, 0];
      }
    }

    // Get magnitude
    let magnitude = 0;
    let magnitudeUnit = "";
    if (nasaEvent.magnitudes && nasaEvent.magnitudes.length > 0) {
      magnitude = nasaEvent.magnitudes[0].value || 0;
      magnitudeUnit = nasaEvent.magnitudes[0].unit || "";
    }

    return {
      nasaEventId: nasaEvent.id,
      title: nasaEvent.title,
      description: nasaEvent.description || "",
      category: nasaEvent.categories[0]?.title || "Unknown",
      categoryId: nasaEvent.categories[0]?.id || "",
      location: {
        type: "Point",
        coordinates: coordinates,
      },
      countries: countries,
      districts: districts,
      magnitude: magnitude,
      magnitudeUnit: magnitudeUnit,
      status: nasaEvent.status || "ACTIVE",
      dateStarted: normalizedGeometry[0]?.date || new Date(),
      dateEnded: normalizedGeometry[normalizedGeometry.length - 1]?.date,
      sources: nasaEvent.sources || [],
      geometry: normalizedGeometry,
      requiredSkills: this.getRequiredSkills(
        nasaEvent.categories[0]?.title || "",
      ),
    };
  }

  normalizeGeometry(geometry) {
    if (!geometry) return [];

    let parsedGeometry = geometry;

    if (typeof geometry === "string") {
      try {
        parsedGeometry = JSON.parse(geometry);
      } catch {
        return [];
      }
    }

    if (!Array.isArray(parsedGeometry)) {
      return [];
    }

    return parsedGeometry
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        date: item.date ? new Date(item.date) : undefined,
        type: typeof item.type === "string" ? item.type : undefined,
        coordinates: item.coordinates,
        magnitudeValue:
          typeof item.magnitudeValue === "number"
            ? item.magnitudeValue
            : undefined,
        magnitudeUnit:
          typeof item.magnitudeUnit === "string"
            ? item.magnitudeUnit
            : undefined,
      }));
  }

  buildLiveEvent(nasaEvent, location = "worldwide") {
    const parsed = this.parseEventData(nasaEvent, location);

    return {
      id: nasaEvent.id,
      title: parsed.title,
      description: parsed.description,
      category: parsed.category,
      categoryId: parsed.categoryId,
      status: parsed.status,
      location: parsed.location,
      countries: parsed.countries,
      districts: parsed.districts,
      magnitude: parsed.magnitude,
      magnitudeUnit: parsed.magnitudeUnit,
      dateStarted: parsed.dateStarted,
      dateEnded: parsed.dateEnded,
      sources: parsed.sources,
      geometry: parsed.geometry,
      requiredSkills: parsed.requiredSkills,
    };
  }

  toGeoJSON(events = []) {
    return {
      type: "FeatureCollection",
      features: events
        .filter(
          (event) =>
            event?.location?.type === "Point" &&
            Array.isArray(event?.location?.coordinates) &&
            event.location.coordinates.length >= 2,
        )
        .map((event) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: event.location.coordinates,
          },
          properties: {
            id: event.id,
            title: event.title,
            category: event.category,
            categoryId: event.categoryId,
            status: event.status,
            magnitude: event.magnitude,
            magnitudeUnit: event.magnitudeUnit,
            dateStarted: event.dateStarted,
            dateEnded: event.dateEnded,
          },
        })),
    };
  }

  async fetchLiveEvents(filters = {}) {
    const {
      location = "worldwide",
      category = "all",
      days,
      limit = 100,
    } = filters;

    const baseParams = {
      ...this.buildLocationParams(location),
      ...this.buildDateParams(days),
    };

    const selectedCategory = this.normalizeCategory(category);
    const categoriesToFetch = selectedCategory
      ? [selectedCategory]
      : this.defaultCategories;

    const responses = await Promise.all(
      categoriesToFetch.map((categoryKey) =>
        this.fetchEvents({
          ...baseParams,
          category: categoryKey,
          status: "open",
        }).catch((error) => {
          console.error(`❌ Failed category ${categoryKey}:`, error.message);
          return { events: [] };
        }),
      ),
    );

    const eventMap = new Map();
    for (const response of responses) {
      const events = Array.isArray(response?.events) ? response.events : [];
      for (const nasaEvent of events) {
        if (!eventMap.has(nasaEvent.id)) {
          eventMap.set(nasaEvent.id, this.buildLiveEvent(nasaEvent, location));
        }
      }
    }

    const parsedLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
    const liveEvents = Array.from(eventMap.values())
      .sort(
        (a, b) =>
          new Date(b.dateStarted || 0).getTime() -
          new Date(a.dateStarted || 0).getTime(),
      )
      .slice(0, parsedLimit);

    return {
      success: true,
      source: "NASA EONET (LIVE)",
      location,
      category,
      categories: categoriesToFetch,
      count: liveEvents.length,
      data: liveEvents,
    };
  }

  // Extract Sri Lanka districts (simplified version)
  extractSriLankaDistricts(event) {
    const districts = [
      "Colombo",
      "Gampaha",
      "Kalutara",
      "Kandy",
      "Matale",
      "Nuwara Eliya",
      "Galle",
      "Matara",
      "Hambantota",
      "Jaffna",
      "Kilinochchi",
      "Mannar",
      "Vavuniya",
      "Mullaitivu",
      "Batticaloa",
      "Ampara",
      "Trincomalee",
      "Kurunegala",
      "Puttalam",
      "Anuradhapura",
      "Polonnaruwa",
      "Badulla",
      "Moneragala",
      "Ratnapura",
      "Kegalle",
    ];

    // If event title contains district name, add it
    const matchedDistricts = [];
    if (event.title) {
      for (const district of districts) {
        if (event.title.toLowerCase().includes(district.toLowerCase())) {
          matchedDistricts.push(district);
        }
      }
    }

    return matchedDistricts.length > 0 ? matchedDistricts : [];
  }

  // Map event categories to required volunteer skills
  getRequiredSkills(category) {
    const skillMap = {
      Wildfires: ["First Aid", "Fire Fighting", "Evacuation", "Logistics"],
      "Severe Storms": [
        "Search & Rescue",
        "First Aid",
        "Logistics",
        "Communication",
      ],
      Volcanoes: ["Evacuation", "First Aid", "Communication", "Logistics"],
      Floods: ["Swimming", "Search & Rescue", "Boat Operation", "First Aid"],
      Earthquakes: [
        "Search & Rescue",
        "First Aid",
        "Heavy Equipment",
        "Logistics",
      ],
      Drought: ["Food Distribution", "Water Management", "Logistics"],
      Landslides: ["Search & Rescue", "Heavy Equipment", "First Aid"],
      "Sea and Lake Ice": ["Cold Weather Training", "Search & Rescue"],
    };

    return skillMap[category] || ["General Response", "First Aid", "Logistics"];
  }

  // Get events for volunteers (filtered by location and status)
  async getEventsForVolunteers(volunteerId, filters = {}) {
    try {
      let query = { status: "ACTIVE" };

      // Filter by location (Sri Lanka or worldwide)
      if (filters.location === "srilanka") {
        query.countries = "Sri Lanka";
      }

      // Filter by category
      if (filters.category) {
        query.category = filters.category;
      }

      // Filter by date
      if (filters.days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.days);
        query.dateStarted = { $gte: cutoffDate };
      }

      const events = await Event.find(query)
        .sort({ dateStarted: -1 })
        .limit(filters.limit || 50);

      // Add volunteer interest status
      if (volunteerId) {
        events.forEach((event) => {
          event._doc.isInterested = event.interestedVolunteers.some(
            (iv) => iv.volunteer && iv.volunteer.toString() === volunteerId,
          );
        });
      }

      return events;
    } catch (error) {
      console.error("❌ Error getting events for volunteers:", error);
      throw error;
    }
  }

  // Volunteer shows interest in an event
  async expressInterest(eventId, volunteerId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      // Check if already interested
      const alreadyInterested = event.interestedVolunteers.some(
        (iv) => iv.volunteer && iv.volunteer.toString() === volunteerId,
      );

      if (!alreadyInterested) {
        event.interestedVolunteers.push({
          volunteer: volunteerId,
          interestedAt: new Date(),
        });
        await event.save();
      }

      return {
        success: true,
        message: alreadyInterested ? "Already interested" : "Interest recorded",
      };
    } catch (error) {
      console.error("❌ Error expressing interest:", error);
      throw error;
    }
  }
}

export default new EventService();
