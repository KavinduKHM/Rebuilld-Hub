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
