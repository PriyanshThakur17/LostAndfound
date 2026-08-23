import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { STORAGE_KEY } from './utils/constants';
import { sampleItems } from './utils/sampleData';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';

/**
 * App — Root component.
 * Sets up routing, navigation bar, and seeds sample data
 * into Local Storage on first visit.
 */
const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Seed Local Storage with sample data if empty (first visit)
  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (existing.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleItems));
    }
  }, []);

  // Toggle mobile navigation menu
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Close menu when a link is clicked (mobile UX)
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ==================== Navbar ==================== */}
      <nav className="navbar">
        <NavLink to="/" className="navbar__brand" onClick={closeMenu}>
          <span className="navbar__brand-icon">📦</span>
          Campus Lost &amp; Found
        </NavLink>

        {/* Hamburger toggle for mobile */}
        <button
          className="navbar__toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          id="nav-toggle"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
          <NavLink
            to="/lost-items"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
            onClick={closeMenu}
            id="nav-lost-items"
          >
            🔴 Lost Items
          </NavLink>
          <NavLink
            to="/found-items"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
            onClick={closeMenu}
            id="nav-found-items"
          >
            🟢 Found Items
          </NavLink>
        </div>
      </nav>

      {/* ==================== Routes ==================== */}
      <Routes>
        <Route path="/" element={<Navigate to="/lost-items" replace />} />
        <Route path="/lost-items" element={<LostItems />} />
        <Route path="/found-items" element={<FoundItems />} />
        {/* Placeholder route — Item Details page is Member 4's responsibility */}
        <Route
          path="/item/:id"
          element={
            <main className="page">
              <div className="empty-state">
                <span className="empty-state__icon">🔧</span>
                <h2 className="empty-state__title">Item Details</h2>
                <p className="empty-state__text">
                  This page will be implemented by another team member.
                </p>
              </div>
            </main>
          }
        />
        {/* Fallback for unmatched routes */}
        <Route
          path="*"
          element={
            <main className="page">
              <div className="empty-state">
                <span className="empty-state__icon">🚫</span>
                <h2 className="empty-state__title">Page Not Found</h2>
                <p className="empty-state__text">
                  The page you're looking for doesn't exist.
                </p>
              </div>
            </main>
          }
        />
      </Routes>
    </>
  );
};

export default App;
