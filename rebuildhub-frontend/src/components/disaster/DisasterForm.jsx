import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDisaster } from "../../services/disasterService";
import LocationMapPicker from "./LocationMapPicker.jsx";

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
  const [error, setError] = useState("");

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
    setError("");

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
      alert("Disaster created successfully!");
      navigate(`/disasters/${res.data.disaster._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Report New Disaster</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input name="title" placeholder="Title" onChange={handleChange} required />
      <select name="type" onChange={handleChange}>
        <option>Flood</option><option>Earthquake</option><option>Landslide</option><option>Cyclone</option><option>Other</option>
      </select>
      <textarea name="description" placeholder="Description" onChange={handleChange} required />
      <select name="severityLevel" onChange={handleChange}>
        <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
      </select>
      <LocationMapPicker location={formData.location} onChange={handleLocationChange} />
      <input name="location.name" placeholder="Location Name" value={formData.location.name} readOnly />
      <input name="location.latitude" placeholder="Latitude" type="number" step="any" value={formData.location.latitude} readOnly />
      <input name="location.longitude" placeholder="Longitude" type="number" step="any" value={formData.location.longitude} readOnly />
      <input type="file" multiple accept="image/*" onChange={handleFileChange} />
      <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Disaster"}</button>
    </form>
  );
};

const styles = {
  form: { display: "flex", flexDirection: "column", maxWidth: "500px", margin: "auto", gap: "1rem" }
};

export default DisasterForm;