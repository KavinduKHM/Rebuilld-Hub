// src/pages/volunteer/components/ProfileEditor.jsx
import React, { useState } from "react";
import axios from "axios";

const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test((value || "").toString());

const resolveVolunteerId = (volunteer) => {
  if (isObjectId(volunteer?._id)) return volunteer._id;

  const numericVolunteerId = Number(volunteer?.volunteerId);
  if (Number.isInteger(numericVolunteerId) && numericVolunteerId > 0) {
    return String(numericVolunteerId);
  }

  return "";
};

const ProfileEditor = ({ volunteer, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    name: volunteer.name || "",
    email: volunteer.email || "",
    phone: volunteer.phone || "",
    location: volunteer.location || "",
    skills: volunteer.skills || [],
    availability: volunteer.availability || "available",
    bio: volunteer.bio || "",
    emergencyContact: volunteer.emergencyContact || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const skillOptions = [
    "Emergency Medicine",
    "Heavy Equipment",
    "Logistics Mgmt",
    "Search & Rescue",
    "Ham Radio",
    "Drone Pilot",
    "Translation (ES)",
    "First Aid Training",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const volunteerId = resolveVolunteerId(volunteer);
    if (!volunteerId) {
      setMessage({
        type: "error",
        text: "Unable to save profile because the volunteer id is missing or invalid.",
      });
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      availability:
        formData.availability === "available" ? "AVAILABLE" : "UNAVAILABLE",
    };

    try {
      const response = await axios.put(
        `http://localhost:5000/api/volunteers/${volunteerId}`,
        payload,
      );
      setMessage({ type: "success", text: "Profile updated successfully!" });
      if (onUpdate) {
        const updatedVolunteer = response?.data?.data || response?.data;
        onUpdate({
          ...updatedVolunteer,
          availability:
            (updatedVolunteer?.availability || "").toLowerCase() === "available"
              ? "available"
              : "unavailable",
        });
      }
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-editor-modal">
      <div className="profile-editor-overlay" onClick={onClose}></div>
      <div className="profile-editor-container glass-panel">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Volunteer Profile</h1>
            <p>
              Manage your deployment status, technical certifications, and
              personal records.
            </p>
          </div>
          <div className="header-actions">
            <button type="button" className="btn-discard" onClick={onClose}>
              Discard Changes
            </button>
            <button
              type="submit"
              className="btn-save"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {message && (
          <div className={`message-banner ${message.type}`}>{message.text}</div>
        )}

        {/* Bento Grid Content */}
        <div className="bento-grid">
          {/* Profile Identity Card */}
          <div className="profile-identity-card glass-panel">
            <div className="identity-content">
              <div className="avatar-section">
                <div className="avatar-large">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <button className="edit-avatar-btn">
                  <span className="material-symbols-outlined">edit</span>
                </button>
              </div>
              <div className="identity-info">
                <div className="name-badge">
                  <h2>{formData.name || volunteer.name}</h2>
                  <span className="level-badge">Level 4 Responder</span>
                </div>
                <p className="location">
                  <span className="material-symbols-outlined">location_on</span>
                  {formData.location || "Location not set"} • Disaster Logistics
                </p>
                <div className="cert-badges">
                  <div className="cert-badge">
                    <span className="material-symbols-outlined">verified</span>
                    <span>Certified EMT</span>
                  </div>
                  <div className="cert-badge">
                    <span className="material-symbols-outlined">
                      calendar_month
                    </span>
                    <span>
                      Joined{" "}
                      {new Date(volunteer.createdAt).getFullYear() || "2024"}
                    </span>
                  </div>
                  <div className="cert-badge">
                    <span className="material-symbols-outlined">
                      volunteer_activism
                    </span>
                    <span>{volunteer.skills?.length || 0} Skills</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Status Card */}
          <div className="availability-card">
            <h3>
              <span className="material-symbols-outlined">bolt</span>
              Availability Status
            </h3>
            <div className="availability-options">
              <label
                className={`radio-option ${formData.availability === "available" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="availability"
                  value="available"
                  checked={formData.availability === "available"}
                  onChange={handleChange}
                />
                <div className="radio-indicator available"></div>
                <div className="radio-content">
                  <strong>Available</strong>
                  <p>Ready for deployment</p>
                </div>
                {formData.availability === "available" && (
                  <span className="check-icon material-symbols-outlined">
                    check_circle
                  </span>
                )}
              </label>
              <label
                className={`radio-option ${formData.availability === "busy" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="availability"
                  value="busy"
                  checked={formData.availability === "busy"}
                  onChange={handleChange}
                />
                <div className="radio-indicator busy"></div>
                <div className="radio-content">
                  <strong>Busy</strong>
                  <p>Currently assigned</p>
                </div>
                {formData.availability === "busy" && (
                  <span className="check-icon material-symbols-outlined">
                    check_circle
                  </span>
                )}
              </label>
              <label
                className={`radio-option ${formData.availability === "unavailable" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="availability"
                  value="unavailable"
                  checked={formData.availability === "unavailable"}
                  onChange={handleChange}
                />
                <div className="radio-indicator unavailable"></div>
                <div className="radio-content">
                  <strong>Not Available</strong>
                  <p>On leave / Off-duty</p>
                </div>
                {formData.availability === "unavailable" && (
                  <span className="check-icon material-symbols-outlined">
                    check_circle
                  </span>
                )}
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <div className="personal-info-card glass-panel">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="input-field">
                <label>Legal Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="input-field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="input-field">
                <label>Primary Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="input-field">
                <label>Emergency Contact</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Name (Relationship)"
                />
              </div>
              <div className="input-field full-width">
                <label>Bio / Mission Statement</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Committed to rapid response logistics and medical aid..."
                />
              </div>
            </div>
          </div>

          {/* Manage Skills */}
          <div className="skills-card">
            <div className="skills-header">
              <h3>Field Skills</h3>
              <span className="skills-count">
                {formData.skills.length} Active
              </span>
            </div>
            <div className="skills-grid">
              {skillOptions.map((skill) => (
                <label key={skill} className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
            <button className="add-cert-btn">
              <span className="material-symbols-outlined">add_circle</span>
              Add New Certification
            </button>
          </div>

          {/* Emergency Verification Card */}
          <div className="verification-card">
            <div className="verification-icon">
              <span className="material-symbols-outlined">emergency_home</span>
            </div>
            <div className="verification-content">
              <h4>Deployment Safety Verification</h4>
              <p>
                Your profile is currently missing valid insurance documentation
                for aerial operations.
              </p>
            </div>
            <button className="upload-btn">Upload Document</button>
          </div>
        </div>
      </div>

      <style>{`
        .profile-editor-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 20px;
        }

        .profile-editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }

        .profile-editor-container {
          position: relative;
          max-width: 1200px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 32px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
        }

        /* Glass Panel */
        .glass-panel {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 24px;
        }

        /* Page Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .page-header h1 {
          font-family: "Plus Jakarta Sans", sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #161a33;
          margin-bottom: 8px;
        }

        .page-header p {
          color: #46464d;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-discard {
          padding: 10px 24px;
          border-radius: 12px;
          border: 1px solid #c7c5ce;
          background: transparent;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-save {
          padding: 10px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #00677e, #00d2fd);
          border: none;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        /* Bento Grid */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
        }

        /* Profile Identity Card */
        .profile-identity-card {
          grid-column: span 8;
          padding: 32px;
          position: relative;
          overflow: hidden;
        }

        .identity-content {
          display: flex;
          gap: 32px;
          align-items: center;
          flex-wrap: wrap;
        }

        .avatar-section {
          position: relative;
        }

        .avatar-large {
          width: 128px;
          height: 128px;
          background: linear-gradient(135deg, #00677e, #00d2fd);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-large .material-symbols-outlined {
          font-size: 64px;
          color: white;
        }

        .edit-avatar-btn {
          position: absolute;
          bottom: -8px;
          right: -8px;
          width: 36px;
          height: 36px;
          background: #00d2fd;
          border: 2px solid white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .edit-avatar-btn .material-symbols-outlined {
          font-size: 18px;
          color: #005669;
        }

        .identity-info {
          flex: 1;
        }

        .name-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .name-badge h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #161a33;
        }

        .level-badge {
          background: rgba(0, 103, 126, 0.1);
          color: #00677e;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #46464d;
          margin-bottom: 16px;
        }

        .location .material-symbols-outlined {
          font-size: 18px;
        }

        .cert-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .cert-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #f4f2ff;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .cert-badge .material-symbols-outlined {
          font-size: 16px;
          color: #00677e;
        }

        /* Availability Card */
        .availability-card {
          grid-column: span 4;
          background: #f4f2ff;
          border-radius: 24px;
          padding: 32px;
        }

        .availability-card h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.25rem;
          margin-bottom: 24px;
        }

        .availability-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .radio-option.selected {
          border: 2px solid #00d2fd;
          background: rgba(0, 210, 253, 0.05);
        }

        .radio-option input {
          position: absolute;
          opacity: 0;
        }

        .radio-indicator {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .radio-indicator.available {
          background: rgba(46, 204, 113, 0.15);
          position: relative;
        }
        .radio-indicator.available::after {
          content: "";
          width: 12px;
          height: 12px;
          background: #2ecc71;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .radio-indicator.busy {
          background: rgba(241, 196, 15, 0.15);
        }
        .radio-indicator.busy::after {
          content: "";
          width: 12px;
          height: 12px;
          background: #f39c12;
          border-radius: 50%;
        }

        .radio-indicator.unavailable {
          background: rgba(149, 165, 166, 0.15);
        }
        .radio-indicator.unavailable::after {
          content: "";
          width: 12px;
          height: 12px;
          background: #95a5a6;
          border-radius: 50%;
        }

        .radio-content strong {
          display: block;
          margin-bottom: 4px;
        }

        .radio-content p {
          font-size: 0.75rem;
          color: #8b92b2;
        }

        .check-icon {
          margin-left: auto;
          color: #00d2fd;
        }

        /* Personal Info Card */
        .personal-info-card {
          grid-column: span 7;
          padding: 32px;
        }

        .personal-info-card h3 {
          font-size: 1.25rem;
          margin-bottom: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-field.full-width {
          grid-column: span 2;
        }

        .input-field label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #00677e;
        }

        .input-field input,
        .input-field textarea {
          padding: 12px 16px;
          background: #f4f2ff;
          border: none;
          border-radius: 12px;
          font-family: inherit;
        }

        .input-field input:focus,
        .input-field textarea:focus {
          outline: none;
          background: #e6e6ff;
        }

        /* Skills Card */
        .skills-card {
          grid-column: span 5;
          background: #f4f2ff;
          border-radius: 24px;
          padding: 32px;
        }

        .skills-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .skills-header h3 {
          font-size: 1.25rem;
        }

        .skills-count {
          padding: 4px 12px;
          background: #00677e;
          color: white;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .skill-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: white;
          border-radius: 12px;
          cursor: pointer;
        }

        .add-cert-btn {
          width: 100%;
          padding: 12px;
          background: white;
          border: 2px dashed #c7c5ce;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Verification Card */
        .verification-card {
          grid-column: span 12;
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 24px 32px;
          background: linear-gradient(
            135deg,
            rgba(231, 76, 60, 0.05),
            transparent
          );
          border-radius: 24px;
          flex-wrap: wrap;
        }

        .verification-icon {
          width: 64px;
          height: 64px;
          background: rgba(231, 76, 60, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .verification-icon .material-symbols-outlined {
          font-size: 32px;
          color: #e74c3c;
        }

        .verification-content {
          flex: 1;
        }

        .verification-content h4 {
          font-size: 1.1rem;
          margin-bottom: 4px;
        }

        .verification-content p {
          font-size: 0.85rem;
          color: #46464d;
        }

        .upload-btn {
          padding: 12px 24px;
          background: #161a33;
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .message-banner {
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .message-banner.success {
          background: rgba(46, 204, 113, 0.15);
          color: #27ae60;
        }

        .message-banner.error {
          background: rgba(231, 76, 60, 0.15);
          color: #e74c3c;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        @media (max-width: 1024px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }

          .profile-identity-card,
          .availability-card,
          .personal-info-card,
          .skills-card,
          .verification-card {
            grid-column: span 1;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .input-field.full-width {
            grid-column: span 1;
          }

          .profile-editor-container {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileEditor;
