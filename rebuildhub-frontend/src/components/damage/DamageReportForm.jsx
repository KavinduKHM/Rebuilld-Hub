import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDisasters } from "../../services/disasterService";
import { submitDamageReport } from "../../services/damageService";
import { useAlert } from "../../context/AlertContext";

const DamageReportForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
  const { showAlert } = useAlert();

  useEffect(() => {
    getDisasters().then(res => setDisasters(res.data));
  }, []);

  const verifiedDisasters = disasters.filter((d) => d.verificationStatus === "Verified");

  useEffect(() => {
    const prefill = location.state?.prefillReport;
    if (!prefill) return;

    setForm((prev) => ({
      ...prev,
      disasterId: prefill.disasterId || prev.disasterId,
      damageDescription: prefill.damageDescription || prev.damageDescription,
      location: {
        latitude: prefill.location?.latitude?.toString() || prev.location.latitude,
        longitude: prefill.location?.longitude?.toString() || prev.location.longitude,
        address: prefill.location?.address || prev.location.address,
      },
    }));
  }, [location.state]);

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
      await submitDamageReport(data);
      showAlert("Damage report submitted! Redirecting...", { variant: "success" });
      setTimeout(() => {
        navigate("/disasters");
      }, 1200);
    } catch (err) {
      showAlert(err?.response?.data?.message || "Submission failed", { variant: "error" });
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
        <form onSubmit={handleSubmit} className="page-card detail-stack damage-form">
          <div className="form-head">
            <div>
              <span className="form-kicker">Field capture</span>
              <h2>Damage report intake</h2>
              <p>Link evidence, impacts, and location details to support verification and response.</p>
            </div>
            <div className="form-badge">Verified Only</div>
          </div>

          <div className="form-section">
            <div className="form-section__head">
              <span className="form-kicker">Disaster link</span>
              <h3>Select the incident record</h3>
              <p>Reports are accepted only for admin verified disasters.</p>
            </div>
            <div className="form-grid">
              <div className="field field--full">
                <label className="field-label" htmlFor="damage-disaster">Verified disaster</label>
                <select id="damage-disaster" name="disasterId" value={form.disasterId} onChange={handleChange} required>
                  <option value="">Select Disaster</option>
                  {verifiedDisasters.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
                </select>
              </div>
            </div>
            {verifiedDisasters.length === 0 && (
              <div className="alert alert--warning">
                No verified disasters available yet. Reports can be submitted only after admin verifies a disaster.
              </div>
            )}
          </div>

          <div className="form-grid">
            <div className="field">
              <label className="field-label" htmlFor="damage-reporter">Reporter name</label>
              <input id="damage-reporter" name="reporterName" placeholder="Your Name" value={form.reporterName} onChange={handleChange} required />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="damage-contact">Contact number</label>
              <input id="damage-contact" name="contactNumber" placeholder="Contact Number" value={form.contactNumber} onChange={handleChange} required />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="damage-type">Damage category</label>
              <select id="damage-type" name="damageType" value={form.damageType} onChange={handleChange}>
                <option>Infrastructure</option><option>Housing</option><option>Medical</option><option>Agriculture</option><option>Other</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="damage-loss">Estimated loss (LKR)</label>
              <input id="damage-loss" name="estimatedLoss" placeholder="Estimated Loss (LKR)" type="number" value={form.estimatedLoss} onChange={handleChange} />
            </div>
            <div className="field field--full">
              <label className="field-label" htmlFor="damage-description">Situation summary</label>
              <textarea id="damage-description" name="damageDescription" placeholder="Describe damage" value={form.damageDescription} onChange={handleChange} required rows={4} />
            </div>
            <div className="field field--full">
              <label className="field-label" htmlFor="damage-evidence">Evidence photos</label>
              <label className="file-drop" htmlFor="damage-evidence">
                <input id="damage-evidence" className="file-drop__input" type="file" multiple accept="image/*" onChange={handleFileChange} />
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
              <h3>Pin the affected area</h3>
              <p>Provide coordinates and an address so teams can validate the impact zone.</p>
            </div>
            <div className="form-grid form-grid--compact">
              <div className="field">
                <label className="field-label" htmlFor="damage-latitude">Latitude</label>
                <input id="damage-latitude" name="location.latitude" placeholder="Latitude" type="number" step="any" value={form.location.latitude} onChange={handleChange} />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="damage-longitude">Longitude</label>
                <input id="damage-longitude" name="location.longitude" placeholder="Longitude" type="number" step="any" value={form.location.longitude} onChange={handleChange} />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="damage-address">Address</label>
                <input id="damage-address" name="location.address" placeholder="Address" value={form.location.address} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DamageReportForm;