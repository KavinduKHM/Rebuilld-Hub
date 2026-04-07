import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Home from "../pages/Home.jsx";
import DisasterPage from "../pages/disaster/DisasterPage.jsx";
import DisasterDetailsPage from "../pages/disaster/DisasterDetailsPage.jsx";
import DisasterForm from "../components/disaster/DisasterForm.jsx";
import DamageReportPage from "../pages/damage/DamageReportPage.jsx";
import DamageDetailsPage from "../pages/damage/DamageDetailsPage.jsx";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/disasters" element={<DisasterPage />} />
        <Route path="/disasters/new" element={<DisasterForm />} />
        <Route path="/disasters/:id" element={<DisasterDetailsPage />} />
        <Route path="/reports/new" element={<DamageReportPage />} />
        <Route path="/damage/:id" element={<DamageDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;