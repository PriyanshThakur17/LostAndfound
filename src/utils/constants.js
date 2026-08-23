// ============================================
// Campus Lost & Found — Shared Constants
// ============================================

/** Allowed item categories */
export const CATEGORIES = [
  'Electronics',
  'Documents',
  'Accessories',
  'Books',
  'Clothing',
  'Bags',
  'Keys',
  'Other',
];

/** Allowed campus locations */
export const LOCATIONS = [
  'Main Gate',
  'Library',
  'Cafeteria',
  'Block A',
  'Block B',
  'Auditorium',
  'Sports Complex',
  'Parking',
  'Hostel',
  'Other',
];

/** Allowed item statuses */
export const STATUSES = ['Open', 'Claimed', 'Archived'];

/** Sort options used in FilterBar */
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'az', label: 'A — Z' },
  { value: 'za', label: 'Z — A' },
];

/** The single Local Storage key used by all team members */
export const STORAGE_KEY = 'campusItems';

/** Category icons for visual display on cards */
export const CATEGORY_ICONS = {
  Electronics: '🎧',
  Documents: '📄',
  Accessories: '⌚',
  Books: '📚',
  Clothing: '👕',
  Bags: '🎒',
  Keys: '🔑',
  Other: '📦',
};
