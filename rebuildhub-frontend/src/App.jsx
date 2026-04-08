import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./assets/styles/global.css";
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import Home from "./pages/Home.jsx";
import DisasterPage from "./pages/disaster/DisasterPage.jsx";
import DisasterDetailsPage from "./pages/disaster/DisasterDetailsPage.jsx";
import DisasterForm from "./components/disaster/DisasterForm.jsx";
import DamageReportPage from "./pages/damage/DamageReportPage.jsx";
import DamageDetailsPage from "./pages/damage/DamageDetailsPage.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import InventoryManagerDashboardPage from "./pages/admin/InventoryManagerDashboardPage.jsx";
import VolunteerDashboardPage from "./pages/volunteer/VolunteerDashboard.jsx";
import VolunteerPage from "./pages/volunteer/VolunteerPage.jsx";
import AdminVolunteerManagement from "./pages/volunteer/AdminVolunteerManagement.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

const AppShell = () => {
  return (
    <>
      <Navbar />
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
        <Route
          path="/inventory/dashboard"
          element={
            <ProtectedRoute allowedRoles={["inventory_manager"]}>
              <InventoryManagerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["volunteer"]}>
              <VolunteerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/volunteer/apply" element={<VolunteerPage />} />
        <Route
          path="/admin/volunteers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminVolunteerManagement />
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
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;