import { FiZap } from 'react-icons/fi';

export default function StreakCard({ count }) {
  return (
    <div className="streak-card">
      <div className="streak-card-fire">
        <FiZap size={40} />
      </div>
      <div className="streak-card-number">{count}</div>
      <div className="streak-card-label">Day Streak</div>
    </div>
  );
}
