import { NavLink } from 'react-router-dom';

/**
 * Footer — Reusable footer matching the university portal design system.
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <span className="footer__brand-icon">📦</span>
          <span className="footer__brand-name">Campus Lost &amp; Found Registry</span>
        </div>
        <p className="footer__tagline">
          Helping students relocate lost belongings across campus safely and efficiently.
        </p>
        <div className="footer__links">
          <NavLink to="/" className="footer__link">Home</NavLink>
          <NavLink to="/lost-items" className="footer__link">Lost Items</NavLink>
          <NavLink to="/found-items" className="footer__link">Found Items</NavLink>
          <NavLink to="/items" className="footer__link">All Items</NavLink>
        </div>
        <p className="footer__copyright">
          © {new Date().getFullYear()} Campus Lost &amp; Found Registry — Academic Project
        </p>
      </div>
    </footer>
  );
};

export default Footer;
