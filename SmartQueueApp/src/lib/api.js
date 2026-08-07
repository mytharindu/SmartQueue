const API_BASE = "http://localhost:8000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Request to ${path} failed`);
  }
  return data;
}

// Auth
export const registerAccount = (payload) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(payload) });
export const loginAccount = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const logoutAccount = () => request("/auth/logout", { method: "POST" });
export const getCurrentUser = () => request("/auth/me");
export const getAllUsers = () => request("/auth/users");
export const updateUserRole = (id, role) =>
  request(`/auth/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) });

// Departments
export const getAllDepartments = () => request("/departments");
export const addDepartment = (payload) =>
  request("/departments", { method: "POST", body: JSON.stringify(payload) });
export const updateDepartment = (id, payload) =>
  request(`/departments/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteDepartment = (id) =>
  request(`/departments/${id}`, { method: "DELETE" });

// Services
export const getAllServices = () => request("/services");
export const getService = (id) => request(`/services/${id}`);
export const addService = (payload) =>
  request("/services", { method: "POST", body: JSON.stringify(payload) });
export const updateService = (id, payload) =>
  request(`/services/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteService = (id) =>
  request(`/services/${id}`, { method: "DELETE" });

// Counters
export const getAllCounters = () => request("/counters");
export const addCounter = (payload) =>
  request("/counters", { method: "POST", body: JSON.stringify(payload) });
export const updateCounter = (id, payload) =>
  request(`/counters/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteCounter = (id) =>
  request(`/counters/${id}`, { method: "DELETE" });

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
export const reviewTokenPriority = (id, status) =>
  request(`/tokens/${id}/priority`, { method: "PUT", body: JSON.stringify({ status }) });

// Time slots
export const getServiceSlots = (serviceId, date) =>
  request(`/timeslots?serviceId=${serviceId}&date=${date}`);
