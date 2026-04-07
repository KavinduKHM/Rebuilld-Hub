import API from "./api";

// Get damage reports by disaster ID
export const getReportsByDisaster = (disasterId) =>
  API.get(`/reports/disaster/${disasterId}`);

// Verify a damage report (Authority only)
export const verifyReport = (reportId, status) =>
  API.patch(`/reports/verify/${reportId}`, { status });