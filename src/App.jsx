import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ItemDetails from './pages/ItemDetails';
import { seedDataIfEmpty } from './utils/storage';
import './App.css';

// ============================================
// Placeholder components for other team members.
// Members 1, 2, 3 will replace these with their
// actual page components on their branches.
// ============================================

function HomePage() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <span className="placeholder-emoji">🎓</span>
        <h2>Campus Lost &amp; Found Registry</h2>
        <p>
          Welcome! Use the navigation to browse lost or found items,
          or report an item.
        </p>
        <div className="placeholder-links">
          <a href="/lost-items" className="placeholder-link placeholder-link--lost">
            Browse Lost Items →
          </a>
          <a href="/found-items" className="placeholder-link placeholder-link--found">
            Browse Found Items →
          </a>
          <a href="/report-lost" className="placeholder-link">
            Report Lost Item →
          </a>
          <a href="/report-found" className="placeholder-link">
            Report Found Item →
          </a>
        </div>
        <p className="placeholder-note">
          <em>Demo:</em> Try <a href="/item/1">/item/1</a> (lost) or{' '}
          <a href="/item/2">/item/2</a> (found) to see the Item Details module.
        </p>
      </div>
    </div>
  );
}

// Generic placeholder for other members' pages
function PlaceholderPage({ title, member }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <span className="placeholder-emoji">🔨</span>
        <h2>{title}</h2>
        <p>This page is being built by <strong>{member}</strong>.</p>
        <p className="placeholder-note">
          Please merge their branch to see this page.
        </p>
        <a href="/" className="placeholder-link">← Back to Home</a>
      </div>
    </div>
  );
}

// ============================================
// App — Root Component
// ============================================

function App() {
  // Seed Local Storage with sample data on first load
  useEffect(() => {
    seedDataIfEmpty();
  }, []);

  return (
    <>
      <Navbar />

      <main className="page-content">
        <div className="container">
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomePage />} />

            {/* Member 3 — Lost & Found Listings */}
            <Route
              path="/lost-items"
              element={<PlaceholderPage title="Lost Items" member="Member 3" />}
            />
            <Route
              path="/found-items"
              element={<PlaceholderPage title="Found Items" member="Member 3" />}
            />

            {/* Member 1 — Report Lost */}
            <Route
              path="/report-lost"
              element={<PlaceholderPage title="Report Lost Item" member="Member 1" />}
            />

            {/* Member 2 — Report Found */}
            <Route
              path="/report-found"
              element={<PlaceholderPage title="Report Found Item" member="Member 2" />}
            />

            {/* Member 4 — Item Details (THIS MODULE) */}
            <Route path="/item/:id" element={<ItemDetails />} />

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <PlaceholderPage
                  title="Page Not Found"
                  member="the system"
                />
              }
            />
          </Routes>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;
