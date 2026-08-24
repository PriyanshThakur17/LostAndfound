// ============================================
// Campus Lost & Found — Validation Helpers
// ============================================
import { CATEGORIES, LOCATIONS, STATUSES, TYPES } from '../data/sampleItems';

/**
 * Validates an item object before saving.
 * Returns { valid: boolean, errors: string[] }
 */
export const validateItem = (item) => {
  const errors = [];

  if (!item.title || item.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!item.type || !TYPES.includes(item.type)) {
    errors.push('Type must be either "lost" or "found"');
  }

  if (!item.category || !CATEGORIES.includes(item.category)) {
    errors.push('Invalid category selected');
  }

  if (!item.location || !LOCATIONS.includes(item.location)) {
    errors.push('Invalid campus location selected');
  }

  if (item.status && !STATUSES.includes(item.status)) {
    errors.push('Invalid status specified');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
