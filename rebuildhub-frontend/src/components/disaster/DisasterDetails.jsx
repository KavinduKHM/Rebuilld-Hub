import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getDisasterById } from "../../services/disasterService";
import { getReportsByDisaster, verifyReport } from "../../services/damageService";
import Loader from "../common/Loader";

// Fix Leaflet marker icons for React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DisasterDetails = () => {
  const { id } = useParams();
  const [disaster, setDisaster] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [disRes, repRes] = await Promise.all([
        getDisasterById(id),
        getReportsByDisaster(id)
      ]);
      setDisaster(disRes.data);
      setReports(repRes.data.data || []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (reportId, status) => {
    try {
      await verifyReport(reportId, status);
      alert(`Report marked as ${status}`);
      fetchData();
    } catch (err) {
      alert("Verification failed");
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="empty-state">{error}</p>;

  return (
    <div className="page-shell">
      <div className="container detail-stack">
        <div className="page-header">
          <div>
            <span className="section-label">Disaster Detail</span>
            <h1 className="page-title">{disaster.title}</h1>
            <p className="page-subtitle">
              {disaster.location?.name} {disaster.location?.latitude && disaster.location?.longitude ? `(${disaster.location.latitude}, ${disaster.location.longitude})` : ""}
            </p>
          </div>
        </div>

        <div className="page-card detail-stack">
          <p><strong>Type:</strong> {disaster.type}</p>
          <p><strong>Severity:</strong> {disaster.severityLevel}</p>
          <p><strong>Description:</strong> {disaster.description}</p>
          {disaster.images?.length > 0 && (
            <div>
              <h4>Evidence Images:</h4>
              <div className="media-grid">
                {disaster.images.map((img, i) => <img key={i} src={img} alt="disaster" style={{ width: "200px", height: "140px" }} />)}
              </div>
            </div>
          )}
        </div>

        <div className="page-card detail-stack">
          <h3 style={{ marginBottom: 0 }}>Auto-Generated Damage Report</h3>
          {reports.length === 0 && <p>No report generated yet.</p>}
          {reports.map(report => (
            <div key={report._id} className="page-card" style={{ marginTop: 0 }}>
              <p><strong>Reporter:</strong> {report.reporterName}</p>
              <p><strong>Damage Type:</strong> {report.damageType}</p>
              <p><strong>Description:</strong> {report.damageDescription}</p>
              <p><strong>Estimated Loss:</strong> ${report.estimatedLoss}</p>
              <p><strong>Status:</strong> <span className={`status-chip ${report.verificationStatus === "Verified" ? "status-chip--verified" : report.verificationStatus === "Rejected" ? "status-chip--rejected" : "status-chip--pending"}`}>{report.verificationStatus}</span></p>
              {report.googleMap && (
                <div>
                  <a href={report.googleMap.viewLocation} target="_blank" rel="noopener noreferrer" className="btn-secondary">View on Google Maps</a>
                </div>
              )}
              {role === "authority" && report.verificationStatus === "Pending" && (
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <button onClick={() => handleVerify(report._id, "Verified")} className="btn-primary">Verify</button>
                  <button onClick={() => handleVerify(report._id, "Rejected")} className="btn-danger">Reject</button>
                </div>
              )}
            </div>
          ))}

          {disaster.location?.latitude && disaster.location?.longitude && (
            <div className="map-panel">
              <h4>Location Map:</h4>
              <MapContainer
                center={[Number(disaster.location.latitude), Number(disaster.location.longitude)]}
                zoom={13}
                style={{ height: "320px" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[Number(disaster.location.latitude), Number(disaster.location.longitude)]}>
                  <Popup>{disaster.location.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterDetails;