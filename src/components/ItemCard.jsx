import { useNavigate } from 'react-router-dom';
import { CATEGORY_ICONS } from '../utils/constants';

/**
 * ItemCard — Reusable card displaying a single lost/found item.
 * Props:
 *   item : object following the shared data model
 */
const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  // Destructure item fields
  const { id, type, title, category, description, location, date, image, status } = item;

  // Determine the icon to show for the item category
  const categoryIcon = CATEGORY_ICONS[category] || '📦';

  // Format the date into a readable string
  const formatDate = (dateStr) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-GB', options);
  };

  // Determine status CSS modifier
  const statusClass = status.toLowerCase(); // 'open' | 'claimed' | 'archived'

  // Handle View Details click — navigates to /item/:id
  const handleViewDetails = () => {
    navigate(`/item/${id}`);
  };

  return (
    <article className="item-card">
      {/* Image section */}
      <div className="item-card__image-wrapper">
        {image ? (
          <img className="item-card__image" src={image} alt={title} />
        ) : (
          <span className="item-card__placeholder-icon">{categoryIcon}</span>
        )}

        {/* Lost / Found badge */}
        <span className={`item-card__type-badge item-card__type-badge--${type}`}>
          {type === 'lost' ? '🔴 Lost' : '🟢 Found'}
        </span>
      </div>

      {/* Card body */}
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

        {/* Status pill */}
        <span className={`item-card__status item-card__status--${statusClass}`}>
          <span className="item-card__status-dot" />
          {status}
        </span>

        {/* View Details button */}
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
