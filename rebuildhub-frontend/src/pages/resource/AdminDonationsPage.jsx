import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { useResource } from "../../context/ResourceContext";
import { clearAuthSession } from "../../services/authSession";
import "./ResourcePage.css";

const CHART_COLORS = ["#2563eb", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

const formatDateTime = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
};

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `LKR ${amount.toLocaleString()}`;
};

const getPaymentStatusStyle = (status) => {
  const normalized = (status || "PENDING").toUpperCase();

  if (normalized === "SUCCESS") {
    return {
      color: "#166534",
      background: "#dcfce7",
      border: "1px solid #86efac",
    };
  }

  if (normalized === "PENDING") {
    return {
      color: "#9a3412",
      background: "#ffedd5",
      border: "1px solid #fdba74",
    };
  }

  return {
    color: "#374151",
    background: "#f3f4f6",
    border: "1px solid #d1d5db",
  };
};

const themedHeaderStyle = {
  background: "linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(239, 245, 255, 0.92))",
  border: "1px solid rgba(191, 219, 254, 0.72)",
  boxShadow: "0 16px 36px rgba(147, 197, 253, 0.24)",
};

const themedPanelStyle = {
  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 255, 0.92))",
  border: "1px solid rgba(191, 219, 254, 0.72)",
  boxShadow: "0 14px 30px rgba(147, 197, 253, 0.2)",
};

