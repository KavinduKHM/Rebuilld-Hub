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
import AidRequestForm from "./components/aid/AidRequestForm.jsx";
import AidApproval from "./components/aid/AidApproval.jsx";
import AidList from "./components/aid/AidList.jsx";
import VerifiedReports from "./components/aid/VerifiedReports.jsx";
import WeatherPage from "./pages/weather/WeatherPage.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import InventoryManagerDashboardPage from "./pages/admin/InventoryManagerDashboardPage.jsx";
import ResourceManagementPage from "./pages/resource/ResourceManagementPage.jsx";
import AdminDonationsPage from "./pages/resource/AdminDonationsPage.jsx";
import ResourcePage from "./pages/resource/ResourcePage.jsx";
import DonationSuccess from "./pages/resource/DonationSuccess.jsx";
import DonationForm from "./components/resource/DonationForm.jsx";
import VolunteerDashboardPage from "./pages/volunteer/VolunteerDashboard.jsx";
import VolunteerPage from "./pages/volunteer/VolunteerPage.jsx";
import AdminVolunteerManagement from "./pages/volunteer/AdminVolunteerManagement.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ResourceProvider } from "./context/ResourceContext.jsx";

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
          path="/admin/aid-requests"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AidApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/aid-completed"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AidList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ResourceManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/donations"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDonationsPage />
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
        <Route
          path="/resources"
          element={
            
              <ResourcePage />
          }
        />
        <Route
          path="/donate"
          element={
              <DonationForm />
          }
        />
        <Route
          path="/donate/:itemId"
          element={
              <DonationForm />
          }
        />
        <Route
          path="/donation-success"
          element={
            <ProtectedRoute>
              <DonationSuccess />
            </ProtectedRoute>
          }
        />
        <Route path="/aid/verified-reports" element={<VerifiedReports />} />
        <Route path="/aid/request" element={<AidRequestForm />} />
        <Route path="/weather" element={<WeatherPage />} />
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
      <AuthProvider>
        <ResourceProvider>
          <AppShell />
        </ResourceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;