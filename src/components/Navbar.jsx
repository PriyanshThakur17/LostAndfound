import { useState } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Navbar — Primary responsive top navigation bar.
 */
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__brand" onClick={closeMenu}>
        <span className="navbar__brand-icon">📦</span>
        Campus Lost &amp; Found
      </NavLink>

      <button
        className="navbar__toggle"
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        id="nav-toggle"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <div className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `navbar__link${isActive ? ' navbar__link--active' : ''}`
          }
          onClick={closeMenu}
          end
        >
          Home
        </NavLink>
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
        <NavLink
          to="/items"
          className={({ isActive }) =>
            `navbar__link${isActive ? ' navbar__link--active' : ''}`
          }
          onClick={closeMenu}
          id="nav-all-items"
        >
          🔍 All Items
        </NavLink>
        <NavLink
          to="/report-lost"
          className={({ isActive }) =>
            `navbar__link${isActive ? ' navbar__link--active' : ''}`
          }
          onClick={closeMenu}
        >
          + Report Lost
        </NavLink>
        <NavLink
          to="/report-found"
          className={({ isActive }) =>
            `navbar__link${isActive ? ' navbar__link--active' : ''}`
          }
          onClick={closeMenu}
        >
          + Report Found
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
