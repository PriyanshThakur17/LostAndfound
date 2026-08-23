import { NavLink } from 'react-router-dom';

/**
 * Home Page — Overview of the Campus Lost & Found Registry.
 */
const Home = () => {
  return (
    <main className="page">
      <section className="hero">
        <h1 className="hero__title">Campus Lost &amp; Found Registry</h1>
        <p className="hero__subtitle">
          The central hub for Chitkara University students to report, search, and reclaim lost belongings.
        </p>

        <div className="hero__actions">
          <NavLink to="/lost-items" className="btn btn--primary">
            🔴 Browse Lost Items
          </NavLink>
          <NavLink to="/found-items" className="btn btn--secondary">
            🟢 Browse Found Items
          </NavLink>
          <NavLink to="/report-lost" className="btn btn--outline">
            + Report Lost Item
          </NavLink>
          <NavLink to="/report-found" className="btn btn--outline">
            + Report Found Item
          </NavLink>
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <span className="feature-card__icon">🔍</span>
          <h3 className="feature-card__title">Search &amp; Filter</h3>
          <p className="feature-card__desc">
            Instantly search by title, description, campus location, or category to find missing items.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-card__icon">📢</span>
          <h3 className="feature-card__title">Quick Reporting</h3>
          <p className="feature-card__desc">
            Easily report lost belongings or found items around campus with detailed descriptions.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-card__icon">🤝</span>
          <h3 className="feature-card__title">Safe Claims</h3>
          <p className="feature-card__desc">
            Verify ownership and claim your items safely through campus coordination.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Home;
