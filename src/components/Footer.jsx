import './Footer.css';

/**
 * Shared Footer component — used across all team member pages.
 * Do NOT duplicate this component.
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-brand">
          <span className="footer-logo">🎓</span>
          <span className="footer-name">Campus Lost &amp; Found Registry</span>
        </div>
        <p className="footer-copy">
          &copy; {currentYear} University Campus. Helping reconnect students with their belongings.
        </p>
        <div className="footer-links">
          <a href="/lost-items">Lost Items</a>
          <a href="/found-items">Found Items</a>
          <a href="/report-lost">Report Lost</a>
          <a href="/report-found">Report Found</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
