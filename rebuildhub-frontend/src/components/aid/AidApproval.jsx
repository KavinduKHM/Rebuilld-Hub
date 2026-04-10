import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../common/Loader";
import { clearAuthSession } from "../../services/authSession";
import { PiFirstAidFill } from "react-icons/pi";
import { GiFirstAidKit } from "react-icons/gi";

import {
	MdCloudQueue,
	MdLocalShipping,
	MdOutlineChecklist,
	MdOutlineLocationOn,
	MdOutlineRefresh,
	MdPending,
} from "react-icons/md";
import { FaFirstAid, FaHandsHelping, FaTshirt, FaUtensils, FaMoneyBillWave } from "react-icons/fa";
import {
	getAllAids,
	updateAidAdminDecision,
	updateAidDistributionStatus,
} from "../../services/aidService";
import resourceService from "../../services/resourceService";

const asText = (value) => (value ?? "").toString().trim();
const distributionOptions = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const districtWatchlist = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Galle", "Matara", "Jaffna", "Trincomalee"];

const getAidIcon = (aidType) => {
	const normalized = asText(aidType).toUpperCase();
	if (normalized === "FOOD") return <FaUtensils />;
	if (normalized === "CLOTH") return <FaTshirt />;
	if (normalized === "SANITORY") return <FaFirstAid />;
	if (normalized === "MONEY") return <FaMoneyBillWave />;
	return <FaHandsHelping />;
};

const getAdminTone = (adminStatus) => {
	const normalized = asText(adminStatus).toUpperCase();
	if (normalized === "APPROVED") {
		return { background: "#e5f7eb", color: "#18794e" };
	}
	if (normalized === "REJECTED") {
		return { background: "#fde8ea", color: "#c0343a" };
	}
	return { background: "#fff3d6", color: "#9b6b00" };
};

const getDistributionTone = (distributionStatus) => {
	const normalized = asText(distributionStatus).toUpperCase();
	if (normalized === "COMPLETED") {
		return { color: "#18794e", bullet: "#26a36f", label: "COMPLETED" };
	}
	if (normalized === "IN_PROGRESS") {
		return { color: "#0f56cc", bullet: "#2563eb", label: "DISPATCHING" };
	}
	return { color: "#b4232d", bullet: "#c0343a", label: "PENDING" };
};

const isCompletedRequest = (aid) =>
	aid?.distributionStatus === "COMPLETED" && aid?.adminStatus === "APPROVED";

const getDistrictLoadTone = (activeCount) => {
	if (activeCount >= 5) {
		return {
			label: "Critical Overload",
			color: "#b4232d",
			background: "rgba(220, 38, 38, 0.16)",
			border: "1px solid rgba(220, 38, 38, 0.35)",
		};
	}

	if (activeCount >= 3) {
		return {
			label: "High Demand",
			color: "#b86d06",
			background: "rgba(245, 158, 11, 0.16)",
			border: "1px solid rgba(245, 158, 11, 0.36)",
		};
	}

	if (activeCount >= 1) {
		return {
			label: "Stable",
			color: "#18794e",
			background: "rgba(22, 163, 74, 0.16)",
			border: "1px solid rgba(22, 163, 74, 0.34)",
		};
	}

	return {
		label: "No Active Requests",
		color: "#64748b",
		background: "rgba(100, 116, 139, 0.14)",
		border: "1px solid rgba(100, 116, 139, 0.3)",
	};
};

