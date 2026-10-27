import axios from 'axios';

/**
 * Shared Axios API Client — Member 4 & Team Responsibility.
 *
 * Configured with baseURL, withCredentials, request/response interceptors,
 * and typed helper methods for Auth, Items, and Claims.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor: attach bearer token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campus_auth_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred. Please check your connection.';
    return Promise.reject(new Error(message));
  }
);

// ============================================
// Auth Helpers (Member 4)
// ============================================
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUser = () => api.post('/auth/logout');
export const fetchMe = () => api.get('/auth/me');
export const fetchHealth = () => api.get('/health');

// ============================================
// Item Helpers (Members 1, 2, 3)
// ============================================

/**
 * Retrieve items with search, filter, and sort options.
 * @param {Object} params - { type, category, location, status, search, q, sort }
 * @returns {Promise<Array>} List of items from MongoDB
 */
export const getItems = async (params = {}) => {
  const cleanParams = {};

  if (params.type && params.type !== 'all') {
    cleanParams.type = params.type;
  }
  if (params.category && params.category !== 'all') cleanParams.category = params.category;
  if (params.location && params.location !== 'all') cleanParams.location = params.location;
  if (params.status && params.status !== 'all') cleanParams.status = params.status;

  const searchQuery = params.search || params.q;
  if (searchQuery && searchQuery.trim() !== '') {
    cleanParams.search = searchQuery.trim();
    cleanParams.q = searchQuery.trim();
  }

  if (params.sort) cleanParams.sort = params.sort;

  const response = await api.get('/items', { params: cleanParams });
  return response.data?.data || response.data || [];
};

export const fetchItems = getItems;

/**
 * Retrieve a single item by its MongoDB _id.
 * @param {string} id - MongoDB ObjectId or legacy string id
 * @returns {Promise<Object>} The item document
 */
export const getItemById = async (id) => {
  if (!id) throw new Error('Item ID is required');
  const response = await api.get(`/items/${id}`);
  return response.data?.data || response.data?.item || response.data || null;
};

export const fetchItem = getItemById;

/**
 * Create a new lost or found item.
 * Supports both FormData (for file uploads) and JSON objects.
 * @param {Object|FormData} itemData - Item attributes matching MongoDB schema
 * @returns {Promise<Object>} Created item document
 */
export const createItem = async (itemData) => {
  const isFormData = typeof FormData !== 'undefined' && itemData instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.post('/items', itemData, config);
  return response.data?.data || response.data || null;
};

// ============================================
// Claim Helpers (Members 1, 2, 4)
// ============================================

/**
 * Submit an ownership verification claim or found item report.
 * @param {Object} claimData - { itemId, contactName, itemColor, uniqueFeature, ... }
 * @returns {Promise<Object>} Created claim record
 */
export const createClaim = async (claimData) => {
  if (!claimData?.itemId) throw new Error('itemId is required to submit a claim');
  const response = await api.post('/claims', claimData);
  return response.data;
};

export const getItemClaims = async (itemId) => {
  const response = await api.get(`/claims/item/${itemId}`);
  return response.data?.data || response.data?.claims || [];
};

export const updateClaimStatus = async (claimId, data) => {
  const response = await api.patch(`/claims/${claimId}`, data);
  return response.data;
};

export default api;
