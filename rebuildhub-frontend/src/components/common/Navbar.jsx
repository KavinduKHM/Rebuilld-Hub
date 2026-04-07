import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="site-header">
      <nav className="site-nav container">
        <Link to="/" className="brand-link">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2.2 4.5 5.8v5.8c0 4.6 3 8.5 7.5 10.5 4.5-2 7.5-5.9 7.5-10.5V5.8L12 2.2Z" />
              <path d="M8.1 11.2 12 8.4 15.9 11.2M8.1 11.2l2.5 5.2M15.9 11.2l-2.5 5.2M12 8.4v8" />
              <circle cx="12" cy="8.4" r="0.85" fill="currentColor" />
              <circle cx="8.1" cy="11.2" r="0.75" fill="currentColor" />
              <circle cx="15.9" cy="11.2" r="0.75" fill="currentColor" />
              <circle cx="10.6" cy="16.4" r="0.75" fill="currentColor" />
              <circle cx="13.4" cy="16.4" r="0.75" fill="currentColor" />
            </svg>
          </span>
          <span>RebuildHub</span>
        </Link>
        <div className="nav-links">
          <a href="/#dashboard" className="nav-link">Dashboard</a>
          <a href="/#resources" className="nav-link">Resources</a>
          <a href="/#volunteer" className="nav-link">Volunteer</a>
          <a href="/#contact" className="nav-link">Contact</a>
        </div>
        <div className="nav-actions">
          <Link to="/dashboard" className="btn-secondary nav-signin">Sign In</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;