const AidApproval = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [aids, setAids] = useState([]);
	const [updatingId, setUpdatingId] = useState("");
	const [distributionDraft, setDistributionDraft] = useState({});
	const [inventoryTotals, setInventoryTotals] = useState({
		Food: 0,
		Cloth: 0,
		Sanitory: 0,
		Money: 0,
	});

	useEffect(() => {
		fetchAids();
		fetchInventoryTotals();
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

	const fetchInventoryTotals = async () => {
		try {
			const inventory = await resourceService.getAllInventory();
			const totals = inventory.reduce(
				(acc, item) => {
					if (item.type === "MONEY") {
						acc.Money += Number(item.totalAmount || 0);
						return acc;
					}

					if (item.type === "STOCK" && acc[item.category] !== undefined) {
						acc[item.category] += Number(item.totalQuantity || 0);
					}

					return acc;
				},
				{ Food: 0, Cloth: 0, Sanitory: 0, Money: 0 }
			);

			setInventoryTotals(totals);
		} catch (err) {
			// Keep existing totals when inventory API fails.
		}
	};

	const handleAdminDecision = async (id, decision) => {
		setUpdatingId(id);
		setError("");

		try {
			await updateAidAdminDecision(id, decision);
			await Promise.all([fetchAids(), fetchInventoryTotals()]);
		} catch (err) {
			setError(err.response?.data?.message || "Unable to update admin decision.");
		} finally {
			setUpdatingId("");
		}
	};

	const handleDistributionSave = async (aid) => {
		if (asText(aid.adminStatus).toUpperCase() !== "APPROVED") {
			return;
		}

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
	const pendingCount = activeAids.filter((item) => item.adminStatus === "PENDING").length;
	const operationalAids = aids.filter(
		(aid) =>
			asText(aid.adminStatus).toUpperCase() !== "REJECTED" &&
			asText(aid.distributionStatus).toUpperCase() !== "COMPLETED"
	);
	const districtDemandCounts = operationalAids.reduce((acc, aid) => {
		const district = asText(aid.location?.district);
		if (!district) {
			return acc;
		}

		acc[district] = (acc[district] || 0) + 1;
		return acc;
	}, {});
	const districtNames = Array.from(
		new Set([
			...districtWatchlist,
			...operationalAids.map((aid) => asText(aid.location?.district)).filter(Boolean),
		])
	);
	const districtStatusItems = districtNames.map((district) => {
		const activeCount = districtDemandCounts[district] || 0;
		return {
			district,
			activeCount,
			tone: getDistrictLoadTone(activeCount),
		};
	});

	return (
		<div className="tac-shell">
			<aside className="tac-sidebar">
				<div>
					<h1>Tactical Command</h1>
					<span className="tac-sidebar-subtitle">Sector 7G - Active</span>
				</div>

				<nav className="admin-nav">
					<Link to="/admin/dashboard" className="admin-nav-link">Disasters</Link>
					<Link to="/admin/volunteers" className="admin-nav-link">Volunteers</Link>
					<Link to="/admin/resources" className="admin-nav-link">Resources</Link>
					<Link to="/admin/aid-requests" className="admin-nav-link admin-nav-link--active">Aid Requests</Link>
					<Link to="/admin/aid-completed" className="admin-nav-link">Completed Requests</Link>
				</nav>

				<div className="tac-sidebar-footer">
					<button className="btn-secondary" type="button" onClick={handleLogout}>
						Logout
					</button>
				</div>
			</aside>

			<main className="tac-main admin-main">
				<header
					className="admin-topbar page-card"
					style={{
						background: "linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(239, 245, 255, 0.92))",
						border: "1px solid rgba(191, 219, 254, 0.72)",
						padding: "1.45rem 1.35rem",
					}}
				>
					<div style={{ maxWidth: "620px" }}>
						<h1 className="page-title" style={{ marginBottom: "0.25rem", fontSize: "clamp(2.2rem, 2vw, 3.35rem)", lineHeight: 1.02 }}><GiFirstAidKit />  Aid Requests</h1>
						<p className="page-subtitle" style={{ maxWidth: "560px", color: "#415a88", lineHeight: 1.45 }}>
							Requests submitted by users from the Aid Request form.
							 Triage and coordinate rapid response protocols.
						</p>
					</div>
					<div
						className="admin-topbar__meta"
						style={{
							minWidth: "304px",
							padding: "0.45rem 0.25rem",
							borderRadius: "14px",
							background: "rgba(255,255,255,0.86)",
							border: "1px solid rgba(191, 219, 254, 0.8)",
							display: "grid",
							gridTemplateColumns: "1fr 1fr 1fr",
							gap: 0,
							overflow: "hidden",
						}}
					>
						<div style={{ textAlign: "center", padding: "0.45rem 0.2rem", borderRight: "1px solid rgba(191, 219, 254, 0.72)" }}>
							<p style={{ margin: 0, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2b63c9" }}>Active</p>
							<strong style={{ fontSize: "2rem", lineHeight: 1.05, color: "#2b63c9" }}>{activeAids.length}</strong>
						</div>
						<div style={{ textAlign: "center", padding: "0.45rem 0.2rem", borderRight: "1px solid rgba(191, 219, 254, 0.72)" }}>
							<p style={{ margin: 0, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b8eb8" }}>Completed</p>
							<strong style={{ fontSize: "2rem", lineHeight: 1.05, color: "#7b8eb8" }}>{completedCount}</strong>
						</div>
						<div style={{ textAlign: "center", padding: "0.45rem 0.2rem" }}>
							<p style={{ margin: 0, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#d04146" }}>Pending</p>
							<strong style={{ fontSize: "2rem", lineHeight: 1.05, color: "#d04146" }}>{pendingCount}</strong>
						</div>
					</div>
				</header>

				<div className="page-card" style={{ padding: "1rem", marginTop: "0.95rem" }}>
					<h3 style={{ marginBottom: "0.85rem" }}>Inventory By Category</h3>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "0.62rem" }}>
						{[
							{ key: "Food", label: "Food", value: inventoryTotals.Food, suffix: "units", tone: "#1f5fd2", icon: <FaUtensils /> },
							{ key: "Cloth", label: "Cloth", value: inventoryTotals.Cloth, suffix: "units", tone: "#5e78aa", icon: <FaTshirt /> },
							{ key: "Sanitory", label: "Sanitory", value: inventoryTotals.Sanitory, suffix: "units", tone: "#0f56cc", icon: <FaFirstAid /> },
							{ key: "Money", label: "Money / Donations", value: inventoryTotals.Money, suffix: "LKR", tone: "#18794e", icon: <FaMoneyBillWave /> },
						].map((item) => (
							<div
								key={item.key}
								style={{
									display: "grid",
									gridTemplateColumns: "auto 1fr",
									alignItems: "center",
									columnGap: "0.65rem",
									padding: "0.58rem 0.72rem",
									borderRadius: "10px",
									background: "rgba(237, 245, 255, 0.9)",
									border: "1px solid rgba(191, 219, 254, 0.72)",
								}}
							>
								<span
									style={{
										width: "2rem",
										height: "2rem",
										borderRadius: "10px",
										display: "inline-flex",
										alignItems: "center",
										justifyContent: "center",
										color: item.tone,
										background: "rgba(255, 255, 255, 0.9)",
										border: "1px solid rgba(191, 219, 254, 0.9)",
									}}
								>
									{item.icon}
								</span>
								<div style={{ display: "grid", gap: "0.12rem" }}>
									<p style={{ margin: 0, color: "#4a6797", fontWeight: 700, fontSize: "0.82rem" }}>{item.label}</p>
									<strong style={{ color: item.tone, fontSize: "0.9rem" }}>
										{item.suffix === "LKR"
											? `LKR ${Number(item.value || 0).toLocaleString()}`
											: `${Number(item.value || 0).toLocaleString()} ${item.suffix}`}
									</strong>
								</div>
							</div>
						))}
					</div>
					<p style={{ marginTop: "0.8rem", color: "#6f84b0", fontSize: "0.79rem" }}>
						Totals update automatically after each admin approval.
					</p>
				</div>

				<section className="admin-workspace">
					<div className="admin-panel page-card">
						<div className="admin-panel__header">
							<div>
								<span className="section-label">Submitted Requests</span>
								<h2>Active Request Queue <span style={{ marginLeft: "0.4rem", fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#3764bf", background: "#dbe8ff", padding: "0.18rem 0.45rem", borderRadius: "6px" }}>Priority Triage</span></h2>
							</div>
							<div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
								<Link
									to="/weather"
									className="btn-secondary"
									style={{
										display: "inline-flex",
										alignItems: "center",
										gap: "0.35rem",
										background: "linear-gradient(135deg, #028A0F , #23d02e   )",
										color: "#ffffff",
										border: "0px solid rgb(53, 94, 59)",
										boxShadow: "0 0px 3px rgb(53, 94, 59)",
									}}
								>
									<MdCloudQueue /> Weather
								</Link>
								<Link to="/admin/aid-completed" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#1b56cb"}}><MdOutlineChecklist /> View Completed</Link>
								<button type="button" className="btn-secondary" onClick={fetchAids}>
									<span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}><MdOutlineRefresh /> Refresh</span>
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
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1rem" }}>
								{activeAids.map((aid) => (
									<article key={aid._id} className="page-card" style={{ padding: "1rem" }}>
										<div>
											<div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center" }}>
												<div style={{ display: "inline-flex", width: "2.5rem", height: "2.5rem", borderRadius: "12px", background: "#dfe9ff", color: "#1b56cb", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
													{getAidIcon(aid.aidType)}
												</div>
												<span
													style={{
														display: "inline-flex",
														alignItems: "center",
														padding: "0.26rem 0.65rem",
														borderRadius: "999px",
														fontSize: "0.66rem",
														fontWeight: 800,
														textTransform: "uppercase",
														letterSpacing: "0.07em",
														...getAdminTone(aid.adminStatus),
													}}
												>
													Admin: {asText(aid.adminStatus) || "PENDING"}
												</span>
											</div>

											<h3 style={{ marginTop: "0.7rem", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>{asText(aid.aidType) || "Aid Type"}</h3>
											<p style={{ color: "#1b56cb", fontWeight: 700, marginBottom: "0.6rem" }}>
												Quantity: {aid.quantity ?? "-"} {aid.quantityUnit === "RUPEES" || asText(aid.aidType).toUpperCase() === "MONEY" ? "LKR" : "Units"}
											</p>

											<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", borderTop: "1px solid rgba(191, 219, 254, 0.55)", borderBottom: "1px solid rgba(191, 219, 254, 0.55)", padding: "0.7rem 0", marginBottom: "0.8rem" }}>
												<div>
													<p style={{ fontSize: "0.64rem", color: "#7b90ba", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>Primary Location</p>
													<p style={{ margin: 0, color: "#546c9d", fontSize: "0.9rem" }}>
														<span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><MdOutlineLocationOn color="#2563eb" />{asText(aid.location?.city) || "City"}, {asText(aid.location?.district) || "District"}, {asText(aid.location?.province) || "Province"}, {asText(aid.location?.country) || "Country"}</span>
													</p>
												</div>
												<div>
													<p style={{ fontSize: "0.64rem", color: "#7b90ba", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>Logistics Status</p>
													<p style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: "0.35rem", fontWeight: 700, color: getDistributionTone(aid.distributionStatus).color }}>
														<span style={{ width: "0.45rem", height: "0.45rem", borderRadius: "999px", background: getDistributionTone(aid.distributionStatus).bullet }} />
														{getDistributionTone(aid.distributionStatus).label}
													</p>
												</div>
											</div>

											<p style={{ marginBottom: "0.6rem", fontSize: "0.75rem", color: "#8ca1c8" }}>ID: {asText(aid.damageReportId) || "-"}</p>
										</div>
										<div className="admin-verification-actions" style={{ gap: "0.55rem" }}>
												{asText(aid.adminStatus).toUpperCase() !== "REJECTED" && (
													<button
														type="button"
														className="btn-primary"
														style={{
															minWidth: "102px",
															color: "#fff",
															background:
																asText(aid.adminStatus).toUpperCase() === "APPROVED"
																	? "linear-gradient(135deg, #50cd90, #26c281)"
																	: "linear-gradient(135deg, #1f78d1 , #2563eb   )",
														}}
														onClick={() => handleAdminDecision(aid._id, "APPROVED")}
														disabled={updatingId === aid._id || asText(aid.adminStatus).toUpperCase() === "APPROVED"}
													>
														{asText(aid.adminStatus).toUpperCase() === "APPROVED"
															? "Approved"
															: updatingId === aid._id
																? "Saving..."
																: "Approve"}
													</button>
												)}
											{asText(aid.adminStatus).toUpperCase() !== "APPROVED" && (
												<button
													type="button"
													className="btn-danger"
													style={{
														minWidth: "94px",
														color: "#fff",
														background:
															asText(aid.adminStatus).toUpperCase() === "REJECTED"
																? "linear-gradient(135deg, #ea8282, #f36d6d)"
																: "linear-gradient(135deg, #dc2626 , #ef4444  )",
													}}
													onClick={() => handleAdminDecision(aid._id, "REJECTED")}
													disabled={updatingId === aid._id || asText(aid.adminStatus).toUpperCase() === "REJECTED"}
												>
													{asText(aid.adminStatus).toUpperCase() === "REJECTED"
														? "Rejected"
														: updatingId === aid._id
															? "Saving..."
															: "Reject"}
												</button>
											)}
											<select
												value={distributionDraft[aid._id] || aid.distributionStatus || "PENDING"}
												onChange={(event) =>
													setDistributionDraft((prev) => ({
														...prev,
														[aid._id]: event.target.value,
													}))
												}
													disabled={updatingId === aid._id || asText(aid.adminStatus).toUpperCase() !== "APPROVED"}
												style={{ minWidth: "166px", borderRadius: "10px", padding: "0.62rem 0.7rem" }}
											>
												{distributionOptions.map((status) => (
													<option key={status} value={status}>{status}</option>
												))}
											</select>
											<button
												type="button"
												className="btn-secondary"
												style={{ minWidth: "164px", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
												onClick={() => handleDistributionSave(aid)}
													disabled={updatingId === aid._id || asText(aid.adminStatus).toUpperCase() !== "APPROVED"}
											>
													<MdLocalShipping /> {asText(aid.adminStatus).toUpperCase() === "REJECTED" ? "Rejected" : asText(aid.adminStatus).toUpperCase() !== "APPROVED" ? "Approve First" : updatingId === aid._id ? "Saving..." : "Update Distribution"}
											</button>
										</div>
									</article>
								))}
							</div>
						)}

						<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", marginTop: "1.05rem" }}>
							<div className="page-card" style={{ padding: "1rem", background: "rgba(237, 245, 255, 0.92)", border: "1px solid rgba(191, 219, 254, 0.72)" }}>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem", marginBottom: "0.75rem" }}>
									<h3 style={{ margin: 0 }}>Operational View: Active Districts</h3>
									<span style={{ fontSize: "0.75rem", color: "#6d82ae" }}>Live by active aid requests</span>
								</div>

								<div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.8rem" }}>
									{[
										{ label: "Critical Overload", color: "#b4232d", background: "rgba(220, 38, 38, 0.16)", border: "1px solid rgba(220, 38, 38, 0.35)" },
										{ label: "High Demand", color: "#b86d06", background: "rgba(245, 158, 11, 0.16)", border: "1px solid rgba(245, 158, 11, 0.36)" },
										{ label: "Stable", color: "#18794e", background: "rgba(22, 163, 74, 0.16)", border: "1px solid rgba(22, 163, 74, 0.34)" },
										{ label: "No Active Requests", color: "#64748b", background: "rgba(100, 116, 139, 0.14)", border: "1px solid rgba(100, 116, 139, 0.3)" },
									].map((item) => (
										<span
											key={item.label}
											style={{
												display: "inline-flex",
												alignItems: "center",
												gap: "0.34rem",
												padding: "0.22rem 0.54rem",
												borderRadius: "999px",
												fontSize: "0.66rem",
												fontWeight: 700,
												color: item.color,
												background: item.background,
												border: item.border,
											}}
										>
											<span style={{ width: "0.46rem", height: "0.46rem", borderRadius: "999px", background: item.color }} />
											{item.label}
										</span>
									))}
								</div>

								<div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(130px, 1fr))", gap: "0.58rem" }}>
									{districtStatusItems.map((item) => (
										<div
											key={item.district}
											style={{
												borderRadius: "10px",
												padding: "0.5rem 0.58rem",
												background: item.tone.background,
												border: item.tone.border,
												display: "grid",
												gap: "0.15rem",
											}}
										>
											<p style={{ margin: 0, fontSize: "0.76rem", fontWeight: 800, color: "#1f3157", letterSpacing: "0.01em" }}>{item.district}</p>
											<p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 700, color: item.tone.color }}>{item.tone.label}</p>
											<p style={{ margin: 0, fontSize: "0.64rem", color: "#516b99" }}>Active requests: {item.activeCount}</p>
										</div>
									))}
								</div>
							</div>

							<div className="page-card" style={{ padding: "1rem" }}>
								<h3 style={{ marginBottom: "0.85rem" }}>Response Velocity</h3>
								<div
									style={{
										border: "1px solid rgba(191, 219, 254, 0.72)",
										borderRadius: "12px",
										overflow: "hidden",
										marginBottom: "0.9rem",
										background: "#eaf1ff",
									}}
								>
									<div style={{ padding: "0.5rem 0.65rem", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#2a4f9d", background: "rgba(37, 99, 235, 0.1)" }}>
										Live Coordination Map
									</div>
									<iframe
										title="Sri Lanka coordination map"
										src="https://maps.google.com/maps?q=Sri%20Lanka&z=7&output=embed"
										style={{ width: "100%", height: "170px", border: 0 }}
										loading="lazy"
										referrerPolicy="no-referrer-when-downgrade"
									/>
								</div>
								<div style={{ marginBottom: "0.7rem" }}>
									<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#5f79ab", marginBottom: "0.3rem" }}>
										<span>Triage Time</span>
										<span>14m</span>
									</div>
									<div style={{ height: "6px", background: "#dbe6fb", borderRadius: "999px", overflow: "hidden" }}>
										<div style={{ width: "86%", height: "100%", background: "#1f5fd2" }} />
									</div>
								</div>

								<div>
									<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#5f79ab", marginBottom: "0.3rem" }}>
										<span>Resource Matching</span>
										<span>2.4h</span>
									</div>
									<div style={{ height: "6px", background: "#dbe6fb", borderRadius: "999px", overflow: "hidden" }}>
										<div style={{ width: "58%", height: "100%", background: "#6e8fcb" }} />
									</div>
								</div>

								<p style={{ marginTop: "0.9rem", color: "#7c90ba", fontSize: "0.82rem", lineHeight: 1.5 }}>
									System performance is within optimal response parameters for current active disaster zones.
								</p>
							</div>

						</div>
					</div>
				</section>
			</main>
		</div>
	);
};

export default AidApproval;
