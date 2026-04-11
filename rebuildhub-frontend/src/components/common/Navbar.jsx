import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RebuildHubLogo } from "./RebuildHubLogo.jsx";
import { AUTH_SESSION_CHANGED, getAuthSession } from "../../services/authSession";

const Navbar = () => {
  const [session, setSession] = useState(() => getAuthSession());

  useEffect(() => {
    const syncSession = () => setSession(getAuthSession());
    window.addEventListener(AUTH_SESSION_CHANGED, syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED, syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const token = session.token;
  const role = session.role;
  const userName = session.user?.name || "";

  const dashboardPathByRole = {
    admin: "/dashboard",
    inventory_manager: "/inventory/dashboard",
    volunteer: "/volunteer/dashboard",
  };

  const activeDashboardPath = dashboardPathByRole[role];
  const isStaffSignedIn = Boolean(token && activeDashboardPath);

  const roleLabelByRole = {
    admin: "Admin",
    inventory_manager: "Inventory Manager",
    volunteer: "Volunteer",
  };

  return (
    <header className="site-header">
      <nav className="site-nav container">
        <Link to="/" className="brand-link">
          <RebuildHubLogo className="brand-mark" />
          <span>RebuildHub</span>
        </Link>
        <div className="nav-links">
          <a href="/#dashboard" className="nav-link">Dashboard</a>
          <Link to="/resources" className="nav-link">Resources</Link>
          <Link to="/volunteer/apply" className="nav-link">Volunteer</Link>
          <a href="/#contact" className="nav-link">Contact</a>
        </div>
        <div className="nav-actions">
          {isStaffSignedIn ? (
            <Link to={activeDashboardPath} className="nav-admin-chip" title="Open dashboard">
              <span>{roleLabelByRole[role] || "Staff"}</span>
              <strong>{userName || "Administrator"}</strong>
            </Link>
          ) : (
            <Link to="/admin/login" className="btn-secondary nav-signin">Sign In</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;