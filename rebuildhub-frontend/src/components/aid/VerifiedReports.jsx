import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDisasters } from "../../services/disasterService";
import Loader from "../common/Loader";
import { MdOutlineLocationOn, MdVerified } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";

const cleanText = (value) => (value ?? "").toString().trim();

const getSeverityTone = (severityLevel) => {
	const normalized = cleanText(severityLevel).toUpperCase();

	if (normalized === "CRITICAL" || normalized === "HIGH") {
		return {
			background: "#fde8ea",
			color: "#b4232d",
			border: "1px solid rgba(220, 76, 91, 0.3)",
			label: normalized || "HIGH",
		};
	}

	if (normalized === "MEDIUM") {
		return {
			background: "#fff4dc",
			color: "#b86d06",
			border: "1px solid rgba(245, 173, 64, 0.35)",
			label: normalized,
		};
	}

	return {
		background: "#e8f1ff",
		color: "#2057b7",
		border: "1px solid rgba(102, 145, 221, 0.28)",
		label: normalized || "LOW",
	};
};

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
			<div className="container" style={{ maxWidth: "1360px" }}>
				<div className="page-header" style={{ marginBottom: "1.8rem" }}>
					<div>
						<span className="section-label" style={{ color: "#192bc2", fontSize: "0.8rem"}}>Aid Registry</span>
						<h2 className="page-title" fontSize="1.25rem"><RiVerifiedBadgeFill />  Verified Disaster Evidence & Requests Submit</h2>
						<p className="page-subtitle" style={{ color: "#5e78aa", maxWidth: "1480px" }}>
							Choose a verified disaster and continue to the aid request form. Our ground teams have confirmed the following events as eligible for expedited relief.
						</p>
					</div>
				</div>

				{error ? (
					<p className="empty-state" style={{ color: "#b4232c" }}>{error}</p>
				) : verifiedDisasters.length === 0 ? (
					<p className="empty-state">No verified disasters found right now.</p>
				) : (
					<div className="page-grid page-grid--cards" style={{ gap: "1.2rem" }}>
						{verifiedDisasters.map((disaster) => {
							const primaryImage = Array.isArray(disaster.images) && disaster.images.length > 0
								? disaster.images[0]
								: "";

							return (
							<article key={disaster._id} className="page-card detail-stack" style={{ padding: "1.15rem" }}>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem" }}>
									<div style={{ display: "flex", gap: "0.45rem", alignItems: "center", flexWrap: "wrap" }}>
										<span
											style={{
												display: "inline-flex",
												alignItems: "center",
												gap: "0.3rem",
												padding: "0.22rem 0.55rem",
												borderRadius: "999px",
												background: "#e6f7ee",
												color: "#18794e",
												fontSize: "0.66rem",
												fontWeight: 800,
												textTransform: "uppercase",
												letterSpacing: "0.07em",
											}}
										>
											<MdVerified /> Verified
										</span>
										<span
											style={{
												display: "inline-flex",
												alignItems: "center",
												padding: "0.22rem 0.55rem",
												borderRadius: "999px",
												fontSize: "0.66rem",
												fontWeight: 800,
												textTransform: "uppercase",
												letterSpacing: "0.07em",
												...getSeverityTone(disaster.severityLevel),
											}}
										>
											Severity: {getSeverityTone(disaster.severityLevel).label}
										</span>
									</div>
									<div
										style={{
											width: "2.1rem",
											height: "2.1rem",
											borderRadius: "12px",
											background: "rgba(37, 99, 235, 0.12)",
											display: "grid",
											placeItems: "center",
											color: "#1b56cb",
											fontSize: "1.1rem",
										}}
									>
										<MdVerified />
									</div>
								</div>

								{primaryImage ? (
									<img
										src={primaryImage}
										alt={cleanText(disaster.title) || "Disaster"}
										style={{
											width: "100%",
											height: "180px",
											objectFit: "cover",
											borderRadius: "14px",
											border: "1px solid rgba(191, 219, 254, 0.6)",
										}}
									/>
								) : (
									<div
										style={{
											width: "100%",
											height: "180px",
											borderRadius: "14px",
											border: "1px solid rgba(191, 219, 254, 0.6)",
											background: "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(37,99,235,0.06))",
											display: "grid",
											placeItems: "center",
											color: "#5f79aa",
											fontSize: "0.86rem",
										}}
									>
										No image available
									</div>
								)}

								<h2 style={{ margin: 0, fontSize: "1.8rem", letterSpacing: "-0.03em" }}>
									{cleanText(disaster.title) || "Untitled Disaster"}
								</h2>

								<p>
									<span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#5e78aa", fontSize: "0.9rem" }}>
										<MdOutlineLocationOn />
										{cleanText(disaster.location?.name || disaster.location?.address) || "Location unavailable"}
									</span>
								</p>

								<p
									style={{
										margin: 0,
										padding: "0.68rem 0.75rem",
										borderRadius: "10px",
										background: "#eef2f9",
										color: "#657ba9",
										fontSize: "0.86rem",
										lineHeight: 1.45,
									}}
								>
									{cleanText(disaster.description) || "No description available."}
								</p>

								<div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.65rem", alignItems: "center" }}>
									<Link
										to="/aid/request"
										state={{ disasterId: disaster._id, disasterTitle: disaster.title }}
										className="btn-primary"
										style={{ justifyContent: "center", minHeight: "42px",background: "#1560BD" }}
									>
										Request Aid
									</Link>
									<Link to={`/disasters/${disaster._id}`} className="btn-secondary" style={{ minHeight: "42px" }}>View Details</Link>
								</div>
							</article>
							);
						})}
					</div>
				)}

				<div
					className="page-card"
					style={{
						marginTop: "1.8rem",
						background: "rgba(255,255,255,0.55)",
						border: "1px dashed rgba(137, 170, 235, 0.65)",
						boxShadow: "none",
						padding: "2.4rem 1.2rem",
						textAlign: "center",
					}}
				>
					<div
						style={{
							width: "2.2rem",
							height: "2.2rem",
							borderRadius: "999px",
							margin: "0 auto 0.9rem",
							background: "rgba(37, 99, 235, 0.12)",
							display: "grid",
							placeItems: "center",
							color: "#1b56cb",
						}}
					>
						<MdVerified />
					</div>
					<h3 style={{ marginBottom: "0.4rem" }}>Can&apos;t find a disaster?</h3>
					<p style={{ color: "#6880af", maxWidth: "420px", margin: "0 auto 1rem", lineHeight: 1.5 }}>
						If you are witnessing an unlisted emergency, report it immediately to our dispatch center.
					</p>
					<Link to="/disasters/new" className="btn-secondary">Report New Event</Link>
				</div>
			</div>
		</div>
	);
};

export default VerifiedReports;
