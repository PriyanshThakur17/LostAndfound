import axios from 'axios';

/**
 * Shared Axios API Client — Member 4 Responsibility (Contract-aligned).
 *
 * Configured with baseURL, request/response interceptors, and typed helper methods
 * for querying items and submitting ownership claims to the Express/MongoDB backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred. Please check the backend connection.';
    return Promise.reject(new Error(message));
  }
);

/**
 * Retrieve items with search, filter, and sort options.
 * @param {Object} params - { type, category, location, status, search, sort }
 * @returns {Promise<Array>} List of items from MongoDB
 */
export const getItems = async (params = {}) => {
  const cleanParams = {};

  if (params.type && params.type !== 'all') {
    cleanParams.type = params.type;
  }
  if (params.category) cleanParams.category = params.category;
  if (params.location) cleanParams.location = params.location;
  if (params.status) cleanParams.status = params.status;
  if (params.search && params.search.trim() !== '') cleanParams.search = params.search.trim();
  if (params.sort) cleanParams.sort = params.sort;

  const response = await api.get('/items', { params: cleanParams });
  return response.data?.data || [];
};

/**
 * Retrieve a single item by its MongoDB _id.
 * @param {string} id - MongoDB ObjectId or legacy string id
 * @returns {Promise<Object>} The item document
 */
export const getItemById = async (id) => {
  if (!id) throw new Error('Item ID is required');
  const response = await api.get(`/items/${id}`);
  return response.data?.data || null;
};

/**
 * Submit an ownership verification claim or found item report.
 * @param {Object} claimData - { itemId, contactName, itemColor, uniqueFeature, lostLocation, foundLocation, foundDate, additionalInfo }
 * @returns {Promise<Object>} Created claim record
 */
export const createClaim = async (claimData) => {
  if (!claimData?.itemId) throw new Error('itemId is required to submit a claim');
  const response = await api.post('/claims', claimData);
  return response.data;
};

/**
 * Create a new lost or found item.
 * @param {Object} itemData - Item attributes matching MongoDB schema
 * @returns {Promise<Object>} Created item document
 */
export const createItem = async (itemData) => {
  const response = await api.post('/items', itemData);
  return response.data?.data || null;
};

export default api;
