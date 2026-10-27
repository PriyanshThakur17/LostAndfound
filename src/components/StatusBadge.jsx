/**
 * StatusBadge — Reusable status indicator component.
 *
 * Displays one of the platform statuses:
 *   Open     → green
 *   Claimed  → amber/yellow
 *   Archived → gray
 *   Pending  → blue (for claim verification in progress)
 *
 * @param {string} status - 'Open' | 'Claimed' | 'Archived' | 'Pending'
 * @param {string} size   - 'sm' | 'md' (default 'md')
 */
function StatusBadge({ status, size = 'md' }) {
  const statusConfig = {
    Open: { modifier: 'open', icon: '🟢', label: 'Open' },
    Claimed: { modifier: 'claimed', icon: '🟡', label: 'Claimed' },
    Archived: { modifier: 'archived', icon: '⚪', label: 'Archived' },
    Pending: { modifier: 'pending', icon: '⏳', label: 'Pending Review' },
  };

  const config = statusConfig[status] || { modifier: 'unknown', icon: '❓', label: status };
  const className = `status-badge status-badge--${config.modifier} status-badge--${size}`;

  return (
    <span className={className} aria-label={`Status: ${config.label}`}>
      {config.icon} {config.label}
    </span>
  );
}

export default StatusBadge;
