import { useParams } from 'react';
import { getItems } from '../utils/storage';
import { CATEGORY_ICONS } from '../data/sampleItems';

/**
 * ItemDetails Page — Placeholder for Member 4 responsibility.
 * Displays item details for the route /item/:id.
 */
const ItemDetails = () => {
  const { id } = useParams();
  const items = getItems();
  const item = items.find((i) => String(i.id) === String(id));

  if (!item) {
    return (
      <main className="page">
        <div className="empty-state">
          <span className="empty-state__icon">🔍</span>
          <h2 className="empty-state__title">Item Not Found</h2>
          <p className="empty-state__text">
            No item exists with ID #{id}.
          </p>
        </div>
      </main>
    );
  }

  const categoryIcon = CATEGORY_ICONS[item.category] || '📦';

  return (
    <main className="page">
      <header className="page__header">
        <h1 className="page__title">{categoryIcon} {item.title}</h1>
        <p className="page__subtitle">Item ID: #{item.id}</p>
      </header>

      <div className="item-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="item-card__image-wrapper" style={{ height: '260px' }}>
          {item.image ? (
            <img className="item-card__image" src={item.image} alt={item.title} />
          ) : (
            <span className="item-card__placeholder-icon" style={{ fontSize: '5rem' }}>
              {categoryIcon}
            </span>
          )}
          <span className={`item-card__type-badge item-card__type-badge--${item.type}`}>
            {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
          </span>
        </div>

        <div className="item-card__body">
          <p style={{ marginBottom: '1rem', color: 'var(--color-text)', fontSize: '1rem' }}>
            {item.description}
          </p>

          <div className="item-card__meta">
            <span className="item-card__meta-row"><strong>Category:</strong> {item.category}</span>
            <span className="item-card__meta-row"><strong>Location:</strong> {item.location}</span>
            <span className="item-card__meta-row"><strong>Date:</strong> {item.date}</span>
            <span className="item-card__meta-row"><strong>Status:</strong> {item.status}</span>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#F1F5F9', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
            ℹ️ Detailed claim and verification features will be added by Member 4.
          </div>
        </div>
      </div>
    </main>
  );
};

export default ItemDetails;
