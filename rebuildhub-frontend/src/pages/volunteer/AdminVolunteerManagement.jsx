// src/pages/volunteer/AdminVolunteerManagement.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { clearAuthSession } from "../../services/authSession";
import "./AdminVolunteerManagement.css";
import "../../assets/styles/global.css";

const getStatus = (volunteer) => {
  return (
    volunteer.verificationStatus ||
    volunteer.status ||
    "PENDING"
  ).toLowerCase();
};

const getStatusClassName = (volunteer) => {
  const status = getStatus(volunteer);
  if (status === "verified") return "approved";
  return status;
};

const AdminVolunteerManagement = () => {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/volunteers");
      const payload = response.data;
      const rows = Array.isArray(payload) ? payload : payload?.data || [];

      setVolunteers(rows);
      setFilteredVolunteers(rows);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/volunteers/${id}`, {
        verificationStatus: status,
      });
      fetchVolunteers();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteVolunteer = async (id) => {
    if (window.confirm("Are you sure you want to delete this volunteer?")) {
      try {
        await axios.delete(`http://localhost:5000/api/volunteers/${id}`);
        fetchVolunteers();
      } catch (error) {
        console.error("Error deleting volunteer:", error);
      }
    }
  };

  useEffect(() => {
    let filtered = volunteers;

    if (filter !== "all") {
      filtered = filtered.filter((v) => getStatus(v) === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.skills?.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    setFilteredVolunteers(filtered);
  }, [filter, searchTerm, volunteers]);

  const stats = {
    total: volunteers.length,
    pending: volunteers.filter((v) => getStatus(v) === "pending").length,
    approved: volunteers.filter((v) => getStatus(v) === "verified").length,
    rejected: volunteers.filter((v) => getStatus(v) === "rejected").length,
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/", { replace: true });
  };

  if (loading)
    return <div className="admin-loading">Loading volunteers...</div>;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar page-card">
        <div>
          <div className="admin-brand">Command Center</div>
          <p className="admin-brand-subtitle">Operational Lead</p>
        </div>

        <div className="admin-status-pill">System Status: Active</div>

        <nav className="admin-nav">
          <Link to="/dashboard#disasters" className="admin-nav-link">
            Disasters
          </Link>
          <Link to="/admin/volunteers" className="admin-nav-link admin-nav-link--active">
            Volunteers
          </Link>
          <Link to="/dashboard#resources" className="admin-nav-link">
            Resources
          </Link>
          <Link to="/dashboard#aid-requests" className="admin-nav-link">
            Aid Requests
          </Link>
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
            <span className="section-label">Volunteer Operations</span>
            <h1>Volunteer Applications</h1>
            <p>Manage and vet emergency responders for active rebuild zones.</p>
          </div>
          <div className="admin-topbar__meta">
            <span>Pending: {stats.pending}</span>
            <span>Verified: {stats.approved}</span>
            <span>Total: {stats.total}</span>
          </div>
        </header>

        <section className="admin-panel page-card admin-volunteer-panel">
          <div className="stats-cards">
            <div className="stat-card pending-stat">
              <p>Total Pending</p>
              <p className="stat-number">{stats.pending}</p>
            </div>
            <div className="stat-card approved-stat">
              <p>Approved</p>
              <p className="stat-number">{stats.approved}</p>
            </div>
            <div className="stat-card rejected-stat">
              <p>Rejected</p>
              <p className="stat-number">{stats.rejected}</p>
            </div>
            <div className="stat-card total-stat">
              <p>Total Applications</p>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <div className="filter-select">
              <span className="material-symbols-outlined">filter_list</span>
              <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="verified">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Search by name, email, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="refresh-btn" onClick={fetchVolunteers}>
              <span className="material-symbols-outlined">refresh</span>
              Refresh
            </button>
          </div>

          {/* Volunteers Table */}
          <div className="table-container">
            <table className="volunteers-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Location</th>
                  <th>Primary Skills</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.map((volunteer) => (
                  <tr key={volunteer._id} className="table-row">
                    <td>
                      <div className="applicant-info">
                        <div className="avatar">
                          {volunteer.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="applicant-name">{volunteer.name}</p>
                          <p className="applicant-email">
                            {volunteer.email ||
                              volunteer.phone ||
                              "No contact provided"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="location">
                        <span className="material-symbols-outlined">
                          location_on
                        </span>
                        <span>
                          {volunteer.district ||
                            volunteer.location ||
                            "Not specified"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="skills">
                        {volunteer.skills?.slice(0, 2).map((skill, i) => (
                          <span key={i} className="skill-badge">
                            {skill}
                          </span>
                        ))}
                        {volunteer.skills?.length > 2 && (
                          <span className="skill-badge">
                            +{volunteer.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClassName(volunteer)}`}
                      >
                        {getStatus(volunteer)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons">
                        {getStatus(volunteer) === "pending" && (
                          <>
                            <button
                              className="btn-reject"
                              onClick={() =>
                                updateStatus(volunteer._id, "REJECTED")
                              }
                              title="Reject"
                            >
                              <span className="material-symbols-outlined">
                                close
                              </span>
                            </button>
                            <button
                              className="btn-approve"
                              onClick={() =>
                                updateStatus(volunteer._id, "VERIFIED")
                              }
                              title="Approve"
                            >
                              <span className="material-symbols-outlined">
                                check
                              </span>
                            </button>
                          </>
                        )}
                        {getStatus(volunteer) !== "pending" && (
                          <button
                            className="btn-delete"
                            onClick={() => deleteVolunteer(volunteer._id)}
                            title="Delete"
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredVolunteers.length === 0 && (
              <div className="no-results">No volunteers found</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminVolunteerManagement;
