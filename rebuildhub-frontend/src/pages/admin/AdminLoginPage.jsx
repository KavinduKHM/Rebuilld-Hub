import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { getAuthSession, setAuthSession } from "../../services/authSession";
import "../../assets/styles/global.css";

const allowedRoles = ["admin", "inventory_manager", "volunteer", "seeker"];

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
      return;
    }

    if (token && role === "seeker") {
      navigate("/", { replace: true });
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

      setAuthSession({ token: response.data.token, role: user.role, user });

      if (user.role === "admin") {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (user.role === "volunteer") {
        navigate("/volunteer/dashboard", { replace: true });
        return;
      }

      if (user.role === "seeker") {
        navigate("/", { replace: true });
        return;
      }

      setNotice(
        `Signed in as ${user.role.replace("_", " ")}. This portal is not connected yet, so you will remain on this page.`
      );
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-login-hero">
        <span className="admin-login-eyebrow">Classified Administration</span>
        <h1>Sentinel Command</h1>
        <p>
          Secure access for administrators, inventory managers, volunteers, and seekers.
          Seekers sign in here to submit aid requests.
        </p>
        <div className="admin-login-points">
          <div>
            <strong>Admin</strong>
            <span>Disaster and damage verification</span>
          </div>
          <div>
            <strong>Inventory Manager</strong>
            <span>Portal reserved, not integrated yet</span>
          </div>
          <div>
            <strong>Volunteer</strong>
            <span>Portal reserved, not integrated yet</span>
          </div>
          <div>
            <strong>Seeker</strong>
            <span>Submit aid requests for verified disasters</span>
          </div>
        </div>
      </div>

      <form className="admin-login-card page-card" onSubmit={handleSubmit}>
        <div className="admin-login-card__icon">🔒</div>
        <h2>Initialize Session</h2>
        <p>Enter your staff credentials to continue.</p>

        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@example.com"
            required
          />
        </label>

        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </label>

        {error && <p className="admin-form-alert admin-form-alert--error">{error}</p>}
        {notice && <p className="admin-form-alert admin-form-alert--notice">{notice}</p>}

        <button className="btn-primary admin-login-button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="admin-login-footer">
          <Link to="/" className="btn-secondary">Back to Home</Link>
          <span>Admin access only</span>
        </div>
      </form>
    </div>
  );
};

export default AdminLoginPage;
