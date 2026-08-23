import { useState, useEffect } from 'react';
import { getItems } from '../utils/storage';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ItemCard from '../components/ItemCard';

/**
 * Items Page — Main Browse/Search Module (Member 3).
 * Props:
 *   initialType : optional default type filter ('lost' | 'found' | 'all')
 */
const Items = ({ initialType = 'all' }) => {
  // ---------- State ----------
  const [allItems, setAllItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');

  // Update typeFilter if initialType prop changes (e.g. navigation between /lost-items and /found-items)
  useEffect(() => {
    setTypeFilter(initialType);
  }, [initialType]);

  // ---------- Load data from shared Local Storage ----------
  useEffect(() => {
    const loadedItems = getItems();
    setAllItems(loadedItems);
  }, []);

  // ---------- Search helper ----------
  const matchesSearch = (item) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.location && item.location.toLowerCase().includes(query))
    );
  };

  // ---------- Filtering & Sorting Pipeline ----------
  const getFilteredItems = () => {
    let result = allItems.filter(matchesSearch);

    // Filter by type (lost / found / all)
    if (typeFilter && typeFilter !== 'all') {
      result = result.filter((item) => item.type === typeFilter);
    }

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

    // Sort items
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
        case 'oldest':
          return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
        case 'az':
          return (a.title || '').localeCompare(b.title || '');
        case 'za':
          return (b.title || '').localeCompare(a.title || '');
        default:
          return 0;
      }
    });

    return result;
  };

  const filteredItems = getFilteredItems();

  // Reset all filters
  const handleReset = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setStatus('');
    setTypeFilter(initialType);
    setSort('newest');
  };

  // Dynamic headers based on current type filter
  const getHeaderTitle = () => {
    if (typeFilter === 'lost') return 'Lost Items';
    if (typeFilter === 'found') return 'Found Items';
    return 'Campus Lost & Found Registry';
  };

  const getHeaderSubtitle = () => {
    if (typeFilter === 'lost') return 'Find belongings that students have reported missing on campus.';
    if (typeFilter === 'found') return 'Browse belongings that have been found around campus.';
    return 'Search, filter, and browse all reported lost and found belongings on campus.';
  };

  return (
    <main className="page">
      {/* Page Header */}
      <header className="page__header">
        <h1 className="page__title">{getHeaderTitle()}</h1>
        <p className="page__subtitle">{getHeaderSubtitle()}</p>
      </header>

      {/* Controls Bar (Search + FilterBar) */}
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

      {/* Results Count */}
      {filteredItems.length > 0 && (
        <p className="results-count">
          Showing <span className="results-count__number">{filteredItems.length}</span>{' '}
          {filteredItems.length === 1 ? 'item' : 'items'}
        </p>
      )}

      {/* Items Grid or Empty States */}
      {filteredItems.length > 0 ? (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">📭</span>
          <h2 className="empty-state__title">No items reported yet.</h2>
          <p className="empty-state__text">
            When students report lost or found belongings, they will appear here.
          </p>
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state__icon">🔍</span>
          <h2 className="empty-state__title">No items match your search.</h2>
          <p className="empty-state__text">
            Try changing your search keywords or resetting your filters.
          </p>
        </div>
      )}
    </main>
  );
};

export default Items;
