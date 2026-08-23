import { useState, useEffect } from 'react';
import { STORAGE_KEY } from '../utils/constants';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ItemCard from '../components/ItemCard';

/**
 * LostItems Page — displays all items where type === 'lost'.
 * Implements search, category/location/status filtering, and sorting.
 */
const LostItems = () => {
  // ---------- State ----------
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');

  // ---------- Load items from Local Storage ----------
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    // Keep only lost items
    const lostItems = stored.filter((item) => item.type === 'lost');
    setItems(lostItems);
  }, []);

  // ---------- Search helper ----------
  const matchesSearch = (item) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    );
  };

  // ---------- Filter + Sort pipeline ----------
  const getFilteredItems = () => {
    let result = items.filter(matchesSearch);

    // Category filter
    if (category) {
      result = result.filter((item) => item.category === category);
    }

    // Location filter
    if (location) {
      result = result.filter((item) => item.location === location);
    }

    // Status filter
    if (status) {
      result = result.filter((item) => item.status === status);
    }

    // Sorting
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  };

  const filteredItems = getFilteredItems();

  // ---------- Reset all filters ----------
  const handleReset = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setStatus('');
    setSort('newest');
  };

  // ---------- Determine empty-state message ----------
  const hasFiltersApplied = search || category || location || status;

  // ---------- Render ----------
  return (
    <main className="page">
      {/* Page header */}
      <header className="page__header">
        <h1 className="page__title">Lost Items</h1>
        <p className="page__subtitle">
          Find belongings that students have reported missing.
        </p>
      </header>

      {/* Search + Filter controls */}
      <div className="controls-bar">
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar
          category={category}
          onCategoryChange={setCategory}
          location={location}
          onLocationChange={setLocation}
          status={status}
          onStatusChange={setStatus}
          sort={sort}
          onSortChange={setSort}
          onReset={handleReset}
        />
      </div>

      {/* Results count */}
      {filteredItems.length > 0 && (
        <p className="results-count">
          Showing <span className="results-count__number">{filteredItems.length}</span>{' '}
          {filteredItems.length === 1 ? 'item' : 'items'}
        </p>
      )}

      {/* Items grid or empty state */}
      {filteredItems.length > 0 ? (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : items.length === 0 ? (
        /* No items at all */
        <div className="empty-state">
          <span className="empty-state__icon">📭</span>
          <h2 className="empty-state__title">No lost items reported yet.</h2>
          <p className="empty-state__text">
            When students report lost belongings, they will appear here.
          </p>
        </div>
      ) : (
        /* Items exist but filters returned nothing */
        <div className="empty-state">
          <span className="empty-state__icon">🔍</span>
          <h2 className="empty-state__title">No items match your search.</h2>
          <p className="empty-state__text">
            Try changing your search or filters.
          </p>
        </div>
      )}
    </main>
  );
};

export default LostItems;
