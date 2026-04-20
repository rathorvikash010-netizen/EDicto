/**
 * UnifiedWordCard - A single, reusable word card component used across all pages.
 *
 * Variants:
 *   "explore"   - DailyWord explore grid (bookmark + revise buttons)
 *   "category"  - Categories page (expiry badge + bookmark + revise)
 *   "bookmark"  - Bookmarks page (date saved + remove)
 *   "revision"  - Revision page (date added + learned + remove)
 *
 * Props:
 *   word          - word data object (word, pronunciation, partOfSpeech, definition, example, etc.)
 *   variant       - "explore" | "category" | "bookmark" | "revision"
 *   daysLeft      - (category only) days until word expires
 *   className     - extra class names
 */
import { FiBookmark, FiRefreshCw, FiVolume2, FiTrash2, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import usePronunciation from '../../hooks/usePronunciation';

const DIFFICULTY_CONFIG = {
  1: { label: 'Easy', className: 'difficulty-easy' },
  2: { label: 'Medium', className: 'difficulty-medium' },
  3: { label: 'Moderate', className: 'difficulty-moderate' },
  4: { label: 'Hard', className: 'difficulty-hard' },
  5: { label: 'Expert', className: 'difficulty-expert' },
};

export default function UnifiedWordCard({ word, variant = 'explore', daysLeft, className = '' }) {
  const {
    toggleBookmark, toggleRevision, markWordLearned,
    isBookmarked, isInRevision, isLearned,
  } = useApp();
  const { speak, speaking } = usePronunciation();

  const wordText = word.word || '';
  const bookmarked = isBookmarked(wordText);
  const inRevision = isInRevision(wordText);
  const learned = isLearned(wordText);

  const getWordData = () => ({
    word: wordText,
    partOfSpeech: word.partOfSpeech || '',
    definition: word.definition || word.meaning || '',
    pronunciation: word.pronunciation || '',
    example: word.example || '',
    synonyms: word.synonyms || [],
    antonyms: word.antonyms || [],
  });

  const difficultyLevel = word.difficulty || null;
  const difficultyInfo = difficultyLevel ? DIFFICULTY_CONFIG[difficultyLevel] || null : null;

  const cardClass = [
    'word-card',
    'animate-fade-in-up',
    learned && variant === 'revision' ? 'word-card-learned-state' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      {/* Header: title, pronunciation, part of speech */}
      <div className="word-card-header">
        <div>
          <div className="word-card-title">{wordText}</div>
          {word.pronunciation && (
            <div className="word-card-pronunciation">
              <button
                className={`pronunciation-btn ${speaking ? 'audio-playing' : ''}`}
                onClick={(e) => { e.stopPropagation(); speak(wordText, word.audioUrl); }}
                title="Listen"
                aria-label={`Pronounce ${wordText}`}
              >
                <FiVolume2 size={14} />
              </button>
              {word.pronunciation}
            </div>
          )}
          {word.partOfSpeech && (
            <div className="word-card-pos">{word.partOfSpeech}</div>
          )}
        </div>
        <div className="word-card-badges">
          {/* Difficulty badge */}
          {difficultyInfo && (
            <span className={`difficulty-badge ${difficultyInfo.className}`}>
              Lvl {difficultyLevel} - {difficultyInfo.label}
            </span>
          )}
          {/* Learned badge for revision variant */}
          {variant === 'revision' && learned && (
            <span className="word-card-learned-badge">
              <FiCheckCircle size={14} /> Learned
            </span>
          )}
        </div>
      </div>

      {/* Body: definition + example */}
      <div className="word-card-meaning">{word.definition || word.meaning}</div>

      {word.example && (
        <div className="word-card-example">"{word.example}"</div>
      )}

      {/* Synonyms (bookmark variant) */}
      {variant === 'bookmark' && word.synonyms && word.synonyms.length > 0 && (
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <div className="word-synonyms" style={{ gap: '4px' }}>
            {word.synonyms.slice(0, 4).map(syn => (
              <span key={syn} className="word-synonym-chip" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>{syn}</span>
            ))}
          </div>
        </div>
      )}

      {/* Footer (pinned to bottom via CSS) */}
      <div className="word-card-footer">
        {/* Left side of footer */}
        {variant === 'category' && daysLeft != null && (
          <span className={`expiry-badge ${daysLeft <= 2 ? 'expiring-soon' : ''}`}>
            <FiClock size={11} />
            {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
          </span>
        )}

        {variant === 'bookmark' && word.savedAt && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
            Saved {new Date(word.savedAt).toLocaleDateString()}
          </span>
        )}

        {variant === 'revision' && word.savedAt && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
            Added {new Date(word.savedAt).toLocaleDateString()}
          </span>
        )}

        {/* Right side: action buttons */}
        {(variant === 'explore' || variant === 'category') && (
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginLeft: 'auto' }}>
            <button
              className={`btn btn-sm ${bookmarked ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => toggleBookmark(getWordData())}
              style={{ fontSize: '0.75rem' }}
            >
              <FiBookmark size={12} fill={bookmarked ? 'currentColor' : 'none'} />
              {bookmarked ? 'Unbookmark' : 'Bookmark'}
            </button>
            <button
              className={`btn btn-sm ${inRevision ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => toggleRevision(getWordData())}
              style={{ fontSize: '0.75rem' }}
            >
              <FiRefreshCw size={12} />
              {inRevision ? 'In Revision' : 'Revise'}
            </button>
          </div>
        )}

        {variant === 'bookmark' && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => toggleBookmark(getWordData())}
            style={{ color: 'var(--accent-coral)', fontSize: '0.78rem' }}
          >
            <FiTrash2 size={13} /> Remove
          </button>
        )}

        {variant === 'revision' && (
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {!learned && (
              <button
                className="btn btn-sm btn-success-outline"
                onClick={() => markWordLearned(wordText)}
                title="Mark as learned"
              >
                <FiCheckCircle size={13} /> I learned this
              </button>
            )}
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => toggleRevision(getWordData())}
              style={{ color: 'var(--accent-coral)', fontSize: '0.78rem' }}
            >
              <FiTrash2 size={13} /> Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
