import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

/**
 * Shared Navbar component — used across all team member pages.
 * Do NOT duplicate this component.
 */
function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner container">
        {/* Logo / Brand */}
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo-icon">🎓</span>
          <div className="navbar-brand-text">
            <span className="navbar-title">Campus Lost &amp; Found</span>
            <span className="navbar-subtitle">University Registry</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="navbar-nav">
          <NavLink
            to="/lost-items"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link--active' : 'nav-link'
            }
          >
            Lost Items
          </NavLink>
          <NavLink
            to="/found-items"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link--active' : 'nav-link'
            }
          >
            Found Items
          </NavLink>
          <NavLink
            to="/report-lost"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link--active' : 'nav-link'
            }
          >
            Report Lost
          </NavLink>
          <NavLink
            to="/report-found"
            className="nav-link nav-link--button"
          >
            Report Found
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
