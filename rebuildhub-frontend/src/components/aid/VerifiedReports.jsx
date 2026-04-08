import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDisasters } from "../../services/disasterService";
import Loader from "../common/Loader";

const cleanText = (value) => (value ?? "").toString().trim();

const VerifiedReports = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [verifiedDisasters, setVerifiedDisasters] = useState([]);

	useEffect(() => {
		const fetchVerifiedDisasters = async () => {
			setLoading(true);
			setError("");

			try {
				const response = await getDisasters();
				const list = response.data || [];
				const filtered = list.filter(
					(item) => (item.verificationStatus || "Pending") === "Verified"
				);
				setVerifiedDisasters(filtered);
			} catch (err) {
				setError(err.response?.data?.message || "Unable to load verified disasters.");
			} finally {
				setLoading(false);
			}
		};

		fetchVerifiedDisasters();
	}, []);

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="page-shell">
			<div className="container">
				<div className="page-header">
					<div>
						<span className="section-label">Aid Eligibility</span>
						<h1 className="page-title">Verified Disasters</h1>
						<p className="page-subtitle">
							Choose a verified disaster and continue to the aid request form.
						</p>
					</div>
				</div>

				{error ? (
					<p className="empty-state" style={{ color: "#b4232c" }}>{error}</p>
				) : verifiedDisasters.length === 0 ? (
					<p className="empty-state">No verified disasters found right now.</p>
				) : (
					<div className="page-grid page-grid--cards">
						{verifiedDisasters.map((disaster) => (
							<article key={disaster._id} className="page-card detail-stack">
								<div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
									<h2 style={{ margin: 0 }}>{cleanText(disaster.title) || "Untitled Disaster"}</h2>
									<span className="status-chip status-chip--verified">Verified</span>
								</div>

								<p><strong>Type:</strong> {cleanText(disaster.type) || "-"}</p>
								<p><strong>Severity:</strong> {cleanText(disaster.severityLevel) || "-"}</p>
								<p><strong>Description:</strong> {cleanText(disaster.description) || "-"}</p>
								<p>
									<strong>Location:</strong>{" "}
									{cleanText(disaster.location?.name || disaster.location?.address) || "Location unavailable"}
								</p>

								<div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
									<Link to={`/disasters/${disaster._id}`} className="btn-secondary">View Details</Link>
									<Link
										to="/aid/request"
										state={{ disasterId: disaster._id, disasterTitle: disaster.title }}
										className="btn-primary"
									>
										Request Aid
									</Link>
								</div>
							</article>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default VerifiedReports;
