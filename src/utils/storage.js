// ============================================
// Campus Lost & Found Registry
// Shared Local Storage Utilities
// ============================================

const STORAGE_KEY = 'campusItems';

// Sample seed data for development/testing
const SEED_DATA = [
  {
    id: 1,
    type: 'lost',
    title: 'AirPods Pro',
    category: 'Electronics',
    description: 'White AirPods Pro case with engraving "J.K." on the inside lid. Lost somewhere near the university library on Monday.',
    location: 'Library',
    date: '2026-08-20',
    image: '',
    status: 'Open',
    createdBy: 'Student',
    createdAt: '2026-08-20',
  },
  {
    id: 2,
    type: 'found',
    title: 'Black Wallet',
    category: 'Accessories',
    description: 'Black leather wallet found near the cafeteria entrance. Contains student ID and some cash. No phone number found inside.',
    location: 'Cafeteria',
    date: '2026-08-21',
    image: '',
    status: 'Open',
    createdBy: 'Student',
    createdAt: '2026-08-21',
  },
  {
    id: 3,
    type: 'lost',
    title: 'Blue Backpack',
    category: 'Bags',
    description: 'Navy blue Jansport backpack with a small keychain attached. Contains textbooks for Engineering Mathematics.',
    location: 'Block A',
    date: '2026-08-22',
    image: '',
    status: 'Open',
    createdBy: 'Staff',
    createdAt: '2026-08-22',
  },
  {
    id: 4,
    type: 'found',
    title: 'Student ID Card',
    category: 'Documents',
    description: 'Found a student ID card near the sports complex. Name partially visible. Please describe the card to claim.',
    location: 'Sports Complex',
    date: '2026-08-23',
    image: '',
    status: 'Claimed',
    createdBy: 'Student',
    createdAt: '2026-08-23',
  },
];

/**
 * Read all items from Local Storage.
 * Returns an empty array if storage is empty or data is malformed.
 */
export function getItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Ensure we always return an array
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read campusItems from Local Storage:', error);
    return [];
  }
}

/**
 * Save items array back to Local Storage.
 * @param {Array} items - Array of item objects
 */
export function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save campusItems to Local Storage:', error);
  }
}

/**
 * Find a single item by its numeric ID.
 * @param {number|string} id
 * @returns {Object|null} item or null if not found
 */
export function getItemById(id) {
  const items = getItems();
  const numericId = Number(id);
  return items.find((item) => item.id === numericId) || null;
}

/**
 * Update a single item in storage by merging the provided changes.
 * @param {number} id - item ID
 * @param {Object} changes - fields to merge into the item
 */
export function updateItem(id, changes) {
  const items = getItems();
  const updatedItems = items.map((currentItem) =>
    currentItem.id === Number(id)
      ? { ...currentItem, ...changes }
      : currentItem
  );
  saveItems(updatedItems);
}

/**
 * Seed Local Storage with sample data ONLY if campusItems is empty.
 * Called once at app startup.
 */
export function seedDataIfEmpty() {
  const existing = getItems();
  if (existing.length === 0) {
    saveItems(SEED_DATA);
  }
}
