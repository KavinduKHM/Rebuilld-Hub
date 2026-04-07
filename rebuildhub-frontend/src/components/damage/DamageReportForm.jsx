import React, { useState, useEffect } from "react";
import { getDisasters } from "../../services/disasterService";
import API from "../../services/api";

const DamageReportForm = () => {
  const [disasters, setDisasters] = useState([]);
  const [form, setForm] = useState({
    disasterId: "",
    reporterName: "",
    contactNumber: "",
    damageType: "Infrastructure",
    damageDescription: "",
    estimatedLoss: "",
    location: { latitude: "", longitude: "", address: "" }
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDisasters().then(res => setDisasters(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => setImages(Array.from(e.target.files));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    for (let key in form) {
      if (key === "location") {
        data.append("location[latitude]", form.location.latitude);
        data.append("location[longitude]", form.location.longitude);
        data.append("location[address]", form.location.address);
      } else {
        data.append(key, form[key]);
      }
    }
    images.forEach(img => data.append("images", img));

    try {
      await API.post("/reports", data, { headers: { "Content-Type": "multipart/form-data" } });
      alert("Damage report submitted!");
      window.location.href = "/disasters";
    } catch (err) {
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="container" style={{ maxWidth: "760px" }}>
        <div className="page-header">
          <div>
            <span className="section-label">Damage Intake</span>
            <h1 className="page-title">Submit Damage Report</h1>
            <p className="page-subtitle">
              Submit field damage details linked to an existing disaster record.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="page-card detail-stack">
          <select name="disasterId" onChange={handleChange} required>
            <option value="">Select Disaster</option>
            {disasters.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
          </select>
          <input name="reporterName" placeholder="Your Name" onChange={handleChange} required />
          <input name="contactNumber" placeholder="Contact Number" onChange={handleChange} required />
          <select name="damageType" onChange={handleChange}>
            <option>Infrastructure</option><option>Housing</option><option>Medical</option><option>Agriculture</option><option>Other</option>
          </select>
          <textarea name="damageDescription" placeholder="Describe damage" onChange={handleChange} required />
          <input name="estimatedLoss" placeholder="Estimated Loss ($)" type="number" onChange={handleChange} />
          <input name="location.latitude" placeholder="Latitude" type="number" step="any" />
          <input name="location.longitude" placeholder="Longitude" type="number" step="any" />
          <input name="location.address" placeholder="Address" />
          <input type="file" multiple accept="image/*" onChange={handleFileChange} />
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Submitting..." : "Submit Report"}</button>
        </form>
      </div>
    </div>
  );
};

export default DamageReportForm;