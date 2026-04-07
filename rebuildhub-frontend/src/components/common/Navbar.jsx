import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="site-header">
      <nav className="site-nav container">
        <Link to="/" className="brand-link">RebuildHub</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/disasters" className="nav-link">Disasters</Link>
          <Link to="/reports/new" className="nav-link">Damage Reports</Link>
          <Link to="/disasters/new" className="nav-link">Create Alert</Link>
        </div>
        <div className="nav-actions">
          <Link to="/disasters" className="nav-link">Explore</Link>
          <Link to="/disasters/new" className="btn-primary">Get Started</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;