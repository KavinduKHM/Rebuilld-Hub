// src/pages/volunteer/AdminVolunteerManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminVolunteerManagement.css";

const getStatus = (volunteer) => {
  return (volunteer.verificationStatus || volunteer.status || "PENDING").toLowerCase();
};

const getStatusClassName = (volunteer) => {
  const status = getStatus(volunteer);
  if (status === "verified") return "approved";
  return status;
};

const AdminVolunteerManagement = () => {
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

  if (loading) return <div className="loading">Loading volunteers...</div>;

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="material-symbols-outlined">hub</span>
            <div>
              <p className="logo-title">RebuildHub</p>
              <p className="logo-subtitle">Command Center</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button type="button" className="nav-item">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </button>
          <button type="button" className="nav-item">
            <span className="material-symbols-outlined">group</span>
            Volunteers
          </button>
          <button type="button" className="nav-item">
            <span className="material-symbols-outlined">event</span>
            Events
          </button>
          <button type="button" className="nav-item">
            <span className="material-symbols-outlined">person</span>
            Profile
          </button>
          <button type="button" className="nav-item active">
            <span className="material-symbols-outlined">settings</span>
            Admin Panel
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="new-report-btn">
            <span className="material-symbols-outlined">add</span>
            New Report
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header Stats */}
        <div className="stats-header">
          <div>
            <h1>Volunteer Applications</h1>
            <p>Manage and vet emergency responders for active rebuild zones.</p>
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <p>Total Pending</p>
              <p className="stat-number">{stats.pending}</p>
            </div>
            <div className="stat-card">
              <p>Active Zones</p>
              <p className="stat-number">12</p>
            </div>
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
            <input
              type="text"
              placeholder="Search by name, email, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                          {volunteer.email || volunteer.phone || "No contact provided"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="location">
                      <span className="material-symbols-outlined">
                        location_on
                      </span>
                      <span>{volunteer.district || volunteer.location || "Not specified"}</span>
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
                    <span className={`status-badge ${getStatusClassName(volunteer)}`}>
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

        {/* Footer */}
        <footer className="admin-footer">
          RebuildHub © 2026 • Resilience Through Data • System Version
          4.0.2-BETA
        </footer>
      </main>
    </div>
  );
};

export default AdminVolunteerManagement;
