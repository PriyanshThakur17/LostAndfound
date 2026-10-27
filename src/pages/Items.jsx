import { useState, useEffect, useCallback, useMemo } from 'react';
import { getItems } from '../services/api';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ItemCard from '../components/ItemCard';

/**
 * Items Page — Main Browse/Search Module (Member 3).
 * Connects to Express/MongoDB backend via GET /api/items.
 *
 * Props:
 *   initialType : optional default type filter ('lost' | 'found' | 'all')
 */
const Items = ({ initialType = 'all' }) => {
  // ---------- State ----------
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [typeFilter, setTypeFilter] = useState(initialType);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');

  // ---------- Fetch items from Express API ----------
  const fetchItemsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getItems({
        type: typeFilter,
        category,
        location,
        status,
        search,
        sort,
      });
      setItems(data);
    } catch (err) {
      console.error('Error fetching items from API:', err);
      setError(err.message || 'Failed to load items from the registry server.');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, category, location, status, search, sort]);

  // Refetch when query parameters change (with debounced search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItemsData();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchItemsData]);

  // Reset all filters
  const handleReset = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setStatus('');
    setTypeFilter(initialType);
    setSort('newest');
  };

  // Determine whether any filter or search term is actively set
  const hasActiveFilters = useMemo(() => {
    return (
      search.trim() !== '' ||
      category !== '' ||
      location !== '' ||
      status !== '' ||
      typeFilter !== initialType
    );
  }, [search, category, location, status, typeFilter, initialType]);

  // Dynamic headers based on current type filter
  const getHeaderTitle = () => {
    if (typeFilter === 'lost') return 'Lost Items';
    if (typeFilter === 'found') return 'Found Items';
    return 'Campus Lost & Found Registry';
  };

  const getHeaderSubtitle = () => {
    if (typeFilter === 'lost') {
      return 'Find belongings that students have reported missing on campus.';
    }
    if (typeFilter === 'found') {
      return 'Browse belongings that have been found around campus.';
    }
    return 'Search, filter, and browse all reported lost and found belongings on campus.';
  };

  return (
    <main className="page">
      {/* Page Header */}
      <header className="page__header">
        <h1 className="page__title">{getHeaderTitle()}</h1>
        <p className="page__subtitle">{getHeaderSubtitle()}</p>
      </header>

      {/* Controls Bar (SearchBar + FilterBar) */}
      <div className="controls-bar">
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar
          type={typeFilter}
          onTypeChange={setTypeFilter}
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

      {/* Loading State */}
      {loading && (
        <div className="status-container status-container--loading" role="status" aria-live="polite">
          <div className="loading-spinner" aria-label="Loading items…" />
          <p className="status-container__text">Loading items from database…</p>
        </div>
      )}

      {/* Error State with Retry Button */}
      {!loading && error && (
        <div className="status-container status-container--error" role="alert">
          <span className="status-container__icon">⚠️</span>
          <h2 className="status-container__title">Unable to Load Items</h2>
          <p className="status-container__text">{error}</p>
          <div className="status-container__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={fetchItemsData}
            >
              🔄 Retry Connection
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn--outline"
                onClick={handleReset}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && items.length > 0 && (
        <p className="results-count">
          Showing <span className="results-count__number">{items.length}</span>{' '}
          {items.length === 1 ? 'item' : 'items'}
        </p>
      )}

      {/* Items Grid */}
      {!loading && !error && items.length > 0 && (
        <div className="items-grid">
          {items.map((item) => (
            <ItemCard key={item._id || item.id} item={item} />
          ))}
        </div>
      )}

      {/* Empty States */}
      {!loading && !error && items.length === 0 && (
        hasActiveFilters ? (
          <div className="empty-state">
            <span className="empty-state__icon">🔍</span>
            <h2 className="empty-state__title">No items match your search.</h2>
            <p className="empty-state__text">
              Try changing your search keywords or resetting your active filters.
            </p>
            <button
              type="button"
              className="btn btn--outline empty-state__btn"
              onClick={handleReset}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state__icon">📭</span>
            <h2 className="empty-state__title">No items reported yet.</h2>
            <p className="empty-state__text">
              When students report lost or found belongings, they will appear here.
            </p>
          </div>
        )
      )}
    </main>
  );
};

export default Items;
