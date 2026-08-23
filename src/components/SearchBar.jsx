import { useState } from 'react';

/**
 * SearchBar — Reusable controlled search input.
 * Props:
 *   value    : current search string (controlled)
 *   onChange  : callback invoked with new search string
 *   placeholder : optional custom placeholder
 */
const SearchBar = ({ value, onChange, placeholder = 'Search items by title, description, category or location…' }) => {
  return (
    <div className="search-bar">
      {/* Magnifying-glass SVG icon */}
      <span className="search-bar__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        id="search-input"
        className="search-bar__input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search items"
      />
    </div>
  );
};

export default SearchBar;
