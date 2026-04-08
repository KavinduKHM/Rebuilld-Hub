import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Home from "../pages/Home.jsx";
import DisasterPage from "../pages/disaster/DisasterPage.jsx";
import DisasterDetailsPage from "../pages/disaster/DisasterDetailsPage.jsx";
import DisasterForm from "../components/disaster/DisasterForm.jsx";
import DamageReportPage from "../pages/damage/DamageReportPage.jsx";
import DamageDetailsPage from "../pages/damage/DamageDetailsPage.jsx";
import AdminLoginPage from "../pages/admin/AdminLoginPage.jsx";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";

const AppShell = () => {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith("/admin") && location.pathname !== "/dashboard";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/disasters" element={<DisasterPage />} />
        <Route path="/disasters/new" element={<DisasterForm />} />
        <Route path="/disasters/:id" element={<DisasterDetailsPage />} />
        <Route path="/reports/new" element={<DamageReportPage />} />
        <Route path="/damage/:id" element={<DamageDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
};

export default AppRoutes;