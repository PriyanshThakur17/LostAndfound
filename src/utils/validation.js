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

/**
 * Validates the report lost form data.
 * @param {Object} formData - { title, category, description, location, date, image }
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateLostForm = (formData) => {
  const errors = {};

  // 1. Item Name validation
  if (!formData.title || !formData.title.trim()) {
    errors.title = 'Item name is required.';
  } else if (formData.title.trim().length < 2) {
    errors.title = 'Item name must be at least 2 characters.';
  }

  // 2. Category validation
  if (!formData.category) {
    errors.category = 'Please select a category.';
  } else if (!CATEGORIES.includes(formData.category)) {
    errors.category = 'Please select a valid category.';
  }

  // 3. Location validation
  if (!formData.location) {
    errors.location = 'Please select the location where the item was lost.';
  } else if (!LOCATIONS.includes(formData.location)) {
    errors.location = 'Please select a valid location.';
  }

  // 4. Date validation
  if (!formData.date) {
    errors.date = 'Please select the date the item was lost.';
  } else {
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (isNaN(selectedDate.getTime())) {
      errors.date = 'Please enter a valid date.';
    } else if (selectedDate > today) {
      errors.date = 'Lost date cannot be in the future.';
    }
  }

  // 5. Description validation
  if (!formData.description || !formData.description.trim()) {
    errors.description = 'Description is required.';
  } else if (formData.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters to be meaningful.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates an uploaded image file.
 * @param {File} file
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateImageFile = (file) => {
  if (!file) return { isValid: true, error: null };

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!file.type || !validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPG, PNG, WEBP, or GIF).',
    };
  }

  // Max 5MB limit check
  const maxSizeBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: 'Image size must be less than 5 MB.',
    };
  }

  return { isValid: true, error: null };
};
