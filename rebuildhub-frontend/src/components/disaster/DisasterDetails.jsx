import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getDisasterById } from "../../services/disasterService";
import { getReportsByDisaster, verifyReport } from "../../services/damageService";
import { verifyDisaster } from "../../services/disasterService";
import Loader from "../common/Loader";

// Fix Leaflet marker icons for React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const formatDate = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "N/A";
  return `$${amount.toLocaleString()}`;
};

const normalizeText = (value) => (value ?? "").toString().trim();

const getVerificationClass = (status) => {
  if (status === "Verified" || status === "Approved") return "status-chip--verified";
  if (status === "Rejected") return "status-chip--rejected";
  return "status-chip--pending";
};

const getSeverityClass = (severity) => {
  if (severity === "Critical") return "incident-badge--critical";
  if (severity === "High") return "incident-badge--high";
  if (severity === "Medium") return "incident-badge--medium";
  return "incident-badge--low";
};

const DisasterDetails = () => {
  const { id } = useParams();
  const [disaster, setDisaster] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = localStorage.getItem("role");

  const fetchData = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVerify = async (reportId, status) => {
    try {
      await verifyReport(reportId, status);
      alert(`Report marked as ${status}`);
      fetchData();
    } catch (err) {
      alert("Verification failed");
    }
  };

  const handleVerifyDisaster = async (status) => {
    try {
      await verifyDisaster(id, status);
      alert(`Disaster marked as ${status}`);
      fetchData();
    } catch (err) {
      alert("Disaster verification failed");
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="empty-state">{error}</p>;

  const verificationStatus = disaster.verificationStatus || "Pending";
  const locationLabel = normalizeText(disaster.location?.name) || "Location pending";
  const reporterCount = reports.filter((report) => normalizeText(report.reporterName)).length;

  const operationalLogs = [
    {
      title: "Disaster record opened",
      detail: `${formatDate(disaster.createdAt)} • ${locationLabel}`,
      time: "T-0",
      tone: "neutral",
    },
    ...reports.slice(0, 4).map((report, index) => ({
      title: normalizeText(report.reporterName) || `Field report ${index + 1}`,
      detail: normalizeText(report.damageDescription) || "Damage report submitted.",
      time: formatDate(report.updatedAt || report.createdAt),
      tone: report.verificationStatus === "Rejected" ? "risk" : (report.verificationStatus === "Verified" || report.verificationStatus === "Approved") ? "safe" : "neutral",
    })),
  ];

  return (
    <div className="page-shell disaster-detail-shell">
      <div className="container container--wide detail-stack">
        <header className="page-card detail-command-strip">
          <div>
            <span className="section-label">Incident Command</span>
            <p className="page-subtitle">Last synchronized: {formatDate(disaster.updatedAt || disaster.createdAt)}</p>
          </div>
          <div className="detail-command-actions">
            <button type="button" className="btn-secondary">Request Intel</button>
            {role === "admin" && verificationStatus === "Pending" ? (
              <>
                <button type="button" className="btn-danger" onClick={() => handleVerifyDisaster("Rejected")}>Reject</button>
                <button type="button" className="btn-primary" onClick={() => handleVerifyDisaster("Verified")}>Verify Disaster</button>
              </>
            ) : (
              <span className={`status-chip ${getVerificationClass(verificationStatus)}`}>{verificationStatus}</span>
            )}
          </div>
        </header>

        <section className="detail-layout-grid">
          <div className="detail-main-column">
            <article className="page-card incident-card">
              <div className="incident-card__head">
                <span className={`incident-badge ${getSeverityClass(disaster.severityLevel)}`}>
                  Severity: {disaster.severityLevel || "Unknown"}
                </span>
                <span className="incident-badge incident-badge--status">Status: {verificationStatus}</span>
              </div>

              <h2>{disaster.title}</h2>

              <div className="incident-meta-row">
                <span>{disaster.type || "Unknown"}</span>
                <span>{formatDate(disaster.createdAt)}</span>
                <span>{locationLabel}</span>
              </div>

              <p className="incident-description">{disaster.description}</p>
            </article>

            <article className="page-card evidence-panel">
              <div className="evidence-panel__header">
                <h3>Visual Evidence Assets</h3>
                <span>{disaster.images?.length || 0} files detected</span>
              </div>

              {disaster.images?.length > 0 ? (
                <div className="evidence-grid">
                  {disaster.images.map((img, index) => (
                    <img key={`${img}-${index}`} src={img} alt="disaster evidence" />
                  ))}
                </div>
              ) : (
                <p className="empty-state">No visual evidence has been uploaded.</p>
              )}
            </article>

            <article className="page-card operation-log-panel">
              <h3>Operation Log</h3>
              <div className="operation-log-list">
                {operationalLogs.map((entry, index) => (
                  <div key={`${entry.title}-${index}`} className="operation-log-item">
                    <span className={`operation-log-dot operation-log-dot--${entry.tone}`} />
                    <div>
                      <strong>{entry.title}</strong>
                      <p>{entry.detail}</p>
                    </div>
                    <small>{entry.time}</small>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="detail-side-column">
            <article className="page-card detail-map-panel">
              <h3>Live Location</h3>
              {disaster.location?.latitude && disaster.location?.longitude ? (
                <MapContainer
                  center={[Number(disaster.location.latitude), Number(disaster.location.longitude)]}
                  zoom={12}
                  style={{ height: "250px" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[Number(disaster.location.latitude), Number(disaster.location.longitude)]}>
                    <Popup>{locationLabel}</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <p className="empty-state">Coordinates are not available.</p>
              )}
            </article>

            <article className="page-card assessments-panel">
              <h3>Validated Assessments</h3>

              {reports.length === 0 ? (
                <p className="empty-state">No reports generated yet.</p>
              ) : (
                <div className="assessment-list">
                  {reports.map((report) => (
                    <div key={report._id} className="assessment-card">
                      <div className="assessment-card__header">
                        <strong>{normalizeText(report.reporterName) || "Unknown reporter"}</strong>
                        <span className={`status-chip ${getVerificationClass(report.verificationStatus)}`}>
                          {report.verificationStatus || "Pending"}
                        </span>
                      </div>

                      <p className="assessment-card__type">{report.damageType || "Damage Report"}</p>
                      <p className="assessment-card__description">{report.damageDescription}</p>

                      <div className="assessment-card__footer">
                        <span>Estimated loss</span>
                        <strong>{formatCurrency(report.estimatedLoss)}</strong>
                      </div>

                      <div className="assessment-card__actions">
                        <Link to={`/damage/${report._id}`} className="btn-secondary">
                          View Full Report
                        </Link>
                        {report.googleMap?.viewLocation && (
                          <a href={report.googleMap.viewLocation} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                            Open Map
                          </a>
                        )}
                        {role === "admin" && report.verificationStatus === "Pending" && (
                          <>
                            <button type="button" className="btn-primary" onClick={() => handleVerify(report._id, "Approved")}>Approve</button>
                            <button type="button" className="btn-danger" onClick={() => handleVerify(report._id, "Rejected")}>Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </aside>
        </section>

        <section className="detail-bottom-metrics page-card">
          <div>
            <span>Disaster Type</span>
            <strong>{disaster.type || "Unknown"}</strong>
          </div>
          <div>
            <span>Severity</span>
            <strong>{disaster.severityLevel || "Unknown"}</strong>
          </div>
          <div>
            <span>Reports</span>
            <strong>{reports.length}</strong>
          </div>
          <div>
            <span>Contributors</span>
            <strong>{reporterCount}</strong>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DisasterDetails;