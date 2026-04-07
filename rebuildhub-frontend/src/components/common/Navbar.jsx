import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.link}>RebuildHub</Link>
      <div>
        <Link to="/disasters" style={styles.link}>Disasters</Link>
        {token && role === "authority" && (
          <Link to="/verify" style={styles.link}>Verify Reports</Link>
        )}
        {token ? (
          <button onClick={handleLogout} style={styles.logout}>Logout</button>
        ) : (
          <Link to="/login" style={styles.link}>Login</Link>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: { display: "flex", justifyContent: "space-between", padding: "1rem", background: "#2c3e50", color: "white" },
  link: { color: "white", margin: "0 1rem", textDecoration: "none" },
  logout: { background: "red", color: "white", border: "none", padding: "0.3rem 0.8rem", cursor: "pointer" }
};

export default Navbar;