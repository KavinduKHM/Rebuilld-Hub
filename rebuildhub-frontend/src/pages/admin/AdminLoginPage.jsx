import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { getAuthSession, setAuthSession } from "../../services/authSession";
import "../../assets/styles/global.css";

const allowedRoles = ["admin", "volunteer"];

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const { token, role } = getAuthSession();

    if (token && role === "admin") {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (token && role === "volunteer") {
      navigate("/volunteer/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await login(form);
      const user = response.data?.user;

      if (!user || !allowedRoles.includes(user.role)) {
        setError("This account is not allowed to access this portal.");
        return;
      }

      if (user.role !== selectedRole) {
        setError("This account does not match the selected access level.");
        return;
      }

      setAuthSession({ token: response.data.token, role: user.role, user });

      if (user.role === "admin") {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (user.role === "volunteer") {
        navigate("/volunteer/dashboard", { replace: true });
        return;
      }

      setNotice("Session initialized. Redirecting...");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sentinel-login-shell">
      <header className="sentinel-login-topbar">
        <div className="sentinel-brand">
          <span className="sentinel-brand__mark">◎</span>
          REBUILD HUB
        </div>
        <div className="sentinel-status">
          <span className="sentinel-status__dot" />
          System Online
        </div>
      </header>

      <div className="sentinel-login-card">
        <aside className="sentinel-login-left">
          <div className="sentinel-login-left__overlay" />
          <div className="sentinel-login-left__content">
            <span className="sentinel-login-left__eyebrow">Rebuild Hub</span>
            <h1>Post Disaster Management & Aid Distribution System</h1>
            <p>
              Crowdsourced damage assessment for post-disaster aid distribution under disaster recovery.
            </p>
            <div className="sentinel-login-left__stats">
              <div>
                <strong>100%</strong>
                <span>Node Uptime</span>
              </div>
              <div>
                <strong>Encrypted</strong>
                <span>AES-256 Protocol</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="sentinel-login-right">
          <div className="sentinel-login-right__header">
            <h2>Sign In</h2>
            <p>Select your operational clearance to begin.</p>
          </div>

          <div className="sentinel-login-tabs">
            <button
              type="button"
              className={selectedRole === "admin" ? "sentinel-tab sentinel-tab--active" : "sentinel-tab"}
              onClick={() => setSelectedRole("admin")}
            >
              Admin Access
            </button>
            <button
              type="button"
              className={selectedRole === "volunteer" ? "sentinel-tab sentinel-tab--active" : "sentinel-tab"}
              onClick={() => setSelectedRole("volunteer")}
            >
              Volunteer
            </button>
          </div>

          <form className="sentinel-login-form" onSubmit={handleSubmit}>
            <label className="sentinel-field">
              <span>Command Identifier</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g., CMD-ALPHA-01 or admin@example.com"
                required
              />
            </label>

            <label className="sentinel-field">
              <div className="sentinel-field__row">
                <span>Security Protocol (Password)</span>
                <button type="button" className="sentinel-link">Recovery required?</button>
              </div>
              <div className="sentinel-field__input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="sentinel-icon-button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            

            {error && <p className="admin-form-alert admin-form-alert--error">{error}</p>}
            {notice && <p className="admin-form-alert admin-form-alert--notice">{notice}</p>}

            <button className="sentinel-primary" type="submit" disabled={loading}>
              {loading ? "Authorizing..." : "Authorize Identity"}
            </button>
          </form>

          <div className="sentinel-login-footer">
            <span>Multi-factor authentication enabled</span>
          </div>
        </section>
      </div>

      <footer className="sentinel-login-bottom">
        <span>© 2024 Tactical Clarity Systems. Secure Command Interface.</span>
        <div className="sentinel-login-links">
          <Link to="/">Privacy Policy</Link>
          <Link to="/">Terms of Service</Link>
          <Link to="/">Contact HQ</Link>
        </div>
      </footer>
    </div>
  );
};

export default AdminLoginPage;
