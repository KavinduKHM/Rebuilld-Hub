import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import pages
import ResourceManagementPage from '../pages/resource/ResourceManagementPage';
import ResourcePage from '../pages/resource/ResourcePage';
import DonationSuccess from '../pages/resource/DonationSuccess';
import DonationForm from '../components/resource/DonationForm';

// Placeholder components for other routes
const HomePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/30 to-white flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-blue-900 mb-4">Welcome to RebuildHub</h1>
      <p className="text-blue-600">Disaster Relief & Aid Management Platform</p>
    </div>
  </div>
);

const DashboardPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <p className="text-gray-600">Welcome to your dashboard</p>
    </div>
  </div>
);

const LoginPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
      <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">Login</h1>
      <p className="text-center text-gray-600">Login functionality will be implemented here</p>
    </div>
  </div>
);

const RegisterPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
      <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">Register</h1>
      <p className="text-center text-gray-600">Registration functionality will be implemented here</p>
    </div>
  </div>
);

const DisasterPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Disaster Management</h1>
      <p className="text-gray-600">Track and manage disasters</p>
    </div>
  </div>
);

const DamageReportPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Damage Reports</h1>
      <p className="text-gray-600">View and submit damage reports</p>
    </div>
  </div>
);

const AidPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Aid Management</h1>
      <p className="text-gray-600">Coordinate aid distribution</p>
    </div>
  </div>
);

const VolunteerPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Volunteer Management</h1>
      <p className="text-gray-600">Manage volunteers and assignments</p>
    </div>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/donation-success" element={<DonationSuccess />} />
      
      {/* Resource Routes - Accessible to all authenticated users */}
      <Route path="/resources" element={<ResourcePage />} />
      <Route path="/donate" element={<DonationForm />} />
      <Route path="/donate/:itemId" element={<DonationForm />} />
      
      {/* Protected User Routes - Require authentication */}
      <Route path="/dashboard" element={
        isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />
      } />
      <Route path="/disasters" element={
        isAuthenticated ? <DisasterPage /> : <Navigate to="/login" />
      } />
      <Route path="/damage-reports" element={
        isAuthenticated ? <DamageReportPage /> : <Navigate to="/login" />
      } />
      <Route path="/aid" element={
        isAuthenticated ? <AidPage /> : <Navigate to="/login" />
      } />
      <Route path="/volunteers" element={
        isAuthenticated ? <VolunteerPage /> : <Navigate to="/login" />
      } />
      
      {/* Admin Only Routes */}
      <Route path="/admin/resources" element={
        isAuthenticated && user?.role === 'admin' ? 
          <ResourceManagementPage /> : 
          <Navigate to="/dashboard" />
      } />
      
      {/* Fallback Route - 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;