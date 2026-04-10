import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDisaster } from "../../services/disasterService";
import LocationMapPicker from "./LocationMapPicker.jsx";
import { useAlert } from "../../context/AlertContext";

const DisasterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    type: "Flood",
    description: "",
    severityLevel: "Medium",
    location: { name: "", latitude: "", longitude: "" }
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => setImages(Array.from(e.target.files));

  const handleLocationChange = (nextLocation) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        ...nextLocation,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("type", formData.type);
    data.append("description", formData.description);
    data.append("severityLevel", formData.severityLevel);
    data.append("location[name]", formData.location.name);
    data.append("location[latitude]", formData.location.latitude);
    data.append("location[longitude]", formData.location.longitude);
    images.forEach(img => data.append("images", img));

    try {
      const res = await createDisaster(data);
      showAlert("Disaster created successfully!", { variant: "success" });
      setTimeout(() => {
        navigate(`/disasters/${res.data.disaster._id}`);
      }, 1200);
    } catch (err) {
      showAlert(err.response?.data?.message || "Creation failed", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="container" style={{ maxWidth: "760px" }}>
        <div className="page-header">
          <div>
            <span className="section-label">Response Intake</span>
            <h1 className="page-title">Report New Disaster</h1>
            <p className="page-subtitle">
              Select a location on the map, fill the incident details, and submit the report.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="page-card detail-stack disaster-form">
          <div className="form-head">
            <div>
              <span className="form-kicker">Incident briefing</span>
              <h2>Primary details</h2>
              <p>Capture the essentials to help responders assess and deploy resources fast.</p>
            </div>
            <div className="form-badge">Live Intake</div>
          </div>


          <div className="form-grid">
            <div className="field">
              <label className="field-label" htmlFor="disaster-title">Disaster title</label>
              <input id="disaster-title" name="title" placeholder="Ampara flood" onChange={handleChange} required />
              <span className="field-hint">Be specific and short for dashboards and alerts.</span>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="disaster-type">Disaster type</label>
              <select id="disaster-type" name="type" onChange={handleChange}>
                <option>Flood</option><option>Earthquake</option><option>Landslide</option><option>Cyclone</option><option>Other</option>
              </select>
            </div>
            <div className="field field--full">
              <label className="field-label" htmlFor="disaster-description">Situation summary</label>
              <textarea
                id="disaster-description"
                name="description"
                placeholder="Describe what happened, the impact, and any urgent needs."
                onChange={handleChange}
                required
                rows={4}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="disaster-severity">Severity level</label>
              <select id="disaster-severity" name="severityLevel" onChange={handleChange}>
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="disaster-evidence">Evidence photos</label>
              <label className="file-drop" htmlFor="disaster-evidence">
                <input
                  id="disaster-evidence"
                  className="file-drop__input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <span className="file-drop__title">Drop images or click to upload</span>
                <span className="file-drop__meta">
                  {images.length ? `${images.length} file(s) selected` : "PNG or JPG, up to 5 files"}
                </span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__head">
              <span className="form-kicker">Location signal</span>
              <h3>Pinpoint the incident zone</h3>
              <p>Search or tap on the map to capture exact coordinates for dispatch.</p>
            </div>
            <div className="map-shell">
              <LocationMapPicker location={formData.location} onChange={handleLocationChange} />
            </div>
            <div className="form-grid form-grid--compact">
              <div className="field">
                <label className="field-label">Location name</label>
                <input name="location.name" placeholder="Location Name" value={formData.location.name} readOnly />
              </div>
              <div className="field">
                <label className="field-label">Latitude</label>
                <input name="location.latitude" placeholder="Latitude" type="number" step="any" value={formData.location.latitude} readOnly />
              </div>
              <div className="field">
                <label className="field-label">Longitude</label>
                <input name="location.longitude" placeholder="Longitude" type="number" step="any" value={formData.location.longitude} readOnly />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Disaster"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisasterForm;