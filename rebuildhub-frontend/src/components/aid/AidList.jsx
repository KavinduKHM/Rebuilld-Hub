import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../common/Loader";
import { clearAuthSession } from "../../services/authSession";
import { getAllAids } from "../../services/aidService";
import { FaCalendarCheck } from "react-icons/fa";

import {
	MdArrowForward,
	MdDone,
	MdOutlineFileDownload,
	MdOutlineFilterList,
	MdOutlineLocationOn,
	MdOutlineRefresh,
} from "react-icons/md";
import { FaFirstAid, FaHome, FaTint, FaTshirt, FaUtensils, FaHandsHelping } from "react-icons/fa";

const asText = (value) => (value ?? "").toString().trim();

const isCompletedRequest = (aid) =>
	aid?.distributionStatus === "COMPLETED" && aid?.adminStatus === "APPROVED";

const getAidIcon = (aidType) => {
	const normalized = asText(aidType).toUpperCase();
	if (normalized === "FOOD") return <FaUtensils />;
	if (normalized === "WATER") return <FaTint />;
	if (normalized === "MEDICINE") return <FaFirstAid />;
	if (normalized === "SHELTER") return <FaHome />;
	if (normalized === "CLOTHING") return <FaTshirt />;
	return <FaHandsHelping />;
};