const AdminDonationsPage = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const { donations, loading, fetchDonations } = useResource();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showAllDonations, setShowAllDonations] = useState(false);

  const displayDonations = useMemo(() => {
    const rows = Array.isArray(donations) ? donations : [];
    return rows
      .filter((item) => item?.type === "MONEY" || item?.type === "STOCK")
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
  }, [donations]);

  useEffect(() => {
    if (isAdmin) {
      fetchDonations();
    }
  }, [isAdmin, fetchDonations]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/", { replace: true });
  };

  const donationStats = useMemo(() => {
    const rows = displayDonations;
    const totalDonations = rows.length;
    const fundDonations = rows.filter((item) => item?.type === "MONEY").length;
    const stockDonations = rows.filter((item) => item?.type === "STOCK").length;
    const successDonations = rows.filter((item) => (item?.paymentStatus || "PENDING") === "SUCCESS").length;
    const pendingDonations = rows.filter((item) => (item?.paymentStatus || "PENDING") === "PENDING").length;
    const totalMoney = rows
      .filter((item) => item?.type === "MONEY")
      .reduce((sum, item) => sum + Number(item?.amount || 0), 0);
    const totalStock = rows
      .filter((item) => item?.type === "STOCK")
      .reduce((sum, item) => sum + Number(item?.quantity || 0), 0);

    return {
      totalDonations,
      fundDonations,
      stockDonations,
      successDonations,
      pendingDonations,
      totalMoney,
      totalStock,
    };
  }, [displayDonations]);

  const filteredDonations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return displayDonations.filter((item) => {
      if (categoryFilter !== "ALL" && item?.type !== categoryFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      const donor = (item?.donorName || "").toLowerCase();
      const email = (item?.email || "").toLowerCase();
      const nic = (item?.donorNIC || "").toLowerCase();
      const donationName = (item?.name || "").toLowerCase();

      return donor.includes(term) || email.includes(term) || nic.includes(term) || donationName.includes(term);
    });
  }, [displayDonations, searchTerm, categoryFilter]);

  const visibleDonations = useMemo(() => {
    if (showAllDonations) {
      return filteredDonations;
    }
    return filteredDonations.slice(0, 10);
  }, [filteredDonations, showAllDonations]);

  const analytics = useMemo(() => {
    const rows = filteredDonations;

    const typeMix = [
      { name: "Fund", value: rows.filter((item) => item?.type === "MONEY").length },
      { name: "Stock", value: rows.filter((item) => item?.type === "STOCK").length },
    ].filter((entry) => entry.value > 0);

    const statusMix = [
      { name: "Success", value: rows.filter((item) => (item?.paymentStatus || "PENDING") === "SUCCESS").length },
      { name: "Pending", value: rows.filter((item) => (item?.paymentStatus || "PENDING") === "PENDING").length },
    ].filter((entry) => entry.value > 0);

    const monthBuckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleString(undefined, { month: "short" }),
        total: 0,
        funds: 0,
        stock: 0,
      };
    });

    const monthIndex = monthBuckets.reduce((acc, bucket, idx) => {
      acc[bucket.key] = idx;
      return acc;
    }, {});

    rows.forEach((item) => {
      const created = new Date(item?.createdAt || 0);
      if (Number.isNaN(created.getTime())) return;
      const key = `${created.getFullYear()}-${created.getMonth()}`;
      const idx = monthIndex[key];
      if (idx === undefined) return;

      monthBuckets[idx].total += 1;
      if (item?.type === "MONEY") monthBuckets[idx].funds += 1;
      if (item?.type === "STOCK") monthBuckets[idx].stock += 1;
    });

    const fundByNameMap = new Map();
    rows
      .filter((item) => item?.type === "MONEY")
      .forEach((item) => {
        const key = item?.name || "Unknown Fund";
        fundByNameMap.set(key, (fundByNameMap.get(key) || 0) + Number(item?.amount || 0));
      });

    const topFunds = Array.from(fundByNameMap, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const stockByNameMap = new Map();
    rows
      .filter((item) => item?.type === "STOCK")
      .forEach((item) => {
        const key = item?.name || "Unknown Stock";
        stockByNameMap.set(key, (stockByNameMap.get(key) || 0) + Number(item?.quantity || 0));
      });

    const topStock = Array.from(stockByNameMap, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      typeMix,
      statusMix,
      monthlyTrend: monthBuckets,
      topFunds,
      topStock,
    };
  }, [filteredDonations]);

  if (!isAdmin) {
    return (
      <div className="page-shell resource-shell resource-shell--center">
        <div className="page-card resource-card text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

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
          <Link to="/admin/donations" className="admin-nav-link admin-nav-link--active">Donations</Link>
          <Link to="/admin/aid-requests" className="admin-nav-link">Aid Requests</Link>
        </nav>

        <div className="tac-sidebar-footer">
          <button className="btn-secondary" type="button" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="tac-main admin-main">
        <header className="admin-topbar page-card" style={themedHeaderStyle}>
          <div>
            <span className="section-label">Donation Operations</span>
            <h1 className="page-title">Donations</h1>
            <p className="page-subtitle">Review all stock and monetary donations submitted by users.</p>
          </div>
          <div
            className="admin-topbar__meta"
            style={{
              minWidth: "560px",
              padding: "0.45rem 0.25rem",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.86)",
              border: "1px solid rgba(191, 219, 254, 0.8)",
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gap: 0,
              overflow: "hidden",
            }}
          >
            <div style={{ textAlign: "center", padding: "0.45rem 0.2rem", borderRight: "1px solid rgba(191, 219, 254, 0.72)" }}>
              <p style={{ margin: 0, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2b63c9" }}>Total</p>
              <strong style={{ fontSize: "1.2rem", lineHeight: 1.05, color: "#142d59" }}>{donationStats.totalDonations}</strong>
            </div>
            <div style={{ textAlign: "center", padding: "0.45rem 0.2rem", borderRight: "1px solid rgba(191, 219, 254, 0.72)" }}>
              <p style={{ margin: 0, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0f766e" }}>Success</p>
              <strong style={{ fontSize: "1.2rem", lineHeight: 1.05, color: "#166534" }}>{donationStats.successDonations}</strong>
            </div>
            <div style={{ textAlign: "center", padding: "0.45rem 0.2rem", borderRight: "1px solid rgba(191, 219, 254, 0.72)" }}>
              <p style={{ margin: 0, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#d97706" }}>Pending</p>
              <strong style={{ fontSize: "1.2rem", lineHeight: 1.05, color: "#9a3412" }}>{donationStats.pendingDonations}</strong>
            </div>
            <div style={{ textAlign: "center", padding: "0.45rem 0.2rem", borderRight: "1px solid rgba(191, 219, 254, 0.72)" }}>
              <p style={{ margin: 0, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563eb" }}>Funds</p>
              <strong style={{ fontSize: "1.2rem", lineHeight: 1.05, color: "#142d59" }}>{donationStats.fundDonations}</strong>
            </div>
            <div style={{ textAlign: "center", padding: "0.45rem 0.2rem", borderRight: "1px solid rgba(191, 219, 254, 0.72)" }}>
              <p style={{ margin: 0, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4f46e5" }}>Stock</p>
              <strong style={{ fontSize: "1.2rem", lineHeight: 1.05, color: "#142d59" }}>{donationStats.stockDonations}</strong>
            </div>
            <div style={{ textAlign: "center", padding: "0.45rem 0.2rem" }}>
              <p style={{ margin: 0, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7c3aed" }}>Total Funds</p>
              <strong style={{ fontSize: "1.05rem", lineHeight: 1.05, color: "#142d59" }}>{formatMoney(donationStats.totalMoney)}</strong>
            </div>
          </div>
        </header>

        <section className="admin-workspace">
          <div className="admin-panel page-card" style={themedPanelStyle}>
            <div className="admin-panel__header">
              <div>
                <span className="section-label">Submitted Donations</span>
                <h2>Donation List</h2>
                {!loading && filteredDonations.length > 0 && (
                  <p className="page-subtitle" style={{ marginTop: "0.2rem" }}>
                    Showing {visibleDonations.length} of {filteredDonations.length} donations
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.55rem", alignItems: "center", flexWrap: "wrap" }}>
                {filteredDonations.length > 10 && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowAllDonations((prev) => !prev)}
                  >
                    {showAllDonations ? "Show Recent 10" : `View All (${filteredDonations.length})`}
                  </button>
                )}

                <button type="button" className="btn-secondary" onClick={fetchDonations}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                    <RefreshCw size={16} /> Refresh
                  </span>
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(220px, 1fr) minmax(180px, 240px)",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search donor, email, NIC, fund/item..."
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid rgba(148, 163, 184, 0.5)",
                  padding: "0.65rem 0.85rem",
                  fontSize: "0.92rem",
                  color: "#1f2937",
                }}
              />

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid rgba(148, 163, 184, 0.5)",
                  padding: "0.65rem 0.85rem",
                  fontSize: "0.92rem",
                  color: "#1f2937",
                  background: "#ffffff",
                }}
              >
                <option value="ALL">Category: All</option>
                <option value="MONEY">Category: Money / Fund</option>
                <option value="STOCK">Category: Stock</option>
              </select>
            </div>

            {loading ? (
              <p className="empty-state">Loading donations...</p>
            ) : !filteredDonations.length ? (
              <p className="empty-state">No donations found.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="volunteers-table" style={{ minWidth: "980px" }}>
                  <thead>
                    <tr>
                      <th>Donor</th>
                      <th>Type</th>
                      <th>Item / Fund</th>
                      <th>Amount / Qty</th>
                      <th>Status</th>
                      <th>NIC</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleDonations.map((donation) => (
                      <tr key={donation._id} className="table-row">
                        <td>
                          <div>
                            <p className="applicant-name">{donation.donorName || "-"}</p>
                            <p className="applicant-email">{donation.email || "No email"}</p>
                          </div>
                        </td>
                        <td>{donation.type === "MONEY" ? "FUND" : "STOCK"}</td>
                        <td>{donation.name || "-"}</td>
                        <td>
                          {donation.type === "MONEY"
                            ? formatMoney(donation.amount)
                            : `${donation.quantity || 0} ${donation.unit || ""}`.trim()}
                        </td>
                        <td>
                          <span
                            style={{
                              ...getPaymentStatusStyle(donation.paymentStatus),
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "999px",
                              padding: "0.18rem 0.62rem",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              letterSpacing: "0.03em",
                              textTransform: "uppercase",
                            }}
                          >
                            {donation.paymentStatus || "PENDING"}
                          </span>
                        </td>
                        <td>{donation.donorNIC || "-"}</td>
                        <td>{formatDateTime(donation.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-panel page-card" style={{ ...themedPanelStyle, marginTop: "1rem" }}>
            <div className="resource-ledger__header">
              <div>
                <span className="section-label">Visual Oversight</span>
                <h3 className="page-title" style={{ fontSize: "1.12rem", marginBottom: "0.1rem" }}>Donation Analytics</h3>
                <p className="page-subtitle">Professional charts based on your current search and category filters.</p>
              </div>
            </div>

            {loading || !filteredDonations.length ? (
              <p className="empty-state">No chart data available for current filters.</p>
            ) : (
              <div className="resource-chart-grid" style={{ gap: "0.75rem" }}>
                <article className="resource-chart-card" style={{ padding: "0.6rem" }}>
                  <div className="resource-chart-card__header">
                    <span className="section-label">Trend</span>
                    <h3 className="page-title">Last 6 Months Donations</h3>
                  </div>
                  <div className="resource-chart-card__body" style={{ minHeight: "180px" }}>
                    <ResponsiveContainer width="100%" height={170}>
                      <LineChart data={analytics.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" name="Total" stroke="#1d4ed8" strokeWidth={2.2} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="funds" name="Fund" stroke="#0f766e" strokeWidth={1.8} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="stock" name="Stock" stroke="#7c3aed" strokeWidth={1.8} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </article>

                <article className="resource-chart-card" style={{ padding: "0.6rem" }}>
                  <div className="resource-chart-card__header">
                    <span className="section-label">Distribution</span>
                    <h3 className="page-title">Fund vs Stock</h3>
                  </div>
                  <div className="resource-chart-card__body" style={{ minHeight: "180px" }}>
                    {analytics.typeMix.length === 0 ? (
                      <div className="resource-chart__empty" style={{ minHeight: "170px" }}><p>No type data available.</p></div>
                    ) : (
                      <ResponsiveContainer width="100%" height={170}>
                        <PieChart>
                          <Pie data={analytics.typeMix} dataKey="value" nameKey="name" outerRadius={62} label>
                            {analytics.typeMix.map((entry, index) => (
                              <Cell key={`type-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>

                <article className="resource-chart-card" style={{ padding: "0.6rem" }}>
                  <div className="resource-chart-card__header">
                    <span className="section-label">Performance</span>
                    <h3 className="page-title">Payment Status Split</h3>
                  </div>
                  <div className="resource-chart-card__body" style={{ minHeight: "180px" }}>
                    {analytics.statusMix.length === 0 ? (
                      <div className="resource-chart__empty" style={{ minHeight: "170px" }}><p>No status data available.</p></div>
                    ) : (
                      <ResponsiveContainer width="100%" height={170}>
                        <BarChart data={analytics.statusMix}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {analytics.statusMix.map((entry, index) => (
                              <Cell key={`status-${entry.name}`} fill={index === 0 ? "#16a34a" : "#f59e0b"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>

                <article className="resource-chart-card" style={{ padding: "0.6rem" }}>
                  <div className="resource-chart-card__header">
                    <span className="section-label">Funding Focus</span>
                    <h3 className="page-title">Top Fund Targets (Amount)</h3>
                  </div>
                  <div className="resource-chart-card__body" style={{ minHeight: "180px" }}>
                    {analytics.topFunds.length === 0 ? (
                      <div className="resource-chart__empty" style={{ minHeight: "170px" }}><p>No fund donation data available.</p></div>
                    ) : (
                      <ResponsiveContainer width="100%" height={170}>
                        <BarChart data={analytics.topFunds} layout="vertical" margin={{ left: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={98} />
                          <Tooltip formatter={(value) => formatMoney(value)} />
                          <Bar dataKey="value" fill="#2563eb" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDonationsPage;
