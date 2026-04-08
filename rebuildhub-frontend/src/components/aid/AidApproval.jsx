import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../common/Loader";
import { clearAuthSession } from "../../services/authSession";
import {
	getAllAids,
	updateAidAdminDecision,
	updateAidDistributionStatus,
} from "../../services/aidService";

const asText = (value) => (value ?? "").toString().trim();
const distributionOptions = ["PENDING", "IN_PROGRESS", "COMPLETED"];

const isCompletedRequest = (aid) =>
	aid?.distributionStatus === "COMPLETED" && aid?.adminStatus === "APPROVED";

const AidApproval = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [aids, setAids] = useState([]);
	const [updatingId, setUpdatingId] = useState("");
	const [distributionDraft, setDistributionDraft] = useState({});

	useEffect(() => {
		fetchAids();
	}, []);

	const fetchAids = async () => {
		setLoading(true);
		setError("");

		try {
			const response = await getAllAids();
			setAids(response.data || []);
		} catch (err) {
			setError(err.response?.data?.message || "Unable to load aid requests.");
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		clearAuthSession();
		navigate("/", { replace: true });
	};

	const handleAdminDecision = async (id, decision) => {
		setUpdatingId(id);
		setError("");

		try {
			await updateAidAdminDecision(id, decision);
			await fetchAids();
		} catch (err) {
			setError(err.response?.data?.message || "Unable to update admin decision.");
		} finally {
			setUpdatingId("");
		}
	};

	const handleDistributionSave = async (aid) => {
		const selectedStatus = distributionDraft[aid._id] || aid.distributionStatus || "PENDING";
		setUpdatingId(aid._id);
		setError("");

		try {
			await updateAidDistributionStatus(aid._id, selectedStatus);
			await fetchAids();
		} catch (err) {
			setError(err.response?.data?.message || "Unable to update distribution status.");
		} finally {
			setUpdatingId("");
		}
	};

	const activeAids = aids.filter((aid) => !isCompletedRequest(aid));
	const completedCount = aids.length - activeAids.length;

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
					<Link to="/admin/aid-requests" className="admin-nav-link admin-nav-link--active">Aid Requests</Link>
					<Link to="/admin/aid-completed" className="admin-nav-link">Completed Requests</Link>
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
						<h1 className="page-title">Aid Requests</h1>
						<p className="page-subtitle">
							Requests submitted by users from the Aid Request form.
						</p>
					</div>
					<div className="admin-topbar__meta">
						<span>Active requests: {activeAids.length}</span>
						<span>Completed requests: {completedCount}</span>
						<span>Pending decision: {activeAids.filter((item) => item.adminStatus === "PENDING").length}</span>
					</div>
				</header>

				<section className="admin-workspace">
					<div className="admin-panel page-card">
						<div className="admin-panel__header">
							<div>
								<span className="section-label">Submitted Requests</span>
								<h2>Active Request Queue</h2>
							</div>
							<div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
								<Link to="/weather" className="btn-secondary">Weather Page</Link>
								<Link to="/admin/aid-completed" className="btn-secondary">View Completed</Link>
								<button type="button" className="btn-secondary" onClick={fetchAids}>
									Refresh
								</button>
							</div>
						</div>

						{loading ? (
							<Loader />
						) : error ? (
							<p className="empty-state" style={{ color: "#b4232c" }}>{error}</p>
						) : activeAids.length === 0 ? (
							<p className="empty-state">
								No active aid requests. All completed requests are available in the completed page.
							</p>
						) : (
							<div className="admin-verification-list">
								{activeAids.map((aid) => (
									<article key={aid._id} className="admin-verification-card">
										<div>
											<span className={`status-chip ${aid.adminStatus === "APPROVED" ? "status-chip--verified" : aid.adminStatus === "REJECTED" ? "status-chip--rejected" : "status-chip--pending"}`}>
												Admin: {asText(aid.adminStatus) || "PENDING"}
											</span>
											<h3>{asText(aid.aidType) || "Aid Type"} | Qty: {aid.quantity ?? "-"}</h3>
											<p>
												{asText(aid.location?.city) || "City"}, {asText(aid.location?.district) || "District"}, {asText(aid.location?.province) || "Province"}, {asText(aid.location?.country) || "Country"}
											</p>
											<p style={{ marginTop: "0.3rem" }}>
												Distribution: {asText(aid.distributionStatus) || "PENDING"}
											</p>
											<p style={{ marginTop: "0.3rem", fontSize: "0.8rem", color: "#6f84b3" }}>
												Damage Report ID: {asText(aid.damageReportId) || "-"}
											</p>
										</div>
										<div className="admin-verification-actions">
											<button
												type="button"
												className="btn-primary"
												onClick={() => handleAdminDecision(aid._id, "APPROVED")}
												disabled={updatingId === aid._id}
											>
												{updatingId === aid._id ? "Saving..." : "Approve"}
											</button>
											<button
												type="button"
												className="btn-danger"
												onClick={() => handleAdminDecision(aid._id, "REJECTED")}
												disabled={updatingId === aid._id}
											>
												{updatingId === aid._id ? "Saving..." : "Reject"}
											</button>
											<select
												value={distributionDraft[aid._id] || aid.distributionStatus || "PENDING"}
												onChange={(event) =>
													setDistributionDraft((prev) => ({
														...prev,
														[aid._id]: event.target.value,
													}))
												}
												disabled={updatingId === aid._id}
											>
												{distributionOptions.map((status) => (
													<option key={status} value={status}>{status}</option>
												))}
											</select>
											<button
												type="button"
												className="btn-secondary"
												onClick={() => handleDistributionSave(aid)}
												disabled={updatingId === aid._id}
											>
												{updatingId === aid._id ? "Saving..." : "Update Distribution"}
											</button>
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

export default AidApproval;
