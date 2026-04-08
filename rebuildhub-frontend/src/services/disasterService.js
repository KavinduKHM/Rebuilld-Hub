import API from "./api";

// Get all disasters
export const getDisasters = () => API.get("/api/disasters");

// Get single disaster by ID
export const getDisasterById = (id) => API.get(`/api/disasters/${id}`);

// Create disaster (multipart/form-data)
export const createDisaster = (formData) =>
  API.post("/api/disasters", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Update disaster
export const updateDisaster = (id, data) => API.put(`/api/disasters/${id}`, data);

// Verify disaster (admin only)
export const verifyDisaster = (id, status) =>
  API.patch(`/api/disasters/verify/${id}`, { status });

// Delete disaster
export const deleteDisaster = (id) => API.delete(`/api/disasters/${id}`);