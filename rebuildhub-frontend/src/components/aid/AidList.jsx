import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../common/Loader";
import { clearAuthSession } from "../../services/authSession";
import { getAllAids } from "../../services/aidService";

const asText = (value) => (value ?? "").toString().trim();

const isCompletedRequest = (aid) =>
	aid?.distributionStatus === "COMPLETED" && aid?.adminStatus === "APPROVED";

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
						<h1 className="page-title">Completed Requests</h1>
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
						<div className="admin-panel__header">
							<div>
								<span className="section-label">Archive</span>
								<h2>Completed Aid Queue</h2>
							</div>
							<div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
								<Link to="/admin/aid-requests" className="btn-secondary">Back to Active</Link>
								<button type="button" className="btn-secondary" onClick={fetchCompletedAids}>Refresh</button>
							</div>
						</div>

						{loading ? (
							<Loader />
						) : error ? (
							<p className="empty-state" style={{ color: "#b4232c" }}>{error}</p>
						) : completedAids.length === 0 ? (
							<p className="empty-state">No completed aid requests yet.</p>
						) : (
							<div className="admin-verification-list">
								{completedAids.map((aid) => (
									<article key={aid._id} className="admin-verification-card">
										<div>
											<span className="status-chip status-chip--verified">Completed</span>
											<h3>{asText(aid.aidType) || "Aid Type"} | Qty: {aid.quantity ?? "-"}</h3>
											<p>
												{asText(aid.location?.city) || "City"}, {asText(aid.location?.district) || "District"}, {asText(aid.location?.province) || "Province"}, {asText(aid.location?.country) || "Country"}
											</p>
											<p style={{ marginTop: "0.3rem" }}>
												Admin: {asText(aid.adminStatus) || "PENDING"} | Distribution: {asText(aid.distributionStatus) || "PENDING"}
											</p>
											<p style={{ marginTop: "0.3rem", fontSize: "0.8rem", color: "#6f84b3" }}>
												Damage Report ID: {asText(aid.damageReportId) || "-"}
											</p>
										</div>
									</article>
								))}
							</div>
						)}
					</div>
				</section>
			</main>
		</div>
	);
};

export default AidList;
