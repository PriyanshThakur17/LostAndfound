import { CATEGORIES, LOCATIONS, STATUSES, SORT_OPTIONS } from '../utils/constants';

/**
 * FilterBar — Reusable filter controls shared by Lost & Found pages.
 * Props:
 *   category  / onCategoryChange
 *   location  / onLocationChange
 *   status    / onStatusChange
 *   sort      / onSortChange
 *   onReset   : callback to clear all filters
 */
const FilterBar = ({
  category,
  onCategoryChange,
  location,
  onLocationChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  onReset,
}) => {
  return (
    <div className="filter-bar">
      {/* Category filter */}
      <select
        id="filter-category"
        className="filter-bar__select"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Location filter */}
      <select
        id="filter-location"
        className="filter-bar__select"
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        aria-label="Filter by location"
      >
        <option value="">All Locations</option>
        {LOCATIONS.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>

      {/* Status filter */}
      <select
        id="filter-status"
        className="filter-bar__select"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label="Filter by status"
      >
        <option value="">All Statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* Sort control */}
      <select
        id="filter-sort"
        className="filter-bar__select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort items"
      >
        {SORT_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Reset all filters */}
      <button
        id="filter-reset"
        className="filter-bar__reset"
        onClick={onReset}
        type="button"
      >
        ✕ Reset
      </button>
    </div>
  );
};

export default FilterBar;
