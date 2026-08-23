// ============================================
// Campus Lost & Found — Shared Storage Utility
// ============================================
import { sampleItems } from '../data/sampleItems';

export const STORAGE_KEY = 'campusItems';

/**
 * Reads all items from Local Storage (`campusItems`).
 * If empty or null, seeds initial sample items.
 */
export const getItems = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleItems));
      return sampleItems;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleItems));
      return sampleItems;
    }
    return parsed;
  } catch (error) {
    console.error('Error reading from Local Storage:', error);
    return sampleItems;
  }
};

/**
 * Saves item array to Local Storage under `campusItems`.
 */
export const saveItems = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving to Local Storage:', error);
  }
};

/**
 * Adds a single new item to Local Storage.
 */
export const addItem = (newItem) => {
  const current = getItems();
  const updated = [newItem, ...current];
  saveItems(updated);
  return updated;
};
