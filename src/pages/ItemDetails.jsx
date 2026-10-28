import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import VerificationForm from '../components/VerificationForm';
import { getItemById, updateItem } from '../utils/storage';
import { CATEGORY_ICONS } from '../data/sampleItems';
import api, { getAuthToken } from '../api/client';

/**
 * =============================================================================
 * ItemDetails — Item Details & Ownership Claim Verification Page
 * Author: Parth | Roll Number: 2410998556 (Member 4)
 * Module: Item Details, Dynamic Routing & Claim/Verification Engine
 * Route: /item/:id
 * =============================================================================
 */
const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState(null);
  const [itemClaims, setItemClaims] = useState([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  // Load item from API or fallback Local Storage
  useEffect(() => {
    let isMounted = true;

    async function loadItemData() {
      setLoading(true);
      try {
        // Try live server API first
        const res = await api.items.getById(id);
        const loadedItem = res?.data || res?.item;
        if (isMounted && loadedItem) {
          setItem(loadedItem);
          setNotFound(false);
          setLoading(false);
          return;
        }

      } catch {
        // Fallback to Local Storage
        const localItem = getItemById(id);
        if (isMounted) {
          if (localItem) {
            setItem(localItem);
            setNotFound(false);
          } else {
            setNotFound(true);
          }
          setLoading(false);
        }
      }
    }

    loadItemData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Fetch claims for this item if user is authenticated
  useEffect(() => {
    if (!item || !getAuthToken()) return;

    const itemId = item._id || item.id;
    api.claims.getItemClaims(itemId)
      .then((res) => {
        if (res?.claims) {
          setItemClaims(res.claims);
        }
      })
      .catch(() => {
        // User may not be authorized to view all claims for this item, which is expected
      });
  }, [item]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const handleActionClick = () => {
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('verification-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  // Called when VerificationForm submits to POST /api/claims
  const handleVerificationSuccess = (claim) => {
    setShowForm(false);
    setSubmittedClaim(claim);

    // Prompt rule: "Do not mark an item Claimed merely because a claim was submitted.
    // A claim should be Pending until reviewed. Change the item status to Claimed only after an authorized approval."
    // Status remains consistent:
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  // Handle authorized approval or rejection of a pending claim
  const handleReviewClaim = async (claimId, newStatus) => {
    setIsReviewing(true);
    setReviewMessage('');

    try {
      const res = await api.claims.updateStatus(claimId, {
        status: newStatus,
        reviewNotes: `Reviewed and ${newStatus.toLowerCase()} via Item Details panel.`,
      });

      if (res?.success) {
        setReviewMessage(`Claim has been ${newStatus.toLowerCase()} successfully.`);

        // If approved, update item status to 'Claimed'
        if (newStatus === 'Approved') {
          setItem((prev) => ({ ...prev, status: 'Claimed' }));
          updateItem(item.id || item._id, { status: 'Claimed' });
        }

        // Refresh claims list
        const itemId = item._id || item.id;
        const updated = await api.claims.getItemClaims(itemId).catch(() => null);
        if (updated?.claims) {
          setItemClaims(updated.claims);
        }
      }
    } catch (err) {
      console.error('Error reviewing claim:', err);
      setReviewMessage(`Failed to update claim: ${err.message}`);
    } finally {
      setIsReviewing(false);
    }
  };

  // ---------------- Loading State ----------------
  if (loading) {
    return (
      <main className="page">
        <div className="loading-card">
          <div className="loading-spinner" aria-label="Loading item details…"></div>
          <p>Loading item details…</p>
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
            The item you are looking for does not exist or may have been removed from the registry.
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

  const { type, title, category, description, location, date, image, status, createdBy, createdAt } = item;

  const actionLabel = type === 'lost' ? '📦 I Found This Item' : '🔐 This Is My Item';
  const actionDesc =
    type === 'lost'
      ? 'Found this item? Help the owner get it back by submitting details.'
      : 'Lost this item? Verify your ownership details to initiate a claim.';

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

      {/* Submitted Claim Alert (Pending Review) */}
      {submittedClaim && (
        <div className="success-card" style={{ maxWidth: '800px', margin: '0 auto 1.5rem', textAlign: 'left', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem' }}>⏳</span>
            <h2 className="success-title" style={{ margin: 0, fontSize: '1.25rem', color: '#1E40AF' }}>
              Verification Submitted (Pending Review)
            </h2>
          </div>
          <p className="success-message" style={{ margin: '0.25rem 0 0.75rem', textAlign: 'left' }}>
            Your details for <strong>{title}</strong> have been recorded under Claim ID #{String(submittedClaim._id || submittedClaim.id).slice(-6)}.
          </p>
          <div className="success-status" style={{ margin: '0.25rem 0' }}>
            Claim Status: <StatusBadge status="Pending" size="sm" />
            <span style={{ marginLeft: '1rem', color: 'var(--color-muted)' }}>
              Item Status: <StatusBadge status={status} size="sm" />
            </span>
          </div>
          <p className="success-note" style={{ margin: '0.5rem 0 0', maxWidth: 'none', fontSize: '0.85rem' }}>
            ℹ️ As per registry policy, items remain in their current status until the owner or an administrator reviews and approves the claim.
          </p>
        </div>
      )}

      {/* Main Details Card */}
      <div className="item-details-card">
        {/* Left: Image Panel */}
        <div className="item-image-panel">
          {image ? (
            <img src={image} alt={`Photo of ${title}`} className="item-image" />
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

          {/* Actions based on Status */}
          {status === 'Open' && (
            <div className="item-action">
              <p className="action-description">{actionDesc}</p>
              <button className="action-btn" onClick={handleActionClick} aria-label={actionLabel}>
                {actionLabel}
              </button>
            </div>
          )}

          {status === 'Claimed' && (
            <div className="claimed-notice">
              <span className="claimed-icon">✅</span>
              <div>
                <p className="claimed-title">This item has been successfully claimed.</p>
                <p className="claimed-subtitle">
                  The ownership verification was approved by the registry.
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
                  This report is no longer active in the campus registry.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Claims Panel (Item Owner / Administrator Review Interface) */}
      {itemClaims.length > 0 && (
        <section className="claims-review-card" style={{ marginTop: '2rem', padding: '1.5rem', background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📋</span> Submitted Verifications ({itemClaims.length})
          </h2>

          {reviewMessage && (
            <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
              <p className="alert-text">{reviewMessage}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {itemClaims.map((cl) => {
              const answers = cl.verificationAnswers || {};
              const clId = cl._id || cl.id;
              const isPending = cl.status === 'Pending';

              return (
                <div key={clId} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <strong>{answers.contactName || 'Claimant'}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginLeft: '0.5rem' }}>
                        ({formatDate(cl.createdAt)})
                      </span>
                    </div>
                    <StatusBadge status={cl.status} size="sm" />
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {answers.itemColor && <div><strong>Color:</strong> {answers.itemColor}</div>}
                    {answers.uniqueFeature && <div><strong>Feature:</strong> {answers.uniqueFeature}</div>}
                    {answers.lostLocation && <div><strong>Lost at:</strong> {answers.lostLocation}</div>}
                    {answers.foundLocation && <div><strong>Found at:</strong> {answers.foundLocation}</div>}
                    {answers.foundDate && <div><strong>Found date:</strong> {formatDate(answers.foundDate)}</div>}
                    {answers.additionalInfo && <div><strong>Notes:</strong> {answers.additionalInfo}</div>}
                  </div>

                  {isPending && status !== 'Claimed' && (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn--outline"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                        onClick={() => handleReviewClaim(clId, 'Rejected')}
                        disabled={isReviewing}
                      >
                        ✕ Reject
                      </button>
                      <button
                        type="button"
                        className="btn btn--primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                        onClick={() => handleReviewClaim(clId, 'Approved')}
                        disabled={isReviewing}
                      >
                        ✓ Approve Claim
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Verification Form Section */}
      {showForm && (
        <section id="verification-section" className="verification-section">
          <VerificationForm item={item} onSuccess={handleVerificationSuccess} onCancel={handleCancel} />
        </section>
      )}
    </main>
  );
};

export default ItemDetails;
