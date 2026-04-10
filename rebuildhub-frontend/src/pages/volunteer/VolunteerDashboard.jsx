// src/pages/volunteer/VolunteerDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./VolunteerDashboard.css";
import "../../assets/styles/global.css";

import EventsMap from "./components/EventsMap";
import EventCard from "./components/EventCard";
import ProfileEditor from "./components/ProfileEditor";
import { clearAuthSession, getAuthSession } from "../../services/authSession";
import { getDisasters } from "../../services/disasterService";
import { useAlert } from "../../context/AlertContext";

// Demo events data for fallback (moved inside component scope)
const demoEvents = [
  {
    _id: "1",
    title: "Severe Flooding in Gampaha",
    description:
      "Heavy monsoon rains caused flooding in low-lying areas. Immediate assistance needed for evacuation and relief distribution.",
    category: "Floods",
    districts: ["Gampaha"],
    countries: ["Sri Lanka"],
    requiredSkills: ["Rescue", "First Aid", "Logistics"],
    dateStarted: "2026-02-20T10:00:00Z",
    location: { coordinates: [79.999, 7.091] },
  },
  {
    _id: "2",
    title: "Landslide Warning: Badulla",
    description:
      "Landslide risk in Hali-Ela region. Need volunteers for evacuation coordination.",
    category: "Landslide",
    districts: ["Badulla"],
    countries: ["Sri Lanka"],
    requiredSkills: ["Search & Rescue", "First Aid"],
    dateStarted: "2026-02-22T10:00:00Z",
    location: { coordinates: [81.034, 6.993] },
  },
  {
    _id: "3",
    title: "Cyclone Alert: Coastal Areas",
    description:
      "Cyclone warning for coastal regions. Evacuation centers being set up.",
    category: "Cyclone",
    districts: ["Colombo", "Galle", "Matara"],
    countries: ["Sri Lanka"],
    requiredSkills: ["First Aid", "Logistics", "Communication"],
    dateStarted: "2026-02-25T10:00:00Z",
    location: { coordinates: [79.861, 6.927] },
  },
];

const asArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const asObject = (payload) => {
  if (payload && typeof payload === "object" && payload.data) return payload.data;
  return payload;
};

const toAvailability = (value) => {
  const normalized = (value || "").toString().toLowerCase();
  return normalized === "available" ? "available" : "unavailable";
};

const toStatus = (volunteer) => {
  const status = (volunteer?.verificationStatus || volunteer?.status || "pending")
    .toString()
    .toLowerCase();
  if (status === "verified") return "approved";
  return status;
};

const categoryId = (category) => {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.id || category.name || "";
};

const categoryLabel = (category) => {
  if (!category) return "Unknown";
  if (typeof category === "string") return category;
  return category.name || category.id || "Unknown";
};

