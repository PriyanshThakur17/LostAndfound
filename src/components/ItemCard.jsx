import { useNavigate } from 'react-router-dom';
import { CATEGORY_ICONS } from '../data/sampleItems';

/**
 * ItemCard — Reusable card displaying a single lost/found item.
 * Supports both MongoDB `_id` and legacy numeric `id`.
 *
 * @param {Object} props
 * @param {Object} props.item - Lost/found item document
 */
const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  // Consistent identifier support (MongoDB `_id` primary, fallback to `id`)
  const itemId = item._id || item.id;
  const { type, title, category, location, date, image, status } = item;

  // Category icon fallback
  const categoryIcon = CATEGORY_ICONS[category] || '📦';

  // Format date into human readable string
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', options);
    } catch {
      return dateStr;
    }
  };

  const statusClass = (status || 'Open').toLowerCase();

  const handleViewDetails = () => {
    navigate(`/item/${itemId}`);
  };

  return (
    <article className="item-card">
      <div className="item-card__image-wrapper">
        {image ? (
          <img
            className="item-card__image"
            src={image}
            alt={title}
            onError={(e) => {
              // Gracefully handle broken remote images
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.classList.add('item-card__image-wrapper--fallback');
            }}
          />
        ) : (
          <span className="item-card__placeholder-icon">{categoryIcon}</span>
        )}

        <span className={`item-card__type-badge item-card__type-badge--${type}`}>
          {type === 'lost' ? '🔴 Lost' : '🟢 Found'}
        </span>
      </div>

      <div className="item-card__body">
        <h3 className="item-card__title">
          {categoryIcon} {title}
        </h3>

        <div className="item-card__meta">
          <span className="item-card__meta-row">
            <span className="item-card__meta-icon">🏷️</span>
            {category}
          </span>
          <span className="item-card__meta-row">
            <span className="item-card__meta-icon">📍</span>
            {location}
          </span>
          <span className="item-card__meta-row">
            <span className="item-card__meta-icon">📅</span>
            {formatDate(date)}
          </span>
        </div>

        <span className={`item-card__status item-card__status--${statusClass}`}>
          <span className="item-card__status-dot" />
          {status}
        </span>

        <button
          className="item-card__action"
          onClick={handleViewDetails}
          type="button"
          id={`view-details-${itemId}`}
        >
          View Details
          <span className="item-card__action-arrow">→</span>
        </button>
      </div>
    </article>
  );
};

export default ItemCard;
