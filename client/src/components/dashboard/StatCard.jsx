import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function StatCard({ icon, number, label, trend, trendDir = 'up', color = 'var(--accent-primary)', bgColor = 'var(--accent-primary-bg)' }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: bgColor, color }}>
        {icon}
      </div>
      <div className="stat-card-content">
        <div className="stat-card-number" style={{ color }}>{number}</div>
        <div className="stat-card-label">{label}</div>
      </div>
      {trend && (
        <span className={`stat-card-trend ${trendDir}`}>
          {trendDir === 'up' ? <FiTrendingUp size={12} style={{ verticalAlign: '-1px', marginRight: '3px' }} /> : <FiTrendingDown size={12} style={{ verticalAlign: '-1px', marginRight: '3px' }} />} {trend}
        </span>
      )}
    </div>
  );
}