const normalizeCategory = (value) => {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [volunteer, setVolunteer] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeDisasters, setActiveDisasters] = useState([]);
  const [disasterLoading, setDisasterLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("worldwide");
  const [showProfileEditor, setShowProfileEditor] = useState(false); // Changed from editingProfile
  const [sessionUser, setSessionUser] = useState(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    const { token, role, user } = getAuthSession();
    if (!token || role !== "volunteer") {
      navigate("/admin/login", { replace: true });
      return;
    }
    setSessionUser(user || null);
  }, [navigate]);

  // Fetch volunteer data
  const fetchVolunteer = useCallback(async () => {
    if (!sessionUser) return;

    const sessionVolunteerId = sessionUser?.volunteerId;

    const applyProfile = (profile) => {
      setVolunteer({
        ...profile,
        availability: toAvailability(profile?.availability),
        status: toStatus(profile),
        location: profile?.district || profile?.location,
      });
    };

    try {
      if (sessionUser?.email) {
        const allResponse = await axios.get("http://localhost:5000/api/volunteers");
        const records = asArray(allResponse.data);
        const matched = records.find(
          (item) => (item?.email || "").toLowerCase() === sessionUser.email.toLowerCase(),
        );

        if (matched?._id || matched?.volunteerId) {
          applyProfile(matched);
          return;
        }
      }

      if (sessionVolunteerId) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/volunteers/${sessionVolunteerId}`,
          );
          const profile = asObject(response.data);

          if (profile?._id || profile?.volunteerId) {
            applyProfile(profile);
            return;
          }
        } catch (idError) {
          console.warn("Volunteer lookup by session volunteerId failed:", idError);
        }
      }

      throw new Error("Volunteer profile not found for logged in user");
    } catch (error) {
      console.error("Error fetching volunteer:", error);
      // Demo data if API fails
      applyProfile({
        _id: "demo123",
        name: sessionUser?.name || "Volunteer",
        email: sessionUser?.email || "volunteer@example.com",
        phone: "+94 77 123 4567",
        location: "Colombo",
        skills: ["First Aid", "Rescue", "Medical"],
        availability: "available",
        status: "approved",
        createdAt: new Date().toISOString(),
        bio: "Experienced first responder with 5 years in disaster relief",
      });
    }
  }, [sessionUser]);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/events/live?location=${selectedLocation}&category=${selectedCategory}&days=30&limit=100`;
      const response = await axios.get(url);
      const liveEvents = asArray(response.data);
      setEvents(liveEvents);
      setFilteredEvents(liveEvents);
    } catch (error) {
      console.error("Error fetching live events:", error);
      // Fallback to regular events endpoint
      try {
        const fallbackUrl =
          selectedLocation === "worldwide"
            ? "http://localhost:5000/api/events"
            : `http://localhost:5000/api/events?location=${selectedLocation}`;
        const response = await axios.get(fallbackUrl);
        const fallbackEvents = asArray(response.data);
        setEvents(fallbackEvents);
        setFilteredEvents(fallbackEvents);
      } catch (err) {
        console.error("Fallback failed, using demo data:", err);
        // Demo events data
        setEvents(demoEvents);
        setFilteredEvents(demoEvents);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedCategory]);

  const fetchDisasters = useCallback(async () => {
    setDisasterLoading(true);
    try {
      const response = await getDisasters();
      const rows = asArray(response.data || response);
      const activeRows = rows.filter(
        (item) => item.status === "Active" && item.verificationStatus === "Verified",
      );
      setActiveDisasters(activeRows);
    } catch (error) {
      console.error("Error fetching disasters:", error);
      setActiveDisasters([]);
    } finally {
      setDisasterLoading(false);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/events/categories",
      );
      const categoryRows = asArray(response.data)
        .map((item) => ({ id: categoryId(item), name: categoryLabel(item) }))
        .filter((item) => item.id);
      setCategories(categoryRows);
    } catch (error) {
      setCategories([
        { id: "floods", name: "Floods" },
        { id: "earthquakes", name: "Earthquakes" },
        { id: "severeStorms", name: "Severe Storms" },
        { id: "landslides", name: "Landslides" },
        { id: "wildfires", name: "Wildfires" },
      ]);
    }
  };

  useEffect(() => {
    fetchVolunteer();
    fetchCategories();
  }, [fetchVolunteer]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchDisasters();
  }, [fetchDisasters]);

  // Filter events when filters change
  useEffect(() => {
    let filtered = [...events];
    if (selectedCategory !== "all") {
      const selectedCategoryKey = normalizeCategory(selectedCategory);
      filtered = filtered.filter(
        (event) => normalizeCategory(event.category) === selectedCategoryKey,
      );
    }
    if (selectedLocation !== "worldwide") {
      filtered = filtered.filter(
        (event) =>
          event.location?.coordinates ||
          event.districts?.some((d) =>
            d.toLowerCase().includes(selectedLocation.toLowerCase()),
          ),
      );
    }
    setFilteredEvents(filtered);
  }, [selectedCategory, selectedLocation, events]);

  const handleInterest = async ({ eventId, eventData }) => {
    try {
      await axios.post(`http://localhost:5000/api/events/${eventId}/interest`, {
        volunteerId: volunteer._id || volunteer.volunteerId,
        eventData,
      });
      showAlert("You've expressed interest! A coordinator will contact you.", {
        variant: "success",
      });
    } catch (error) {
      showAlert("Unable to register interest. Please try again.", {
        variant: "error",
      });
    }
  };

  const handleProfileUpdate = (updatedVolunteer) => {
    setVolunteer(updatedVolunteer);
    setShowProfileEditor(false);
    showAlert("Profile updated successfully!", { variant: "success" });
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/", { replace: true });
  };

  const handleAssign = async (disasterId) => {
    if (volunteer?.status !== "approved") {
      showAlert("Only approved volunteers can assign themselves to a disaster.", {
        variant: "warning",
      });
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/disasters/${disasterId}/assign-volunteer`, {
        volunteerId: volunteer?._id || volunteer?.volunteerId,
        volunteerEmail: volunteer?.email,
      });
      await fetchDisasters();
      showAlert("You have been assigned to the disaster response.", {
        variant: "success",
      });
    } catch (error) {
      showAlert("Unable to assign. Please try again.", { variant: "error" });
    }
  };

  if (!volunteer) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="admin-shell volunteer-dashboard-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar page-card dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="material-symbols-outlined">hub</span>
            <div>
              <h1>RebuildHub</h1>
              <p>Volunteer Operations</p>
            </div>
          </div>
        </div>

        <div className="admin-status-pill">Status: Volunteer Active</div>

        <nav className="admin-nav sidebar-nav">
          <button
            className={`admin-nav-link nav-item ${activeTab === "dashboard" ? "admin-nav-link--active active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
            type="button"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`admin-nav-link nav-item ${activeTab === "disasters" ? "admin-nav-link--active active" : ""}`}
            onClick={() => setActiveTab("disasters")}
            type="button"
          >
            <span className="material-symbols-outlined">crisis_alert</span>
            <span>Disasters</span>
          </button>
          <button
            className={`admin-nav-link nav-item ${activeTab === "events" ? "admin-nav-link--active active" : ""}`}
            onClick={() => setActiveTab("events")}
            type="button"
          >
            <span className="material-symbols-outlined">event</span>
            <span>Live Events</span>
          </button>
          <button
            className={`admin-nav-link nav-item ${activeTab === "profile" ? "admin-nav-link--active active" : ""}`}
            onClick={() => setActiveTab("profile")}
            type="button"
          >
            <span className="material-symbols-outlined">person</span>
            <span>My Profile</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer sidebar-footer">
          <div className={`sidebar-availability ${volunteer.availability}`}>
            <span className={`sidebar-status-dot ${volunteer.availability}`}></span>
            <div className="sidebar-status-text">
              <small>Current Duty</small>
              <span>
                {volunteer.availability === "available"
                  ? "Available"
                  : "Unavailable"}
              </span>
            </div>
          </div>
          <button className="btn-secondary admin-sidebar-action" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main dashboard-main">
        {activeTab === "dashboard" && (
          <>
            {/* Welcome Header */}
            <div className="admin-topbar page-card dashboard-header">
              <div>
                <span className="section-label">Volunteer Command</span>
                <h1>
                  Welcome back, {volunteer.name?.split(" ")[0] || "Volunteer"}
                </h1>
                <p>Monitoring the resilient grid in real-time.</p>
              </div>
              <div className={`application-status ${volunteer.status}`}>
                <span className="material-symbols-outlined">
                  {volunteer.status === "approved"
                    ? "check_circle"
                    : volunteer.status === "rejected"
                      ? "cancel"
                      : "pending"}
                </span>
                <span>Application {volunteer.status}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="admin-section-grid stats-grid">
              <div className="admin-section-card page-card stat-card">
                <div>
                  <p>Active Disasters</p>
                  <h3>{filteredEvents.length}</h3>
                </div>
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div className="admin-section-card page-card stat-card">
                <div>
                  <p>Your Skills</p>
                  <h3>{volunteer.skills?.length || 0}</h3>
                </div>
                <span className="material-symbols-outlined">verified</span>
              </div>
              <div className="admin-section-card page-card stat-card">
                <div>
                  <p>Availability</p>
                  <h3 className={volunteer.availability}>
                    {volunteer.availability === "available"
                      ? "Ready"
                      : "Off Duty"}
                  </h3>
                </div>
                <span className="material-symbols-outlined">schedule</span>
              </div>
            </div>

            {/* Assigned Disasters */}
            <div className="admin-panel page-card volunteer-disaster-panel volunteer-disaster-panel--dashboard">
              <div className="section-header">
                <h2>My Assigned Disasters</h2>
                <button onClick={() => setActiveTab("disasters")}>
                  View All →
                </button>
              </div>
              {(() => {
                const volunteerId = volunteer?._id?.toString();
                const assigned = activeDisasters.filter((disaster) =>
                  (disaster.assignedVolunteers || []).some(
                    (assignedId) => assignedId?.toString() === volunteerId,
                  ),
                );

                if (disasterLoading) {
                  return <div className="loading">Loading assignments...</div>;
                }

                if (assigned.length === 0) {
                  return <p className="empty-state">No assigned disasters yet.</p>;
                }

                return (
                  <div className="volunteer-disaster-grid assigned-preview-grid">
                    {assigned.slice(0, 3).map((disaster) => (
                      <article key={disaster._id} className="volunteer-disaster-card">
                        <div
                          className="volunteer-disaster-media"
                          style={{
                            backgroundImage: disaster.images?.[0]
                              ? `linear-gradient(180deg, rgba(12,18,30,0.2), rgba(12,18,30,0.6)), url(${disaster.images[0]})`
                              : "linear-gradient(135deg, rgba(0,103,126,0.55), rgba(0,210,253,0.4))",
                          }}
                        >
                          <span className="event-badge">Assigned</span>
                        </div>
                        <div className="volunteer-disaster-body">
                          <h3>{disaster.title || "Untitled Disaster"}</h3>
                          <p>{disaster.location?.name || disaster.location?.address || "Location pending"}</p>
                          <div className="volunteer-disaster-meta">
                            <span>{disaster.type || "Other"}</span>
                            <span>Status: {disaster.status || "Active"}</span>
                          </div>
                          <div className="volunteer-disaster-actions">
                            <Link to={`/disasters/${disaster._id}`} className="btn-secondary">View Details</Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Recent Events Preview */}
            <div className="admin-panel page-card events-preview">
              <div className="section-header">
                <h2>Recent Disaster Events</h2>
                <button onClick={() => setActiveTab("events")}>
                  View All →
                </button>
              </div>
              <div className="events-grid">
                {filteredEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event._id || event.nasaEventId || event.id}
                    event={event}
                    onInterest={handleInterest}
                    compact={true}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "events" && (
          <>
            <div className="admin-panel page-card events-header">
              <h1>Live Disaster Events</h1>
              <div className="events-filters">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="filter-select"
                >
                  <option value="worldwide">Worldwide</option>
                  <option value="srilanka">Sri Lanka</option>
                  <option value="usa">USA</option>
                  <option value="india">India</option>
                </select>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={categoryId(cat)} value={categoryId(cat)}>
                      {categoryLabel(cat)}
                    </option>
                  ))}
                </select>
                <button onClick={fetchEvents} className="refresh-btn">
                  <span className="material-symbols-outlined">refresh</span>
                  Refresh
                </button>
              </div>
            </div>

            {/* Map Component */}
            <div className="admin-panel page-card">
              <EventsMap
                events={filteredEvents}
                onEventSelect={(event) => console.log("Selected:", event)}
              />
            </div>

            {/* Event Cards */}
            {loading ? (
              <div className="loading">Loading events...</div>
            ) : (
              <div className="events-full-grid admin-section-grid">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event._id || event.nasaEventId || event.id}
                    event={event}
                    onInterest={handleInterest}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "disasters" && (
          <>
            <div className="admin-topbar page-card dashboard-header">
              <div>
                <span className="section-label">Active Deployments</span>
                <h1>Live Disaster Assignments</h1>
                <p>Review verified active disasters and assign yourself to response teams.</p>
              </div>
              <div className={`application-status ${volunteer.status}`}>
                <span className="material-symbols-outlined">
                  {volunteer.status === "approved"
                    ? "check_circle"
                    : volunteer.status === "rejected"
                      ? "cancel"
                      : "pending"}
                </span>
                <span>Application {volunteer.status}</span>
              </div>
            </div>

            <div className="admin-panel page-card volunteer-disaster-panel">
              {disasterLoading ? (
                <div className="loading">Loading disasters...</div>
              ) : activeDisasters.length === 0 ? (
                <p className="empty-state">No active disasters available right now.</p>
              ) : (
                <div className="volunteer-disaster-grid">
                  {activeDisasters.map((disaster) => (
                    <article key={disaster._id} className="volunteer-disaster-card">
                      <div
                        className="volunteer-disaster-media"
                        style={{
                          backgroundImage: disaster.images?.[0]
                            ? `linear-gradient(180deg, rgba(12,18,30,0.2), rgba(12,18,30,0.6)), url(${disaster.images[0]})`
                            : "linear-gradient(135deg, rgba(0,103,126,0.55), rgba(0,210,253,0.4))",
                        }}
                      >
                        <span className={`event-badge`}>{disaster.severityLevel || "Medium"}</span>
                      </div>
                      <div className="volunteer-disaster-body">
                        <h3>{disaster.title || "Untitled Disaster"}</h3>
                        <p>{disaster.location?.name || disaster.location?.address || "Location pending"}</p>
                        <div className="volunteer-disaster-meta">
                          <span>{disaster.type || "Other"}</span>
                          <span>Status: {disaster.status || "Active"}</span>
                        </div>
                        <div className="volunteer-disaster-actions">
                          <Link to={`/disasters/${disaster._id}`} className="btn-secondary">View Details</Link>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => handleAssign(disaster._id)}
                            disabled={volunteer.status !== "approved"}
                          >
                            {volunteer.status === "approved" ? "Assign Me" : "Approval Required"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        
{activeTab === "profile" && (
  <>
    {/* Page Header */}
    <div className="profile-page-header">
      <div>
        <h1>Volunteer Profile</h1>
        <p>Manage your deployment status, technical certifications, and personal records.</p>
      </div>
      <div className="profile-header-actions">
        <button 
          onClick={() => setShowProfileEditor(true)} 
          className="profile-edit-btn"
        >
          <span className="material-symbols-outlined">edit</span>
          Edit Profile
        </button>
      </div>
    </div>

    {/* Bento Grid Profile Content */}
    <div className="profile-bento-grid">
      {/* Profile Identity Card */}
      <div className="profile-identity-card">
        <div className="identity-content">
          <div className="avatar-section">
            <div className="avatar-large">
              <span className="material-symbols-outlined">person</span>
            </div>
          </div>
          <div className="identity-info">
            <div className="name-badge">
              <h2>{volunteer.name}</h2>
              <span className="level-badge">Level {Math.min(4, Math.floor((volunteer.skills?.length || 0) / 2) + 1)} Responder</span>
            </div>
            <p className="location">
              <span className="material-symbols-outlined">location_on</span>
              {volunteer.location || "Location not set"} • Disaster Logistics
            </p>
            <div className="cert-badges">
              <div className="cert-badge">
                <span className="material-symbols-outlined">verified</span>
                <span>Certified Volunteer</span>
              </div>
              <div className="cert-badge">
                <span className="material-symbols-outlined">calendar_month</span>
                <span>Joined {new Date(volunteer.createdAt).getFullYear() || "2024"}</span>
              </div>
              <div className="cert-badge">
                <span className="material-symbols-outlined">volunteer_activism</span>
                <span>{volunteer.skills?.length || 0} Skills</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Status Card */}
      <div className="profile-availability-card">
        <h3>
          <span className="material-symbols-outlined">bolt</span>
          Availability Status
        </h3>
        <div className="profile-availability-options">
          <div className={`availability-status-item ${volunteer.availability === "available" ? "active" : ""}`}>
            <div className="status-indicator available"></div>
            <div>
              <strong>Available</strong>
              <p>Ready for deployment</p>
            </div>
            {volunteer.availability === "available" && (
              <span className="status-check material-symbols-outlined">check_circle</span>
            )}
          </div>
          <div className={`availability-status-item ${volunteer.availability === "busy" ? "active" : ""}`}>
            <div className="status-indicator busy"></div>
            <div>
              <strong>Busy</strong>
              <p>Currently assigned</p>
            </div>
            {volunteer.availability === "busy" && (
              <span className="status-check material-symbols-outlined">check_circle</span>
            )}
          </div>
          <div className={`availability-status-item ${volunteer.availability === "unavailable" ? "active" : ""}`}>
            <div className="status-indicator unavailable"></div>
            <div>
              <strong>Not Available</strong>
              <p>On leave / Off-duty</p>
            </div>
            {volunteer.availability === "unavailable" && (
              <span className="status-check material-symbols-outlined">check_circle</span>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="profile-personal-card">
        <h3>Personal Information</h3>
        <div className="profile-info-grid">
          <div className="info-field">
            <label>Legal Full Name</label>
            <p>{volunteer.name}</p>
          </div>
          <div className="info-field">
            <label>Email Address</label>
            <p>{volunteer.email}</p>
          </div>
          <div className="info-field">
            <label>Primary Phone</label>
            <p>{volunteer.phone || "Not provided"}</p>
          </div>
          <div className="info-field">
            <label>Emergency Contact</label>
            <p>{volunteer.emergencyContact || "Not provided"}</p>
          </div>
          <div className="info-field full-width">
            <label>Bio / Mission Statement</label>
            <p>{volunteer.bio || "Committed to rapid response logistics and medical aid in disaster zones."}</p>
          </div>
        </div>
      </div>

      {/* Skills Card */}
      <div className="profile-skills-card">
        <div className="skills-header">
          <h3>Field Skills</h3>
          <span className="skills-count">{volunteer.skills?.length || 0} Active</span>
        </div>
        <div className="profile-skills-list">
          {volunteer.skills?.map((skill, i) => (
            <span key={i} className="profile-skill-tag">{skill}</span>
          ))}
          {(!volunteer.skills || volunteer.skills.length === 0) && (
            <p className="no-skills">No skills added yet. Click Edit Profile to add your skills.</p>
          )}
        </div>
      </div>

      {/* Application Status Card */}
      <div className="profile-status-card">
        <div className="status-icon">
          <span className="material-symbols-outlined">
            {volunteer.status === "approved" ? "check_circle" : 
             volunteer.status === "rejected" ? "cancel" : "pending"}
          </span>
        </div>
        <div className="status-content">
          <h4>Application Status</h4>
          <p className={`status-badge-text ${volunteer.status}`}>
            {volunteer.status === "approved" && "✓ Approved - You're an active volunteer"}
            {volunteer.status === "pending" && "⏳ Pending Review - We'll notify you once approved"}
            {volunteer.status === "rejected" && "✗ Not Approved - Please contact support"}
          </p>
        </div>
      </div>
    </div>

    {/* Profile Editor Modal (keep this for editing) */}
    {showProfileEditor && (
      <ProfileEditor
        volunteer={volunteer}
        onUpdate={handleProfileUpdate}
        onClose={() => setShowProfileEditor(false)}
      />
    )}
  </>
)}
      </main>
    </div>
  );
};

export default VolunteerDashboard;
