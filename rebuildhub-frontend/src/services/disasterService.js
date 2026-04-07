import API from "./api";

// Get all disasters
export const getDisasters = () => API.get("/disasters");

// Get single disaster by ID
export const getDisasterById = (id) => API.get(`/disasters/${id}`);

// Create disaster (multipart/form-data)
export const createDisaster = (formData) =>
  API.post("/disasters", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Update disaster
export const updateDisaster = (id, data) => API.put(`/disasters/${id}`, data);

// Delete disaster
export const deleteDisaster = (id) => API.delete(`/disasters/${id}`);