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
import { FaFirstAid, FaTshirt, FaUtensils, FaHandsHelping, FaMoneyBillWave } from "react-icons/fa";

const asText = (value) => (value ?? "").toString().trim();

const isCompletedRequest = (aid) =>
	aid?.distributionStatus === "COMPLETED" && aid?.adminStatus === "APPROVED";

const getAidIcon = (aidType) => {
	const normalized = asText(aidType).toUpperCase();
	if (normalized === "FOOD") return <FaUtensils />;
	if (normalized === "CLOTH") return <FaTshirt />;
	if (normalized === "SANITORY") return <FaFirstAid />;
	if (normalized === "MONEY") return <FaMoneyBillWave />;
	return <FaHandsHelping />;
};

const AidList = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [completedAids, setCompletedAids] = useState([]);
	const [selectedAidType, setSelectedAidType] = useState("ALL");
	const [selectedRange, setSelectedRange] = useState("ALL");
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 6;

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

	const aidTypeOptions = [
		"ALL",
		...Array.from(new Set(completedAids.map((item) => asText(item.aidType).toUpperCase()).filter(Boolean))),
	];

	const rangeOptions = ["ALL", "30D", "7D"];

	const filteredAids = completedAids.filter((aid) => {
		const normalizedAidType = asText(aid.aidType).toUpperCase();
		if (selectedAidType !== "ALL" && normalizedAidType !== selectedAidType) {
			return false;
		}

		if (selectedRange === "ALL") {
			return true;
		}

		const createdTime = new Date(aid.createdAt).getTime();
		if (Number.isNaN(createdTime)) {
			return true;
		}

		const days = selectedRange === "7D" ? 7 : 30;
		const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
		return createdTime >= threshold;
	});

	const totalPages = Math.max(1, Math.ceil(filteredAids.length / pageSize));
	const safePage = Math.min(currentPage, totalPages);
	const paginatedAids = filteredAids.slice((safePage - 1) * pageSize, safePage * pageSize);

	useEffect(() => {
		setCurrentPage(1);
	}, [selectedAidType, selectedRange, completedAids.length]);

	const cycleAidTypeFilter = () => {
		setSelectedAidType((prev) => {
			const currentIndex = aidTypeOptions.indexOf(prev);
			const nextIndex = (currentIndex + 1) % aidTypeOptions.length;
			return aidTypeOptions[nextIndex];
		});
	};

	const cycleTimeRange = () => {
		setSelectedRange((prev) => {
			const currentIndex = rangeOptions.indexOf(prev);
			const nextIndex = (currentIndex + 1) % rangeOptions.length;
			return rangeOptions[nextIndex];
		});
	};

	const exportCsv = () => {
		const rows = filteredAids.map((aid) => ({
			id: aid._id || "",
			damageReportId: aid.damageReportId || "",
			aidType: aid.aidType || "",
			quantity: aid.quantity ?? "",
			quantityUnit: aid.quantityUnit || "",
			city: aid.location?.city || "",
			district: aid.location?.district || "",
			province: aid.location?.province || "",
			country: aid.location?.country || "",
			createdAt: aid.createdAt || "",
		}));

		const headers = [
			"id",
			"damageReportId",
			"aidType",
			"quantity",
			"quantityUnit",
			"city",
			"district",
			"province",
			"country",
			"createdAt",
		];

		const csv = [
			headers.join(","),
			...rows.map((row) =>
				headers
					.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
					.join(",")
			),
		].join("\n");

		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", "completed-aid-requests.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

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
					<Link to="/admin/donations" className="admin-nav-link">Donations</Link>
					<Link to="/admin/aid-requests" className="admin-nav-link">Aid Requests</Link>
					<Link to="/admin/aid-completed" className="admin-nav-link admin-nav-link--active">Completed Requests</Link>
				</nav>

				<div className="tac-sidebar-footer">
					<button className="btn-secondary" type="button" onClick={handleLogout}>
						Logout
					</button>
				</div>
			</aside>

			<main className="tac-main admin-main">
				<header className="admin-topbar page-card">
					<div>
						<span className="section-label">Aid Operations</span>
						<h1 className="page-title"><FaCalendarCheck />  Completed Requests</h1>
						<p className="page-subtitle">
							Requests moved here after distribution is marked COMPLETED and request decision is finalized.
						</p>
					</div>
					<div className="admin-topbar__meta">
						<span>Total completed: {filteredAids.length}</span>
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
									<button type="button" className="btn-secondary" onClick={cycleAidTypeFilter} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
										<MdOutlineFilterList /> Filter: {selectedAidType === "ALL" ? "All" : selectedAidType}
									</button>
									<button type="button" className="btn-secondary" onClick={cycleTimeRange}>{selectedRange === "ALL" ? "All Time" : `Last ${selectedRange.replace("D", " Days")}`}</button>
									<button type="button" className="btn-secondary" onClick={exportCsv} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
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
						) : filteredAids.length === 0 ? (
							<p className="empty-state">No completed aid requests yet.</p>
						) : (
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
								{paginatedAids.map((aid) => (
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
													<strong style={{ fontSize: "1.2rem", color: "#13294f" }}>
														{aid.quantity ?? "-"} {aid.quantityUnit === "RUPEES" || asText(aid.aidType).toUpperCase() === "MONEY" ? "LKR" : "Units"}
													</strong>
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
							<button
								type="button"
								className="btn-secondary"
								style={{ padding: "0.45rem 0.8rem" }}
								onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
								disabled={safePage <= 1}
							>
								Previous
							</button>
							<div style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
								<span style={{ width: "1.75rem", height: "1.75rem", borderRadius: "8px", background: "#2563eb", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>{safePage}</span>
								<span style={{ padding: "0 0.3rem", fontSize: "0.85rem" }}>/</span>
								<span style={{ width: "1.75rem", height: "1.75rem", borderRadius: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>{totalPages}</span>
							</div>
							<button
								type="button"
								className="btn-secondary"
								style={{ padding: "0.45rem 0.8rem" }}
								onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
								disabled={safePage >= totalPages}
							>
								Next
							</button>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
};

export default AidList;
