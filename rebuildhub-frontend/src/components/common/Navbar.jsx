import React from "react";
import { Link } from "react-router-dom";
import { RebuildHubLogo } from "./RebuildHubLogo.jsx";

const Navbar = () => {
  return (
    <header className="site-header">
      <nav className="site-nav container">
        <Link to="/" className="brand-link">
          <RebuildHubLogo className="brand-mark" />
          <span>RebuildHub</span>
        </Link>
        <div className="nav-links">
          <a href="/#dashboard" className="nav-link">Dashboard</a>
          <a href="/#resources" className="nav-link">Resources</a>
          <a href="/#volunteer" className="nav-link">Volunteer</a>
          <a href="/#contact" className="nav-link">Contact</a>
        </div>
        <div className="nav-actions">
          <Link to="/admin/login" className="btn-secondary nav-signin">Sign In</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;