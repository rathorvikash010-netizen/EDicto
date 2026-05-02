import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { FiRefreshCw, FiInbox, FiClock, FiCheckCircle, FiZap, FiAlertTriangle } from 'react-icons/fi';
import UnifiedWordCard from '../components/word/UnifiedWordCard';
import { WordCardSkeletonGrid } from '../components/common/Skeletons';

/**
 * Compute whether a revision word is due for review.
 */
function isDue(word) {
  if (!word.nextReview) return true; // never reviewed = due
  const now = new Date();
  const next = new Date(word.nextReview);
  return now >= next;
}

/**
 * Format next review date as relative text.
 */
function formatNextReview(dateStr) {
  if (!dateStr) return 'Due now';
  const next = new Date(dateStr);
  const now = new Date();
  const diffMs = next - now;
  if (diffMs <= 0) return 'Due now';
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  return `In ${diffDays} days`;
}

const QUALITY_LABELS = [
  { quality: 0, label: 'Again', icon: <FiAlertTriangle size={13} />, className: 'review-btn-again' },
  { quality: 1, label: 'Hard', icon: <FiClock size={13} />, className: 'review-btn-hard' },
  { quality: 2, label: 'Good', icon: <FiCheckCircle size={13} />, className: 'review-btn-good' },
  { quality: 3, label: 'Easy', icon: <FiZap size={13} />, className: 'review-btn-easy' },
];

export default function Revision() {
  const { revisionWords, loading, reviewWord, markWordLearned } = useApp();
  const [reviewingWord, setReviewingWord] = useState(null); // word currently being reviewed
  const [filter, setFilter] = useState('all'); // 'all' | 'due' | 'upcoming'

  // Split words into due & upcoming
  const { dueWords, upcomingWords, learnedCount } = useMemo(() => {
    const due = [];
    const upcoming = [];
    let learned = 0;

    revisionWords.forEach(w => {
      if (w.isLearned) {
        learned++;
        upcoming.push(w);
      } else if (isDue(w)) {
        due.push(w);
      } else {
        upcoming.push(w);
      }
    });

    return { dueWords: due, upcomingWords: upcoming, learnedCount: learned };
  }, [revisionWords]);

  const displayedWords = filter === 'due' ? dueWords
    : filter === 'upcoming' ? upcomingWords
    : revisionWords;

  const handleReview = async (wordText, quality) => {
    setReviewingWord(wordText);
    await reviewWord(wordText, quality);
    setReviewingWord(null);
  };

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
            Spaced Revision
          </h2>
          <p className="section-subtitle">
            {revisionWords.length} word{revisionWords.length !== 1 ? 's' : ''} · {dueWords.length} due for review
          </p>
        </div>
      </div>

      {/* Stats bar */}
      {revisionWords.length > 0 && (
        <div className="revision-stats-bar animate-fade-in">
          <div className="revision-stat-item revision-stat-due">
            <FiClock size={16} />
            <div>
              <div className="revision-stat-num">{dueWords.length}</div>
              <div className="revision-stat-label">Due Now</div>
            </div>
          </div>
          <div className="revision-stat-item revision-stat-upcoming">
            <FiRefreshCw size={16} />
            <div>
              <div className="revision-stat-num">{upcomingWords.length - learnedCount}</div>
              <div className="revision-stat-label">Upcoming</div>
            </div>
          </div>
          <div className="revision-stat-item revision-stat-learned">
            <FiCheckCircle size={16} />
            <div>
              <div className="revision-stat-num">{learnedCount}</div>
              <div className="revision-stat-label">Learned</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {revisionWords.length > 0 && (
        <div className="revision-filter-tabs">
          <button
            className={`revision-filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({revisionWords.length})
          </button>
          <button
            className={`revision-filter-tab ${filter === 'due' ? 'active' : ''}`}
            onClick={() => setFilter('due')}
          >
            <FiClock size={13} /> Due ({dueWords.length})
          </button>
          <button
            className={`revision-filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming ({upcomingWords.length})
          </button>
        </div>
      )}

      {/* Word list */}
      {displayedWords.length > 0 ? (
        <div className="word-grid">
          {displayedWords.map((word, index) => (
            <div key={word._id || word.word} className={`revision-card-wrapper stagger-${Math.min(index + 1, 6)}`}>
              <UnifiedWordCard
                word={word}
                variant="revision"
              />

              {/* Spaced repetition info + review buttons */}
              {!word.isLearned && (
                <div className="sr-review-section">
                  <div className="sr-info-row">
                    {word.reviewCount > 0 && (
                      <span className="sr-info-badge">
                        <FiRefreshCw size={11} /> {word.reviewCount} review{word.reviewCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {word.interval > 1 && (
                      <span className="sr-info-badge">
                        <FiClock size={11} /> {word.interval}d interval
                      </span>
                    )}
                    <span className={`sr-info-badge ${isDue(word) ? 'sr-due-badge' : 'sr-upcoming-badge'}`}>
                      {isDue(word) ? '🔥 Due now' : formatNextReview(word.nextReview)}
                    </span>
                  </div>

                  {isDue(word) && (
                    <div className="sr-review-buttons">
                      {QUALITY_LABELS.map(({ quality, label, icon, className }) => (
                        <button
                          key={quality}
                          className={`sr-review-btn ${className}`}
                          onClick={() => handleReview(word.word, quality)}
                          disabled={reviewingWord === word.word}
                          title={`Rate as "${label}"`}
                        >
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><FiInbox size={48} /></div>
          <h3 className="empty-state-title">
            {filter === 'due' ? 'No words due for review' : filter === 'upcoming' ? 'No upcoming reviews' : 'No words in revision'}
          </h3>
          <p className="empty-state-desc">
            {filter === 'due'
              ? 'Great job! All your words are up to date. Check back later.'
              : filter === 'upcoming'
                ? 'Due words will move here after you review them.'
                : 'Add words to your revision list from the daily words or search results. We\'ll keep them here for you to review.'}
          </p>
          {filter !== 'all' && (
            <button className="btn btn-ghost" onClick={() => setFilter('all')} style={{ marginTop: 'var(--space-md)' }}>
              Show all words
            </button>
          )}
        </div>
      )}
    </div>
  );
}
