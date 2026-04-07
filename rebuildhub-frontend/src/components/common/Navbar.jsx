import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="site-header">
      <nav className="site-nav container">
        <Link to="/" className="brand-link">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4Z" />
              <path d="M12 7v10M8.5 12h7" />
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