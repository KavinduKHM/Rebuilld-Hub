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
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>{disaster.title}</h2>
      <p><strong>Type:</strong> {disaster.type}</p>
      <p><strong>Severity:</strong> {disaster.severityLevel}</p>
      <p><strong>Location:</strong> {disaster.location?.name} ({disaster.location?.latitude}, {disaster.location?.longitude})</p>
      <p><strong>Description:</strong> {disaster.description}</p>
      {disaster.images?.length > 0 && (
        <div>
          <h4>Evidence Images:</h4>
          {disaster.images.map((img, i) => <img key={i} src={img} alt="disaster" style={{ width: "200px", margin: "5px" }} />)}
        </div>
      )}

      <h3>Auto-Generated Damage Report</h3>
      {reports.length === 0 && <p>No report generated yet.</p>}
      {reports.map(report => (
        <div key={report._id} style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem 0" }}>
          <p><strong>Reporter:</strong> {report.reporterName}</p>
          <p><strong>Damage Type:</strong> {report.damageType}</p>
          <p><strong>Description:</strong> {report.damageDescription}</p>
          <p><strong>Estimated Loss:</strong> ${report.estimatedLoss}</p>
          <p><strong>Status:</strong> {report.verificationStatus}</p>
          {report.googleMap && (
            <div>
              <a href={report.googleMap.viewLocation} target="_blank" rel="noopener noreferrer">View on Google Maps</a>
            </div>
          )}
          {role === "authority" && report.verificationStatus === "Pending" && (
            <div>
              <button onClick={() => handleVerify(report._id, "Verified")}>Verify</button>
              <button onClick={() => handleVerify(report._id, "Rejected")}>Reject</button>
            </div>
          )}
        </div>
      ))}

      {disaster.location?.latitude && disaster.location?.longitude && (
        <div style={{ margin: "1rem 0" }}>
          <h4>Location Map:</h4>
          <MapContainer
            center={[Number(disaster.location.latitude), Number(disaster.location.longitude)]}
            zoom={13}
            style={{ height: "320px", borderRadius: "8px", overflow: "hidden", border: "1px solid #ccc" }}
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
  );
};

export default DisasterDetails;