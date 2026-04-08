// src/components/volunteer/VolunteerForm.jsx
import { useState } from "react"; // Remove useMemo since we're not using it
import { registerVolunteer } from "../../services/volunteerService";
import "./VolunteerForm.css";

const districtOptions = [
  "Colombo",
  "Gampaha",
  "Kandy",
  "Galle",
  "Jaffna",
  "Matara",
  "Kurunegala",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Ratnapura",
  "Trincomalee",
  "Batticaloa",
];

const skillOptions = [
  "First Aid",
  "Rescue",
  "Medical",
  "Logistics",
  "Telecoms",
  "Transport",
  "Psychological First Aid",
  "Water and Sanitation",
  "Shelter Management",
];

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
  district: "",
  skills: [],
  immediateDeployment: true,
};

const VolunteerForm = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Remove the unused selectedSkillsLabel variable

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSkillToggle = (skill) => {
    setFormData((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.skills.length === 0) {
      setStatusMessage("Please select at least one skill.");
      return;
    }

    const payload = {
      name: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      district: formData.district,
      skills: formData.skills,
      availability: formData.immediateDeployment ? "AVAILABLE" : "UNAVAILABLE",
      verificationStatus: "PENDING",
    };

    setIsSubmitting(true);
    setStatusMessage("Submitting application...");

    try {
      const response = await registerVolunteer(payload);
      setStatusMessage(
        response?.message || "Volunteer application submitted successfully!",
      );
      setFormData(initialFormState);
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (error) {
      setStatusMessage(
        error.message || "Unable to submit the application right now.",
      );
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card">
      <form onSubmit={handleSubmit} className="volunteer-form">
        {/* Identity Section */}
        <div className="form-section">
          <div className="section-title">
            <span className="title-accent"></span>
            <h2>Personal Details</h2>
          </div>
          <div className="form-grid">
            <div className="input-field">
              <label>FULL NAME</label>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-field">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-field">
              <label>PHONE NUMBER</label>
              <input
                type="tel"
                name="phone"
                placeholder="+94 XX XXX XXXX"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-field">
              <label>DISTRICT</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
              >
                <option value="">Select District</option>
                {districtOptions.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="form-section">
          <div className="section-title">
            <span className="title-accent"></span>
            <h2>Expertise &amp; Skills</h2>
          </div>
          <div className="skills-grid">
            {skillOptions.map((skill) => (
              <label key={skill} className="skill-option">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                />
                <span>{skill}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status & Action */}
        <div className="form-actions">
          <div className="deployment-toggle">
            <label className="toggle">
              <input
                type="checkbox"
                name="immediateDeployment"
                checked={formData.immediateDeployment}
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
            <div className="toggle-text">
              <span className="toggle-title">
                Available for Immediate Deployment
              </span>
              <span className="toggle-subtitle">
                Toggle off if you are currently unavailable
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-btn neon-glow"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        {statusMessage && (
          <div
            className={`status-message ${statusMessage.includes("successfully") ? "success" : "error"}`}
          >
            {statusMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default VolunteerForm;
