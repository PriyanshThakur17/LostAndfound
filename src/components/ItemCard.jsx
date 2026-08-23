import { useNavigate } from 'react-router-dom';
import { CATEGORY_ICONS } from '../data/sampleItems';

/**
 * ItemCard — Reusable card displaying a single lost/found item.
 * Props:
 *   item : object following the shared data model
 */
const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  // Destructure item fields
  const { id, type, title, category, description, location, date, image, status } = item;

  // Category icon fallback
  const categoryIcon = CATEGORY_ICONS[category] || '📦';

  // Format date into human readable string
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-GB', options);
  };

  const statusClass = (status || 'open').toLowerCase();

  const handleViewDetails = () => {
    navigate(`/item/${id}`);
  };

  return (
    <article className="item-card">
      <div className="item-card__image-wrapper">
        {image ? (
          <img className="item-card__image" src={image} alt={title} />
        ) : (
          <span className="item-card__placeholder-icon">{categoryIcon}</span>
        )}

        <span className={`item-card__type-badge item-card__type-badge--${type}`}>
          {type === 'lost' ? '🔴 Lost' : '🟢 Found'}
        </span>
      </div>

      <div className="item-card__body">
        <h3 className="item-card__title">{categoryIcon} {title}</h3>

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
          id={`view-details-${id}`}
        >
          View Details
          <span className="item-card__action-arrow">→</span>
        </button>
      </div>
    </article>
  );
};

export default ItemCard;
