const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const getToken = () => localStorage.getItem("token");

const makeHeaders = (auth = false) => {
  const headers = { "Content-Type": "application/json" };
  if (auth) headers["Authorization"] = `Bearer ${getToken()}`;
  return headers;
};

const handle = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

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
