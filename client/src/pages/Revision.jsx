import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { FiRefreshCw, FiInbox, FiClock, FiCheckCircle, FiZap, FiAlertTriangle, FiChevronLeft, FiVolume2, FiArrowRight, FiList, FiAward } from 'react-icons/fi';
import UnifiedWordCard from '../components/word/UnifiedWordCard';
import { WordCardSkeletonGrid } from '../components/common/Skeletons';
import usePronunciation from '../hooks/usePronunciation';

const QUALITY_BUTTONS = [
  { quality: 0, label: 'Again', sublabel: '1 day', className: 'review-btn-again', icon: <FiAlertTriangle size={14} /> },
  { quality: 1, label: 'Hard', sublabel: 'Small bump', className: 'review-btn-hard', icon: <FiClock size={14} /> },
  { quality: 2, label: 'Good', sublabel: 'Normal', className: 'review-btn-good', icon: <FiCheckCircle size={14} /> },
  { quality: 3, label: 'Easy', sublabel: 'Big jump', className: 'review-btn-easy', icon: <FiZap size={14} /> },
];

function isDue(word) {
  if (!word.nextReview) return true;
  return new Date() >= new Date(word.nextReview);
}

function formatNextReview(dateStr) {
  if (!dateStr) return 'Due now';
  const next = new Date(dateStr);
  const now = new Date();
  const diffMs = next - now;
  if (diffMs <= 0) return 'Due now';
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return 'Tomorrow';
  return `In ${diffDays} days`;
}

