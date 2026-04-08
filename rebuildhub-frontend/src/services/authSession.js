export const AUTH_SESSION_CHANGED = "auth-session-changed";

export const getAuthSession = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userRaw = localStorage.getItem("user");

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch (error) {
      user = null;
    }
  }

  return { token, role, user };
};

export const setAuthSession = ({ token, role, user }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED));
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED));
};
