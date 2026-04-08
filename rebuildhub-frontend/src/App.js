// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VolunteerPage from "./pages/volunteer/VolunteerPage";
import AdminVolunteerManagement from "./pages/volunteer/AdminVolunteerManagement";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VolunteerPage />} />
        <Route path="/volunteer/apply" element={<VolunteerPage />} />
        <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/dashboard" element={<AdminDashboardPage />} />
        <Route
          path="/admin/volunteers"
          element={<AdminVolunteerManagement />}
        />
      </Routes>
    </Router>
  );
}

export default App;