export default function Revision() {
  const { revisionWords, loading, reviewWord, addToast } = useApp();
  const { speak, speaking } = usePronunciation();

  const [viewMode, setViewMode] = useState('list');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 });
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [filter, setFilter] = useState('all');

  const { dueWords, upcomingWords, learnedCount } = useMemo(() => {
    const due = [];
    const upcoming = [];
    let learned = 0;
    revisionWords.forEach(w => {
      if (w.isLearned) { learned++; upcoming.push(w); }
      else if (isDue(w)) { due.push(w); }
      else { upcoming.push(w); }
    });
    return { dueWords: due, upcomingWords: upcoming, learnedCount: learned };
  }, [revisionWords]);

  const displayedWords = filter === 'due' ? dueWords
    : filter === 'upcoming' ? upcomingWords
    : revisionWords;

  const currentWord = dueWords[currentIndex] || null;

  // ── Study Mode handlers ──
  const handleStartStudy = useCallback(() => {
    if (dueWords.length === 0) {
      addToast('No words due for review right now!', 'info');
      return;
    }
    setViewMode('study');
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 });
    setShowSessionComplete(false);
  }, [dueWords.length, addToast]);

  const handleFlip = useCallback(() => { setIsFlipped(true); }, []);

  const handleReview = useCallback(async (quality) => {
    if (!currentWord || isReviewing) return;
    setIsReviewing(true);

    const qualityNames = ['again', 'hard', 'good', 'easy'];
    const result = await reviewWord(currentWord.word, quality);

    if (result) {
      setSessionStats(prev => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        [qualityNames[quality]]: prev[qualityNames[quality]] + 1,
      }));
      const nextIdx = currentIndex + 1;
      if (nextIdx >= dueWords.length) {
        setShowSessionComplete(true);
      } else {
        setCurrentIndex(nextIdx);
        setIsFlipped(false);
      }
    }
    setIsReviewing(false);
  }, [currentWord, currentIndex, dueWords.length, isReviewing, reviewWord]);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setShowSessionComplete(false);
  }, []);

  if (loading) {
    return <div className="page-container"><WordCardSkeletonGrid count={4} /></div>;
  }

  // ═══════════════════════════════════
  //  SESSION COMPLETE SCREEN
  // ═══════════════════════════════════
  if (viewMode === 'study' && showSessionComplete) {
    return (
      <div className="page-container">
        <div className="sr-session-complete animate-fade-in">
          <div className="sr-complete-icon-wrap">
            <FiAward size={48} />
          </div>
          <h2 className="sr-complete-title">Session Complete</h2>
          <p className="sr-complete-subtitle">
            You reviewed <strong>{sessionStats.reviewed}</strong> word{sessionStats.reviewed !== 1 ? 's' : ''} this session.
          </p>

          <div className="sr-complete-stats-grid">
            {sessionStats.again > 0 && (
              <div className="sr-complete-stat sr-complete-again">
                <FiAlertTriangle size={14} />
                <span className="sr-complete-stat-num">{sessionStats.again}</span>
                <span className="sr-complete-stat-label">Again</span>
              </div>
            )}
            {sessionStats.hard > 0 && (
              <div className="sr-complete-stat sr-complete-hard">
                <FiClock size={14} />
                <span className="sr-complete-stat-num">{sessionStats.hard}</span>
                <span className="sr-complete-stat-label">Hard</span>
              </div>
            )}
            {sessionStats.good > 0 && (
              <div className="sr-complete-stat sr-complete-good">
                <FiCheckCircle size={14} />
                <span className="sr-complete-stat-num">{sessionStats.good}</span>
                <span className="sr-complete-stat-label">Good</span>
              </div>
            )}
            {sessionStats.easy > 0 && (
              <div className="sr-complete-stat sr-complete-easy">
                <FiZap size={14} />
                <span className="sr-complete-stat-num">{sessionStats.easy}</span>
                <span className="sr-complete-stat-label">Easy</span>
              </div>
            )}
          </div>

          {upcomingWords.length > 0 && (
            <p className="sr-complete-next">
              Next review: <strong>{formatNextReview(upcomingWords[0].nextReview)}</strong> — {upcomingWords[0].word}
            </p>
          )}

          <div className="sr-complete-actions">
            <button className="btn btn-primary btn-lg" onClick={handleBackToList}>
              <FiList size={18} /> Back to List
            </button>
            {dueWords.length > 0 && (
              <button className="btn btn-secondary btn-lg" onClick={handleStartStudy}>
                <FiZap size={18} /> Study More
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════
  //  STUDY MODE (FLASHCARD REVIEW)
  // ═══════════════════════════════════
  if (viewMode === 'study' && currentWord) {
    const progress = dueWords.length > 0 ? (currentIndex / dueWords.length) * 100 : 0;

    return (
      <div className="page-container">
        {/* Study Header */}
        <div className="sr-study-header animate-fade-in">
          <button className="btn btn-ghost" onClick={handleBackToList}>
            <FiChevronLeft size={18} /> Back
          </button>
          <div className="sr-study-progress-info">
            <span className="sr-study-counter">
              {currentIndex + 1} / {dueWords.length}
            </span>
            <div className="sr-progress-bar">
              <div className="sr-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="sr-session-mini-stats">
            <span className="sr-mini-stat" title="Reviewed"><FiCheckCircle size={14} /> {sessionStats.reviewed}</span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="sr-flashcard-container animate-fade-in-up">
          <div
            className={`sr-flashcard ${isFlipped ? 'sr-flashcard-flipped' : ''}`}
            onClick={!isFlipped ? handleFlip : undefined}
          >
            {/* Front — Word Only */}
            <div className="sr-flashcard-front">
              <div className="sr-flashcard-label">What does this word mean?</div>
              <div className="sr-flashcard-word">{currentWord.word}</div>
              {currentWord.pronunciation && (
                <div className="sr-flashcard-pronunciation">
                  <button
                    className={`pronunciation-btn ${speaking ? 'audio-playing' : ''}`}
                    onClick={(e) => { e.stopPropagation(); speak(currentWord.word, currentWord.audioUrl); }}
                  >
                    <FiVolume2 size={16} />
                  </button>
                  {currentWord.pronunciation}
                </div>
              )}
              {currentWord.partOfSpeech && (
                <div className="sr-flashcard-pos">{currentWord.partOfSpeech}</div>
              )}
              <div className="sr-flashcard-hint">
                Tap to reveal answer <FiArrowRight size={14} />
              </div>
            </div>

            {/* Back — Definition + Example */}
            <div className="sr-flashcard-back">
              <div className="sr-flashcard-back-word">{currentWord.word}</div>
              {currentWord.partOfSpeech && (
                <div className="sr-flashcard-pos">{currentWord.partOfSpeech}</div>
              )}
              <div className="sr-flashcard-definition">
                {currentWord.definition || currentWord.meaning}
              </div>
              {currentWord.example && (
                <div className="sr-flashcard-example">
                  "{currentWord.example}"
                </div>
              )}
              {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                <div className="sr-flashcard-synonyms">
                  <span className="sr-syn-label">Synonyms:</span>
                  {currentWord.synonyms.slice(0, 4).map(s => (
                    <span key={s} className="sr-syn-chip">{s}</span>
                  ))}
                </div>
              )}
              <div className="sr-flashcard-meta">
                <span><FiRefreshCw size={12} /> Review #{(currentWord.reviewCount || 0) + 1}</span>
                {currentWord.interval > 0 && (
                  <span><FiClock size={12} /> Interval: {currentWord.interval} day{currentWord.interval !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quality Buttons */}
        {isFlipped && (
          <div className="sr-quality-buttons animate-fade-in-up">
            <div className="sr-quality-label">How well did you know this?</div>
            <div className="sr-quality-grid">
              {QUALITY_BUTTONS.map(btn => (
                <button
                  key={btn.quality}
                  className={`sr-quality-btn ${btn.className} ${isReviewing ? 'sr-btn-disabled' : ''}`}
                  onClick={() => handleReview(btn.quality)}
                  disabled={isReviewing}
                >
                  <span className="sr-quality-icon">{btn.icon}</span>
                  <span className="sr-quality-name">{btn.label}</span>
                  <span className="sr-quality-sublabel">{btn.sublabel}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════
  //  LIST VIEW (DEFAULT)
  // ═══════════════════════════════════
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
        {dueWords.length > 0 && (
          <button className="btn btn-primary" onClick={handleStartStudy} id="start-study-btn">
            <FiZap size={16} />
            Study Now ({dueWords.length})
          </button>
        )}
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
          <button className={`revision-filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({revisionWords.length})
          </button>
          <button className={`revision-filter-tab ${filter === 'due' ? 'active' : ''}`} onClick={() => setFilter('due')}>
            <FiClock size={13} /> Due ({dueWords.length})
          </button>
          <button className={`revision-filter-tab ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>
            Upcoming ({upcomingWords.length})
          </button>
        </div>
      )}

      {/* Word list */}
      {displayedWords.length > 0 ? (
        <div className="word-grid">
          {displayedWords.map((word, index) => (
            <div key={word._id || word.word} className={`revision-card-wrapper stagger-${Math.min(index + 1, 6)}`}>
              <UnifiedWordCard word={word} variant="revision" />

              {/* Spaced repetition info + inline review buttons */}
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
                      {isDue(word) ? 'Due now' : formatNextReview(word.nextReview)}
                    </span>
                  </div>
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
                : 'Add words to your revision list from the daily words or search results.'}
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
