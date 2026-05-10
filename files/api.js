// src/api.js  ─ Centralised API layer for InstaPay frontend
// All backend calls go through here — never fetch() directly in components.

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ── Helpers ────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem("token");

const makeHeaders = (auth = false) => {
  const h = { "Content-Type": "application/json" };
  if (auth) h["Authorization"] = `Bearer ${getToken()}`;
  return h;
};

const handle = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

// ── User / Auth ────────────────────────────────────────────────────────────

export const signup = (body) =>
  fetch(`${BASE}/user/signup`, {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify(body),
  }).then(handle);

export const login = (body) =>
  fetch(`${BASE}/user/login`, {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify(body),
  }).then(handle);

export const getMe = () =>
  fetch(`${BASE}/user/me`, { headers: makeHeaders(true) }).then(handle);

export const updateProfile = (body) =>
  fetch(`${BASE}/user/update`, {
    method: "PUT",
    headers: makeHeaders(true),
    body: JSON.stringify(body),
  }).then(handle);

export const searchUsers = (filter = "") =>
  fetch(`${BASE}/user/bulk?filter=${encodeURIComponent(filter)}`, {
    headers: makeHeaders(),
  }).then(handle);

// ── Account ────────────────────────────────────────────────────────────────

export const getBalance = () =>
  fetch(`${BASE}/account/balance`, { headers: makeHeaders(true) }).then(handle);

export const getStats = () =>
  fetch(`${BASE}/account/stats`, { headers: makeHeaders(true) }).then(handle);

export const deposit = (amount) =>
  fetch(`${BASE}/account/deposit`, {
    method: "POST",
    headers: makeHeaders(true),
    body: JSON.stringify({ amount }),
  }).then(handle);

export const transfer = ({ toUserId, amount, note = "" }) =>
  fetch(`${BASE}/account/transfer`, {
    method: "POST",
    headers: makeHeaders(true),
    body: JSON.stringify({ toUserId, amount, note }),
  }).then(handle);

export const getTransactions = ({ page = 1, limit = 20 } = {}) =>
  fetch(`${BASE}/account/transactions?page=${page}&limit=${limit}`, {
    headers: makeHeaders(true),
  }).then(handle);

// ── Session helpers ────────────────────────────────────────────────────────

export const saveSession = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
};

export const isLoggedIn = () => !!getToken();
