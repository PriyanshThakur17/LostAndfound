// ============================================
// Campus Lost & Found — Shared Storage Utility
// ============================================

export const STORAGE_KEY = 'campusItems';

/**
 * Reads all items from Local Storage (`campusItems`).
 * If empty or null, returns empty array.
 */
export const getItems = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Filter out initial legacy dummy items (IDs 1 through 10)
    const cleaned = parsed.filter(
      (item) => item && (typeof item.id !== 'number' || item.id > 100)
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (error) {
    console.error('Error reading from Local Storage:', error);
    return [];
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

/**
 * Finds a single item by its ID.
 * @param {number|string} id
 * @returns {Object|null}
 */
export const getItemById = (id) => {
  const items = getItems();
  return items.find((item) => String(item.id) === String(id)) || null;
};

/**
 * Updates an item by ID by merging changes.
 * @param {number|string} id
 * @param {Object} changes
 */
export const updateItem = (id, changes) => {
  const items = getItems();
  const updatedItems = items.map((currentItem) =>
    String(currentItem.id) === String(id)
      ? { ...currentItem, ...changes }
      : currentItem
  );
  saveItems(updatedItems);
  return updatedItems;
};
