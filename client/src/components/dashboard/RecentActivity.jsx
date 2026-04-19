import { FiBookmark, FiCheck, FiEdit3, FiRefreshCw, FiTrash2 } from 'react-icons/fi';

const iconMap = {
  bookmarked: { icon: <FiBookmark size={14} />, bg: 'var(--accent-primary-bg)', color: 'var(--accent-primary)' },
  'removed bookmark': { icon: <FiTrash2 size={14} />, bg: 'rgba(255,107,107,0.1)', color: 'var(--accent-secondary)' },
  learned: { icon: <FiCheck size={14} />, bg: 'var(--accent-success-bg)', color: 'var(--accent-success)' },
  'completed quiz': { icon: <FiEdit3 size={14} />, bg: 'var(--accent-warning-bg)', color: 'var(--accent-warning)' },
  reviewed: { icon: <FiRefreshCw size={14} />, bg: 'var(--accent-primary-bg)', color: 'var(--accent-primary)' },
};

function timeAgo(timestamp) {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecentActivity({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
        <p>No recent activity. Start learning!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h4 className="chart-title">Recent Activity</h4>
      <div className="activity-list">
        {activities.slice(0, 8).map(activity => {
          const config = iconMap[activity.action] || iconMap.learned;
          return (
            <div key={activity.id} className="activity-item">
              <div
                className="activity-icon"
                style={{ background: config.bg, color: config.color }}
              >
                {config.icon}
              </div>
              <div className="activity-text">
                You <strong>{activity.action}</strong> <strong>{activity.word}</strong>
              </div>
              <div className="activity-time">{timeAgo(activity.timestamp)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
