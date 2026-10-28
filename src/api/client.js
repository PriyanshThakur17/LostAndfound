// ============================================
// Campus Lost & Found — Shared API Client
// ============================================

const API_BASE = '/api';

/**
 * Retrieves the stored JWT auth token from localStorage.
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token') || localStorage.getItem('campus_auth_token') || '';
};

/**
 * Stores the JWT auth token in localStorage.
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('campus_auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('campus_auth_token');
  }
};

/**
 * Retrieves the stored user info from localStorage.
 */
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Stores the user info in localStorage.
 */
export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('auth_user');
  }
};

/**
 * Generic fetch wrapper handling JSON, FormData, auth headers, and unified errors.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...options.headers };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    // If server is unreachable or offline, propagate clear message
    if (!error.status) {
      error.message = error.message || 'Cannot connect to backend server. Make sure the server is running.';
    }
    throw error;
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),

  // Auth endpoints
  auth: {
    login: async (email, password) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      if (res.token) {
        setAuthToken(res.token);
        setStoredUser(res.user);
      }
      return res;
    },
    register: async (userData) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: userData,
      });
      if (res.token) {
        setAuthToken(res.token);
        setStoredUser(res.user);
      }
      return res;
    },
    getDemoToken: async () => {
      const res = await request('/auth/demo', { method: 'POST' });
      if (res.token) {
        setAuthToken(res.token);
        setStoredUser(res.user);
      }
      return res;
    },
    logout: () => {
      setAuthToken(null);
      setStoredUser(null);
    },
    getCurrentUser: () => getStoredUser(),
    isAuthenticated: () => Boolean(getAuthToken()),
  },

  // Item endpoints
  items: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/items${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getById: (id) => request(`/items/${id}`, { method: 'GET' }),
    create: (formData) => request('/items', { method: 'POST', body: formData }),
  },

  // Claims endpoints (Member 2 Responsibility)
  claims: {
    create: (claimData) => request('/claims', { method: 'POST', body: claimData }),
    getMyClaims: () => request('/claims/mine', { method: 'GET' }),
    getItemClaims: (itemId) => request(`/items/${itemId}/claims`, { method: 'GET' }),
    updateStatus: (claimId, statusData) =>
      request(`/claims/${claimId}`, { method: 'PATCH', body: statusData }),
  },
};

export default api;
