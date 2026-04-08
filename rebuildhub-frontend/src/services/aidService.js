import API from "./api";

export const createAid = (data) => API.post("/api/aids", data);
export const getAllAids = () => API.get("/api/aids");
export const updateAidAdminDecision = (id, decision) =>
	API.put(`/api/aids/${id}/admin-decision`, { decision });

export const updateAidDistributionStatus = (id, status) =>
	API.put(`/api/aids/${id}/distribution`, { status });
