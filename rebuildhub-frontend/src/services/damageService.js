import API from "./api";

// Get damage reports by disaster ID
export const getReportsByDisaster = (disasterId) =>
  API.get(`/api/reports/disaster/${disasterId}`);

// Verify a damage report (Authority only)
export const verifyReport = (reportId, status) =>
  API.patch(`/api/reports/verify/${reportId}`, { status });

// Get single damage report by ID (if you have an endpoint)
export const getReportById = (reportId) => API.get(`/api/reports/${reportId}`);

// Submit a manual damage report (with images)
export const submitDamageReport = (formData) =>
  API.post("/api/reports", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });