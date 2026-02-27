import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    nasaEventId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    countries: [
      {
        type: String,
      },
    ],
    districts: [
      {
        type: String, // For Sri Lanka districts
      },
    ],
    magnitude: {
      type: Number,
      default: 0,
    },
    magnitudeUnit: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CLOSED"],
      default: "ACTIVE",
    },
    dateStarted: {
      type: Date,
      required: true,
    },
    dateEnded: {
      type: Date,
    },
    sources: [
      {
        id: String,
        url: String,
      },
    ],
    geometry: [
      {
        date: {
          type: Date,
        },
        type: {
          type: String,
        },
        coordinates: {
          type: mongoose.Schema.Types.Mixed,
        },
        magnitudeValue: {
          type: Number,
        },
        magnitudeUnit: {
          type: String,
        },
      },
    ],
    // For volunteer interest
    interestedVolunteers: [
      {
        volunteer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Volunteer",
        },
        interestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    requiredSkills: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
);

// Create geospatial index for location queries
eventSchema.index({ "location.coordinates": "2dsphere" });

const Event = mongoose.model("Event", eventSchema);
export default Event;
