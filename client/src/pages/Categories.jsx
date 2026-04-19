import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { FiClock, FiFolder, FiInbox } from 'react-icons/fi';
import UnifiedWordCard from '../components/word/UnifiedWordCard';

export default function Categories() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.dailyWords.getAll();
        setWords(res.data || []);
      } catch (err) {
        console.error('Failed to load words:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getDaysRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <FiFolder style={{ marginRight: '8px', verticalAlign: '-2px' }} />
            Browse All Words
          </h2>
          <p className="section-subtitle">
            {words.length} shared words · Auto-deleted after 10 days
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="animate-fade-in" style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: 'var(--space-xl)', padding: '12px 20px',
        background: 'var(--accent-info-bg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(74, 144, 217, 0.15)',
        fontSize: '0.85rem', color: 'var(--text-secondary)',
      }}>
        <FiClock style={{ color: 'var(--accent-info)', fontSize: '1.1rem', flexShrink: 0 }} />
        <span>
          These words are shared with all users and expire automatically after 10 days.
          <strong> Save words you want to keep</strong> by bookmarking them.
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading all words...
        </div>
      ) : words.length > 0 ? (
        <div className="word-grid">
          {words.map((word, index) => (
            <UnifiedWordCard
              key={word._id || index}
              word={word}
              variant="category"
              daysLeft={getDaysRemaining(word.expiresAt)}
              className={`stagger-${Math.min((index % 6) + 1, 6)}`}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><FiInbox size={48} /></div>
          <h3 className="empty-state-title">No shared words available</h3>
          <p className="empty-state-desc">
            New words are fetched daily from the dictionary. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
