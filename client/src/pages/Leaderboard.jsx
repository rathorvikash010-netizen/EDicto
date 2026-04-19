import { useState, useEffect } from 'react';
import { FiAward, FiTrendingUp, FiUser } from 'react-icons/fi';
import * as api from '../services/api';

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await api.leaderboard.get();
      setEntries(res.data || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (index) => {
    if (index === 0) return { background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#fff' };
    if (index === 1) return { background: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', color: '#fff' };
    if (index === 2) return { background: 'linear-gradient(135deg, #CD7F32, #B8690F)', color: '#fff' };
    return { background: 'var(--bg-secondary)', color: 'var(--text-primary)' };
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <FiAward style={{ marginRight: '8px', verticalAlign: '-2px' }} />
            Leaderboard
          </h2>
          <p className="section-subtitle">See how you stack up against other learners</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading leaderboard...
        </div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FiTrendingUp size={48} /></div>
          <h3 className="empty-state-title">No rankings yet</h3>
          <p className="empty-state-desc">Complete quizzes and learn words to appear on the leaderboard.</p>
        </div>
      ) : (
        <div className="leaderboard-list">
          {entries.map((entry, index) => (
            <div
              key={entry.userId}
              className={`leaderboard-entry ${entry.isCurrentUser ? 'leaderboard-current-user' : ''}`}
            >
              <div className="leaderboard-rank" style={getRankStyle(index)}>
                {index + 1}
              </div>
              <div className="leaderboard-avatar">
                <FiUser size={18} />
              </div>
              <div className="leaderboard-info">
                <div className="leaderboard-name">
                  {entry.name}
                  {entry.isCurrentUser && <span className="leaderboard-you-badge">You</span>}
                </div>
              </div>
              <div className="leaderboard-score">
                <FiTrendingUp size={14} style={{ marginRight: 4 }} />
                {entry.score} pts
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
