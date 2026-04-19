import { useApp } from '../context/AppContext';
import { FiRefreshCw, FiInbox } from 'react-icons/fi';
import UnifiedWordCard from '../components/word/UnifiedWordCard';
import { WordCardSkeletonGrid } from '../components/common/Skeletons';

export default function Revision() {
  const { revisionWords, loading } = useApp();

  if (loading) {
    return (
      <div className="page-container">
        <WordCardSkeletonGrid count={4} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <FiRefreshCw style={{ marginRight: '8px', verticalAlign: '-2px' }} />
            Revision List
          </h2>
          <p className="section-subtitle">
            {revisionWords.length} word{revisionWords.length !== 1 ? 's' : ''} to review
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {revisionWords.length > 0 && (
        <div className="revision-progress animate-fade-in">
          <FiRefreshCw style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="revision-progress-text">
              <strong>{revisionWords.length}</strong> word{revisionWords.length !== 1 ? 's' : ''} in your revision list
            </div>
            <div className="progress-bar-container" style={{ marginTop: '8px' }}>
              <div
                className="progress-bar-fill success"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Word list */}
      {revisionWords.length > 0 ? (
        <div className="word-grid">
          {revisionWords.map((word, index) => (
            <UnifiedWordCard
              key={word._id || word.word}
              word={word}
              variant="revision"
              className={`stagger-${Math.min(index + 1, 6)}`}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><FiInbox size={48} /></div>
          <h3 className="empty-state-title">No words in revision</h3>
          <p className="empty-state-desc">
            Add words to your revision list from the daily words or search results. We'll keep them here for you to review.
          </p>
        </div>
      )}
    </div>
  );
}
