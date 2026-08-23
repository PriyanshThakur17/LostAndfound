import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import VerificationForm from '../components/VerificationForm';
import { getItemById, updateItem } from '../utils/storage';
import './ItemDetails.css';

// ============================================
// ItemDetails — Member 4 Main Page
// Route: /item/:id
//
// Reads the item ID from the URL, fetches it
// from campusItems in Local Storage, and
// renders the full item details with the
// appropriate claim / verification action.
// ============================================

function ItemDetails() {
  const { id } = useParams();       // Get :id from the URL
  const navigate = useNavigate();

  // ---- State ----
  const [item, setItem] = useState(null);         // The found item object
  const [notFound, setNotFound] = useState(false); // True if ID doesn't exist
  const [showForm, setShowForm] = useState(false); // Whether to show verification form
  const [claimed, setClaimed] = useState(false);   // Whether we just submitted a claim

  // ---- Load item on mount or when URL id changes ----
  useEffect(() => {
    const foundItem = getItemById(id);

    if (foundItem) {
      setItem(foundItem);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
  }, [id]);

  // ---- Helper: format date to readable string ----
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // ---- Handler: user clicks the claim/action button ----
  const handleActionClick = () => {
    setShowForm(true);
    // Smooth scroll to the form
    setTimeout(() => {
      document.getElementById('verification-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  // ---- Handler: verification form submitted successfully ----
  const handleVerificationSuccess = (formData) => {
    // Update item status to 'Claimed' in Local Storage
    updateItem(item.id, { status: 'Claimed' });

    // Update local component state so UI refreshes immediately
    setItem((prev) => ({ ...prev, status: 'Claimed' }));
    setShowForm(false);
    setClaimed(true);

    // Scroll to top to see the success card
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---- Handler: user cancels the form ----
  const handleCancel = () => {
    setShowForm(false);
  };

  // ---- Category icon map ----
  const categoryIcons = {
    Electronics: '💻',
    Documents: '📄',
    Accessories: '👜',
    Books: '📚',
    Clothing: '👕',
    Bags: '🎒',
    Keys: '🔑',
    Other: '📦',
  };

  // ================================================
  // RENDER: Not Found State
  // ================================================
  if (notFound) {
    return (
      <div className="item-details-page">
        <div className="container">
          <div className="not-found-card">
            <div className="not-found-icon">🔍</div>
            <h2 className="not-found-title">Item Not Found</h2>
            <p className="not-found-message">
              The item you&apos;re looking for does not exist or may have been removed
              from the registry.
            </p>
            <div className="not-found-actions">
              <Link to="/lost-items" className="btn btn--secondary">
                Browse Lost Items
              </Link>
              <Link to="/found-items" className="btn btn--primary">
                Browse Found Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER: Loading State
  // ================================================
  if (!item) {
    return (
      <div className="item-details-page">
        <div className="container">
          <div className="loading-card">
            <div className="loading-spinner" aria-label="Loading item details…"></div>
            <p>Loading item details…</p>
          </div>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER: Success State (after claim)
  // ================================================
  if (claimed) {
    return (
      <div className="item-details-page">
        <div className="container">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2 className="success-title">Verification Submitted!</h2>
            <p className="success-message">
              Your ownership information has been recorded for{' '}
              <strong>{item.title}</strong>.
            </p>
            <div className="success-status">
              Item Status: <StatusBadge status="Claimed" size="md" />
            </div>
            <p className="success-note">
              Thank you for helping reconnect this item with its owner.
              The registry team will follow up if needed.
            </p>
            <div className="success-actions">
              <Link to="/lost-items" className="btn btn--secondary">
                Browse Lost Items
              </Link>
              <Link to="/found-items" className="btn btn--primary">
                Browse Found Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER: Main Item Details View
  // ================================================

  const { type, title, category, description, location, date, image, status, createdBy, createdAt } = item;

  // Determine the action button label based on item type
  const actionLabel = type === 'lost' ? '📦 I Found This Item' : '🔐 This Is My Item';
  const actionDesc = type === 'lost'
    ? 'Found this item? Help the owner get it back.'
    : 'Lost this item? Verify your ownership to claim it.';

  const categoryIcon = categoryIcons[category] || '📦';
  const typeBadgeClass = type === 'lost' ? 'type-badge type-badge--lost' : 'type-badge type-badge--found';
  const typeLabel = type === 'lost' ? 'LOST' : 'FOUND';

  return (
    <div className="item-details-page">
      <div className="container">

        {/* ── Back Navigation ── */}
        <div className="back-nav">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            ← Back to Items
          </button>
        </div>

        {/* ── Main Details Card ── */}
        <div className="item-details-card">

          {/* LEFT: Image Panel */}
          <div className="item-image-panel">
            {image ? (
              <img
                src={image}
                alt={`Image of ${title}`}
                className="item-image"
              />
            ) : (
              <div className="item-image-placeholder" aria-label="No image available">
                <span className="placeholder-icon">{categoryIcon}</span>
                <span className="placeholder-text">No Image Available</span>
              </div>
            )}

            {/* Type badge overlaid on image panel */}
            <div className="image-panel-footer">
              <span className={typeBadgeClass}>{typeLabel}</span>
              <StatusBadge status={status} size="sm" />
            </div>
          </div>

          {/* RIGHT: Info Panel */}
          <div className="item-info-panel">

            {/* Title & badges */}
            <div className="item-header">
              <h1 className="item-title">{title}</h1>
            </div>

            {/* Meta info */}
            <div className="item-meta">
              <div className="meta-row">
                <span className="meta-icon">{categoryIcon}</span>
                <span className="meta-label">Category:</span>
                <span className="meta-value">{category}</span>
              </div>
              <div className="meta-row">
                <span className="meta-icon">📍</span>
                <span className="meta-label">Location:</span>
                <span className="meta-value">{location}</span>
              </div>
              <div className="meta-row">
                <span className="meta-icon">📅</span>
                <span className="meta-label">Date:</span>
                <span className="meta-value">{formatDate(date)}</span>
              </div>
              <div className="meta-row">
                <span className="meta-icon">👤</span>
                <span className="meta-label">Reported by:</span>
                <span className="meta-value">{createdBy}</span>
              </div>
              <div className="meta-row">
                <span className="meta-icon">🗓️</span>
                <span className="meta-label">Posted on:</span>
                <span className="meta-value">{formatDate(createdAt)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="item-description">
              <h3 className="description-heading">Description</h3>
              <p className="description-text">{description || 'No description provided.'}</p>
            </div>

            {/* Status section */}
            <div className="item-status-row">
              <span className="status-label">Current Status:</span>
              <StatusBadge status={status} size="md" />
            </div>

            {/* ── Action Button (conditional on status) ── */}
            {status === 'Open' && (
              <div className="item-action">
                <p className="action-description">{actionDesc}</p>
                <button
                  className="action-btn"
                  onClick={handleActionClick}
                  aria-label={actionLabel}
                >
                  {actionLabel}
                </button>
              </div>
            )}

            {status === 'Claimed' && !claimed && (
              <div className="claimed-notice">
                <span className="claimed-icon">✅</span>
                <div>
                  <p className="claimed-title">This item has been claimed.</p>
                  <p className="claimed-subtitle">
                    If you believe this is yours, please contact the registry office directly.
                  </p>
                </div>
              </div>
            )}

            {status === 'Archived' && (
              <div className="archived-notice">
                <span className="archived-icon">🗄️</span>
                <div>
                  <p className="archived-title">This item has been archived.</p>
                  <p className="archived-subtitle">
                    This listing is no longer active. Please visit the registry office for assistance.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Verification Form (shown when user clicks action button) ── */}
        {showForm && (
          <section id="verification-section" className="verification-section">
            <VerificationForm
              item={item}
              onSuccess={handleVerificationSuccess}
              onCancel={handleCancel}
            />
          </section>
        )}

      </div>
    </div>
  );
}

export default ItemDetails;
