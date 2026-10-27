// ============================================
// Campus Lost & Found — Shared Axios API Client
// ============================================
// Owned by Member 4.
// All members import from this file — never
// call axios directly from pages or components.
//
// Base URL is read from the Vite env variable
// VITE_API_URL (set in .env at the project root).
// Falls back to http://localhost:5000 for local dev.
//
// withCredentials: true is required so the browser
// sends the HttpOnly auth cookie on every request.
// ============================================

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies (auth token) automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// ----- Request interceptor -----
// Can be extended later (e.g. attach CSRF token, add loading state).
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ----- Response interceptor -----
// Normalises errors so callers receive a consistent Error object
// with a human-readable .message, regardless of HTTP status.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    // Propagate as a plain Error so catch blocks always see `.message`.
    return Promise.reject(new Error(message));
  }
);

export default api;

// ============================================================
// Convenience wrappers — agreed interface for the whole team.
// Members 1, 2, 3 should add their own endpoint helpers below
// (or in separate service files that import `api` from here).
// ============================================================

// ----- Auth -----

/** Register a new user. Body: { name, email, password } */
export const registerUser = (data) => api.post('/api/auth/register', data);

/** Log in an existing user. Body: { email, password } */
export const loginUser = (data) => api.post('/api/auth/login', data);

/** Log out the current user (clears the HttpOnly cookie). */
export const logoutUser = () => api.post('/api/auth/logout');

/** Fetch the currently authenticated user profile. */
export const fetchMe = () => api.get('/api/auth/me');

// ----- Health -----

/** Verify the backend server and database are reachable. */
export const fetchHealth = () => api.get('/api/health');

// ----- Items (stubs — Members 1 & 2 will implement these) -----
// export const fetchItems  = (params) => api.get('/api/items', { params });
// export const fetchItem   = (id)     => api.get(`/api/items/${id}`);
// export const createItem  = (data)   => api.post('/api/items', data);
// export const updateItem  = (id, data) => api.patch(`/api/items/${id}`, data);

// ----- Claims (stub — Member 2 will implement) -----
// export const createClaim = (itemId, data) => api.post(`/api/items/${itemId}/claims`, data);
