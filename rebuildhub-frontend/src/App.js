// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VolunteerPage from "./pages/volunteer/VolunteerPage";
import AdminVolunteerManagement from "./pages/volunteer/AdminVolunteerManagement";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VolunteerPage />} />
        <Route path="/volunteer/apply" element={<VolunteerPage />} />
        <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
        <Route
          path="/admin/volunteers"
          element={<AdminVolunteerManagement />}
        />
      </Routes>
    </Router>
  );
}

export default App;
