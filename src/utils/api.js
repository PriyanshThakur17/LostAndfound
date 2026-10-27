// ============================================
// Campus Lost & Found — Shared Backend API Client
// ============================================

export const API_BASE = '/api';

/**
 * Retrieve current JWT auth token from localStorage.
 */
export const getAuthToken = () => {
  return localStorage.getItem('campus_auth_token') || '';
};

/**
 * Store JWT auth token in localStorage.
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('campus_auth_token', token);
  } else {
    localStorage.removeItem('campus_auth_token');
  }
};

/**
 * Ensures an active authentication token exists.
 * If not present, requests a demo student token from the backend.
 */
export const ensureAuthToken = async () => {
  const existing = getAuthToken();
  if (existing) return existing;

  try {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await res.json();
    if (result.success && result.data?.token) {
      setAuthToken(result.data.token);
      return result.data.token;
    }
  } catch (err) {
    console.warn('[API Client] Could not auto-provision demo token:', err.message);
  }
  return '';
};

/**
 * Submit a lost or found report to the backend.
 * Uses multipart/form-data via FormData.
 * @param {FormData} formData
 * @returns {Promise<Object>} API response payload
 */
export const createItemApi = async (formData) => {
  const token = await ensureAuthToken();

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers,
    body: formData, // Browser automatically sets Content-Type to multipart/form-data with boundary
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: `Server returned HTTP status ${response.status}`,
  }));

  if (!response.ok || !data.success) {
    const errorMessage = data.message || `Failed to report item (HTTP ${response.status})`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.errors = data.errors || [];
    throw error;
  }

  return data;
};

/**
 * Retrieve items with optional query filters.
 * @param {Object} filters - { type, category, location, status, q, sort }
 */
export const getItemsApi = async (filters = {}) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && value !== 'all') {
      query.append(key, value);
    }
  }

  const queryString = query.toString();
  const url = `${API_BASE}/items${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch items');
  }

  return data.data || [];
};

/**
 * Retrieve single item by ID from backend.
 * @param {string} id
 */
export const getItemByIdApi = async (id) => {
  const response = await fetch(`${API_BASE}/items/${id}`);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Item not found');
  }

  return data.data;
};
