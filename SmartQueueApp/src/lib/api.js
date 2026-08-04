const API_BASE = "http://localhost:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Request to ${path} failed`);
  }
  return data;
}

// Departments
export const getAllDepartments = () => request("/departments");

// Services
export const getAllServices = () => request("/services");
export const getService = (id) => request(`/services/${id}`);

// Counters
export const getAllCounters = () => request("/counters");

// Tokens
export const getAllTokens = () => request("/tokens");
export const getToken = (id) => request(`/tokens/${id}`);
export const reserveToken = (payload) =>
  request("/tokens", { method: "POST", body: JSON.stringify(payload) });
export const cancelToken = (id) =>
  request(`/tokens/${id}/cancel`, { method: "PUT" });
export const callToken = (id, counterNumber) =>
  request(`/tokens/${id}/call`, {
    method: "PUT",
    body: JSON.stringify({ counterNumber }),
  });
export const completeToken = (id) =>
  request(`/tokens/${id}/complete`, { method: "PUT" });
