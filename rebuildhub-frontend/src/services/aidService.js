import API from "./api";

export const createAid = (data) => API.post("/api/aids", data);
