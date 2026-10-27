import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import VerificationForm from '../components/VerificationForm';
import { getItemById, createClaim } from '../services/api';
import { CATEGORY_ICONS } from '../data/sampleItems';

/**
 * ItemDetails — Detailed view & claim submission (Member 3 & Member 4 integration).
 * Route: /item/:id
 *
 * Reads item MongoDB _id from URL, loads via GET /api/items/:id,
 * and submits ownership verification via POST /api/claims.
 */
const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState(null);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Load item details from Express backend with cleanup
  useEffect(() => {
    let isMounted = true;

    async function fetchItemDetails() {
      try {
        const data = await getItemById(id);
        if (!isMounted) return;
        if (data) {
          setItem(data);
          setNotFound(false);
          setError(null);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        if (!isMounted) return;
        if (err.message && (err.message.includes('not found') || err.message.includes('404'))) {
          setNotFound(true);
        } else {
          setError(err.message || 'Unable to connect to registry server.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchItemDetails();

    return () => {
      isMounted = false;
    };
  }, [id, reloadTrigger]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadTrigger((prev) => prev + 1);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString('en-GB', options);
    } catch {
      return dateString;
    }
  };

  const handleActionClick = () => {
    setShowForm(true);
    setClaimError(null);
    setTimeout(() => {
      document.getElementById('verification-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  // Submit claim to POST /api/claims and confirm success only after backend response
  const handleVerificationSuccess = async (formData) => {
    setSubmittingClaim(true);
    setClaimError(null);

    try {
      const payload = {
        itemId: item._id || item.id,
        ...formData,
      };

      const result = await createClaim(payload);

      if (result && result.success) {
        setItem((prev) => ({ ...prev, status: 'Claimed' }));
        setShowForm(false);
        setClaimed(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result?.message || 'Verification could not be processed.');
      }
    } catch (err) {
      console.error('Claim submission error:', err);
      setClaimError(err.message || 'Failed to submit claim to server. Please try again.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setClaimError(null);
  };

  // ---------------- Loading State ----------------
  if (loading) {
    return (
      <main className="page">
        <div className="loading-card" role="status" aria-live="polite">
          <div className="loading-spinner" aria-label="Loading item details…" />
          <p>Loading item details from database…</p>
        </div>
      </main>
    );
  }

  // ---------------- Error State with Retry ----------------
  if (error) {
    return (
      <main className="page">
        <div className="not-found-card status-container--error" role="alert">
          <div className="not-found-icon">⚠️</div>
          <h2 className="not-found-title">Failed to Load Item</h2>
          <p className="not-found-message">{error}</p>
          <div className="not-found-actions">
            <button type="button" className="btn btn--primary" onClick={handleRetry}>
              🔄 Retry Request
            </button>
            <button type="button" className="btn btn--outline" onClick={() => navigate(-1)}>
              ← Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ---------------- Not Found State ----------------
  if (notFound || !item) {
    return (
      <main className="page">
        <div className="not-found-card">
          <div className="not-found-icon">🔍</div>
          <h2 className="not-found-title">Item Not Found</h2>
          <p className="not-found-message">
            The item you're looking for does not exist in the database or may have been removed.
          </p>
          <div className="not-found-actions">
            <Link to="/lost-items" className="btn btn--outline">
              Browse Lost Items
            </Link>
            <Link to="/found-items" className="btn btn--primary">
              Browse Found Items
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ---------------- Success State (Post-Claim) ----------------
  if (claimed) {
    return (
      <main className="page">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2 className="success-title">Verification Submitted to Database!</h2>
          <p className="success-message">
            Your claim information has been confirmed by the server for{' '}
            <strong>{item.title}</strong>.
          </p>
          <div className="success-status">
            Item Status: <StatusBadge status="Claimed" size="md" />
          </div>
          <p className="success-note">
            The registry server has recorded your verification details. The campus coordinator will follow up with you.
          </p>
          <div className="success-actions">
            <Link to="/lost-items" className="btn btn--outline">
              Browse Lost Items
            </Link>
            <Link to="/found-items" className="btn btn--primary">
              Browse Found Items
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ---------------- Main Details View ----------------
  const { type, title, category, description, location, date, image, status, createdBy, createdAt } = item;

  const actionLabel = type === 'lost' ? '📦 I Found This Item' : '🔐 This Is My Item';
  const actionDesc =
    type === 'lost'
      ? 'Found this item? Help the owner get it back.'
      : 'Lost this item? Verify your ownership to claim it.';

  const categoryIcon = CATEGORY_ICONS[category] || '📦';
  const typeBadgeClass = type === 'lost' ? 'type-badge type-badge--lost' : 'type-badge type-badge--found';
  const typeLabel = type === 'lost' ? 'LOST' : 'FOUND';

  return (
    <main className="page">
      {/* Back Navigation */}
      <div className="back-nav">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          ← Back to Items
        </button>
      </div>

      {/* Main Details Card */}
      <div className="item-details-card">
        {/* Left: Image Panel */}
        <div className="item-image-panel">
          {image ? (
            <img
              src={image}
              alt={`Image of ${title}`}
              className="item-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="item-image-placeholder" aria-label="No image available">
              <span className="placeholder-icon">{categoryIcon}</span>
              <span className="placeholder-text">No Image Available</span>
            </div>
          )}

          <div className="image-panel-footer">
            <span className={typeBadgeClass}>{typeLabel}</span>
            <StatusBadge status={status} size="sm" />
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="item-info-panel">
          <div className="item-header">
            <h1 className="item-title">
              {categoryIcon} {title}
            </h1>
          </div>

          <div className="item-meta">
            <div className="meta-row">
              <span className="meta-icon">🏷️</span>
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
            {createdBy && (
              <div className="meta-row">
                <span className="meta-icon">👤</span>
                <span className="meta-label">Reported by:</span>
                <span className="meta-value">{createdBy}</span>
              </div>
            )}
            {createdAt && (
              <div className="meta-row">
                <span className="meta-icon">🗓️</span>
                <span className="meta-label">Posted on:</span>
                <span className="meta-value">{formatDate(createdAt)}</span>
              </div>
            )}
          </div>

          <div className="item-description">
            <h3 className="description-heading">Description</h3>
            <p className="description-text">{description || 'No description provided.'}</p>
          </div>

          <div className="item-status-row">
            <span className="status-label">Current Status:</span>
            <StatusBadge status={status} size="md" />
          </div>

          {/* Claim Submission Error Message */}
          {claimError && (
            <div className="claim-error-banner" role="alert">
              ⚠️ {claimError}
            </div>
          )}

          {/* Actions based on Status */}
          {status === 'Open' && (
            <div className="item-action">
              <p className="action-description">{actionDesc}</p>
              <button
                className="action-btn"
                onClick={handleActionClick}
                disabled={submittingClaim}
                aria-label={actionLabel}
              >
                {submittingClaim ? '⏳ Submitting…' : actionLabel}
              </button>
            </div>
          )}

          {status === 'Claimed' && !claimed && (
            <div className="claimed-notice">
              <span className="claimed-icon">✅</span>
              <div>
                <p className="claimed-title">This item has been claimed.</p>
                <p className="claimed-subtitle">
                  If you believe this is yours, please contact the campus registry office directly.
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

      {/* Verification Form */}
      {showForm && (
        <section id="verification-section" className="verification-section">
          <VerificationForm
            item={item}
            onSuccess={handleVerificationSuccess}
            onCancel={handleCancel}
          />
        </section>
      )}
    </main>
  );
};

export default ItemDetails;
