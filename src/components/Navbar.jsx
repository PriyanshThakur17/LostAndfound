import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api, { getStoredUser, setAuthToken, setStoredUser } from '../api/client';

/**
 * Navbar — Primary responsive top navigation bar with User Authentication status.
 */
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  // Synchronize authentication state across components
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    closeMenu();
    try {
      await api.post('/auth/logout');
    } catch {
      // offline fallback
    }
    setAuthToken(null);
    setStoredUser(null);
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

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

        {/* Authentication Navigation Link / User Info */}
        {user ? (
          <div className="navbar__user-section">
            <span className="navbar__user-label" title={user.email}>
              👤 {user.name}
            </span>
            <button
              type="button"
              className="navbar__link navbar__link--logout"
              onClick={handleLogout}
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `navbar__link navbar__link--auth${isActive ? ' navbar__link--active' : ''}`
            }
            onClick={closeMenu}
            id="nav-auth"
          >
            🔐 Sign In / Register
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