const AidList = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [completedAids, setCompletedAids] = useState([]);

	useEffect(() => {
		fetchCompletedAids();
	}, []);

	const fetchCompletedAids = async () => {
		setLoading(true);
		setError("");

		try {
			const response = await getAllAids();
			const completed = (response.data || []).filter((aid) => isCompletedRequest(aid));
			setCompletedAids(completed);
		} catch (err) {
			setError(err.response?.data?.message || "Unable to load completed aid requests.");
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		clearAuthSession();
		navigate("/", { replace: true });
	};

	return (
		<div className="admin-shell">
			<aside className="admin-sidebar page-card">
				<div>
					<div className="admin-brand">Command Center</div>
					<p className="admin-brand-subtitle">Operational Lead</p>
				</div>

				<div className="admin-status-pill">System Status: Active</div>

				<nav className="admin-nav">
					<Link to="/admin/dashboard" className="admin-nav-link">Disasters</Link>
					<a href="#" className="admin-nav-link">Volunteers</a>
					<a href="#" className="admin-nav-link">Resources</a>
					<Link to="/admin/aid-requests" className="admin-nav-link">Aid Requests</Link>
					<Link to="/admin/aid-completed" className="admin-nav-link admin-nav-link--active">Completed Requests</Link>
				</nav>

				<div className="admin-sidebar-footer">
					<button className="btn-secondary admin-sidebar-action" type="button" onClick={handleLogout}>
						Logout
					</button>
				</div>
			</aside>

			<main className="admin-main">
				<header className="admin-topbar page-card">
					<div>
						<span className="section-label">Aid Operations</span>
						<h1 className="page-title"><FaCalendarCheck />  Completed Requests</h1>
						<p className="page-subtitle">
							Requests moved here after distribution is marked COMPLETED and request decision is finalized.
						</p>
					</div>
					<div className="admin-topbar__meta">
						<span>Total completed: {completedAids.length}</span>
					</div>
				</header>

				<section className="admin-workspace">
					<div className="admin-panel page-card">
						<div style={{ display: "grid", gap: "1rem" }}>
							<div className="admin-panel__header" style={{ marginBottom: 0 }}>
								<div>
									<span className="section-label" style={{ color: "#2f5fbf" }}>Archive & Records</span>
									<h2 style={{ marginBottom: "0.35rem" }}>Completed Requests</h2>
									<p style={{ color: "#5e78a8", maxWidth: "620px" }}>
										A historical log of all successfully fulfilled aid distributions and logistics requests across active zones.
									</p>
								</div>
								<div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
									<button type="button" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
										<MdOutlineFilterList /> Filter
									</button>
									<button type="button" className="btn-secondary">All Time</button>
									<button type="button" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
										<MdOutlineFileDownload /> Export CSV
									</button>
									<Link to="/admin/aid-requests" className="btn-secondary">Back to Active</Link>
									<button type="button" className="btn-secondary" onClick={fetchCompletedAids} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
										<MdOutlineRefresh /> Refresh
									</button>
								</div>
							</div>
						</div>

						{loading ? (
							<Loader />
						) : error ? (
							<p className="empty-state" style={{ color: "#b4232c" }}>{error}</p>
						) : completedAids.length === 0 ? (
							<p className="empty-state">No completed aid requests yet.</p>
						) : (
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
								{completedAids.map((aid) => (
									<article key={aid._id} className="page-card" style={{ padding: "1rem", border: "1px solid rgba(191, 219, 254, 0.72)" }}>
										<div style={{ display: "grid", gap: "0.65rem" }}>
											<div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "0.8rem" }}>
												<div style={{ display: "inline-flex", width: "2.5rem", height: "2.5rem", borderRadius: "12px", background: "#dfe9ff", color: "#1b56cb", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
													{getAidIcon(aid.aidType)}
												</div>
												<span
													style={{
														display: "inline-flex",
														alignItems: "center",
														gap: "0.28rem",
														padding: "0.24rem 0.62rem",
														borderRadius: "999px",
														background: "#e6f7ee",
														color: "#18794e",
														fontSize: "0.66rem",
														fontWeight: 800,
														textTransform: "uppercase",
														letterSpacing: "0.07em",
													}}
												>
													<MdDone /> Completed
												</span>
											</div>

											<div>
												<h3 style={{ marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>{asText(aid.aidType) || "Aid Type"}</h3>
												<p style={{ margin: 0, color: "#2563eb", fontSize: "0.78rem", fontWeight: 700 }}>ID: {asText(aid.damageReportId) || "-"}</p>
											</div>

											<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
												<div>
													<p style={{ margin: 0, fontSize: "0.62rem", color: "#6f84b0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quantity</p>
													<strong style={{ fontSize: "1.2rem", color: "#13294f" }}>{aid.quantity ?? "-"}</strong>
												</div>
												<div>
													<p style={{ margin: 0, fontSize: "0.62rem", color: "#6f84b0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Resource Type</p>
													<strong style={{ fontSize: "1.2rem", color: "#13294f" }}>{asText(aid.aidType) || "-"}</strong>
												</div>
											</div>

											<p style={{ margin: 0, color: "#546c9d", fontSize: "0.9rem" }}>
												<span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
													<MdOutlineLocationOn color="#2563eb" />
													{asText(aid.location?.city) || "City"}, {asText(aid.location?.district) || "District"}, {asText(aid.location?.province) || "Province"}, {asText(aid.location?.country) || "Country"}
												</span>
											</p>

											<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.3rem" }}>
												<div style={{ display: "flex", alignItems: "center" }}>
													<span style={{ width: "1.35rem", height: "1.35rem", borderRadius: "999px", background: "#122b57", border: "2px solid #fff", boxShadow: "0 3px 10px rgba(6, 20, 44, 0.2)" }} />
													<span style={{ width: "1.35rem", height: "1.35rem", borderRadius: "999px", background: "#2f5fc2", border: "2px solid #fff", marginLeft: "-0.35rem", boxShadow: "0 3px 10px rgba(6, 20, 44, 0.2)" }} />
												</div>
												<Link to="/admin/aid-requests" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.82rem", color: "#1f5fd2", fontWeight: 700 }}>
													View Report <MdArrowForward />
												</Link>
											</div>
										</div>
									</article>
								))}
							</div>
						)}

						<div className="page-card" style={{ marginTop: "1rem", padding: "0.8rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#5f79ab" }}>
							<button type="button" className="btn-secondary" style={{ padding: "0.45rem 0.8rem" }}>Previous</button>
							<div style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
								<span style={{ width: "1.75rem", height: "1.75rem", borderRadius: "8px", background: "#2563eb", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>1</span>
								<span style={{ width: "1.75rem", height: "1.75rem", borderRadius: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>2</span>
								<span style={{ width: "1.75rem", height: "1.75rem", borderRadius: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>3</span>
								<span style={{ padding: "0 0.3rem", fontSize: "0.85rem" }}>...</span>
								<span style={{ width: "1.75rem", height: "1.75rem", borderRadius: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>12</span>
							</div>
							<button type="button" className="btn-secondary" style={{ padding: "0.45rem 0.8rem" }}>Next</button>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
};

export default AidList;
