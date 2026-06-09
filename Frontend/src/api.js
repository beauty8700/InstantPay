const RAW_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BASE = RAW_BASE.replace(/\/+$/, "");
const API_BASE = /\/api$/i.test(BASE) ? BASE : `${BASE}/api`;
const REQUEST_TIMEOUT_MS = 15000;

const getToken = () => localStorage.getItem("token");

const makeHeaders = (auth = false) => {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const handle = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearSession();
  }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

const apiFetch = async (path, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
    });
    return await handle(response);
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const signup = (body) =>
  apiFetch(`/user/signup`, {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify(body),
  });

export const login = (body) =>
  apiFetch(`/user/login`, {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify(body),
  });

export const getMe = () =>
  apiFetch(`/user/me`, { headers: makeHeaders(true) });

export const updateProfile = (body) =>
  apiFetch(`/user/update`, {
    method: "PUT",
    headers: makeHeaders(true),
    body: JSON.stringify(body),
  });

export const searchUsers = (filter = "") => {
  const query = new URLSearchParams();
  if (filter.trim()) query.set("filter", filter.trim());
  return apiFetch(`/user/bulk${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: makeHeaders(true),
  });
};

export const getBalance = () =>
  apiFetch(`/account/balance`, { headers: makeHeaders(true) });

export const getStats = () =>
  apiFetch(`/account/stats`, { headers: makeHeaders(true) });

export const depositMoney = (amount) =>
  apiFetch(`/account/deposit`, {
    method: "POST",
    headers: makeHeaders(true),
    body: JSON.stringify({ amount }),
  });

export const transferMoney = (body) =>
  apiFetch(`/account/transfer`, {
    method: "POST",
    headers: makeHeaders(true),
    body: JSON.stringify(body),
  });

export const getTransactions = ({ page = 1, limit = 20 } = {}) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch(`/account/transactions?${query.toString()}`, {
    headers: makeHeaders(true),
  });
};

export const saveSession = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const isLoggedIn = () => !!getToken();
