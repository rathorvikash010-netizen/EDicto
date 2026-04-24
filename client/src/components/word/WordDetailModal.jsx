/**
 * WordDetailModal - Enlarged word card overlay shown when clicking any word card.
 * Renders the full word detail layout (same as Word of the Day) inside a centered
 * modal with a blurred backdrop. Closes on backdrop click, Escape key, or close button.
 */
import { useEffect, useRef } from 'react';
import { FiX, FiArrowLeft, FiBookmark, FiRefreshCw, FiVolume2 } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import usePronunciation from '../../hooks/usePronunciation';

export default function WordDetailModal({ word, onClose }) {
  const { toggleBookmark, toggleRevision, isBookmarked, isInRevision } = useApp();
  const { speak, speaking } = usePronunciation();
  const overlayRef = useRef(null);

  const wordText = word.word || '';
  const bookmarked = isBookmarked(wordText);
  const inRevision = isInRevision(wordText);

  const getWordData = () => ({
    word: wordText,
    partOfSpeech: word.partOfSpeech || '',
    definition: word.definition || word.meaning || '',
    pronunciation: word.pronunciation || '',
    example: word.example || '',
    synonyms: word.synonyms || [],
    antonyms: word.antonyms || [],
  });

  // Close on Escape key + blur/unblur main content
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    // Blur only the main content area (not sidebar/navbar)
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.classList.add('content-blurred');
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      if (mainContent) mainContent.classList.remove('content-blurred');
    };
  }, [onClose]);

  // Close on backdrop click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const definition = word.definition || word.meaning || '';

  return (
    <div className="word-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="word-modal-content animate-scale-in">
        {/* Back button */}
        <button className="word-modal-back" onClick={onClose} aria-label="Go back">
          <FiArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* Close button */}
        <button className="word-modal-close" onClick={onClose} aria-label="Close">
          <FiX size={20} />
        </button>

        {/* Gradient top bar */}
        <div className="word-modal-gradient-bar" />

        {/* Header section */}
        <div className="word-title-section">
          <h2 className="word-main-title">{wordText}</h2>
          <div className="word-phonetic">
            <button
              className={`word-audio-btn btn-icon ${speaking ? 'audio-playing' : ''}`}
              title="Listen to pronunciation"
              onClick={() => speak(wordText, word.audioUrl)}
            >
              <FiVolume2 />
            </button>
            <span>{word.pronunciation}</span>
          </div>

          <div className="word-modal-badges">
            {word.partOfSpeech && (
              <span className="word-pos-badge">{word.partOfSpeech}</span>
            )}
            {word.category && (
              <span className={`category-badge category-${word.category.toLowerCase()}`}>
                {word.category}
              </span>
            )}
            {word.difficulty && (
              <span className={`difficulty-badge difficulty-${
                word.difficulty <= 2 ? 'easy' : word.difficulty === 3 ? 'moderate' : word.difficulty === 4 ? 'hard' : 'expert'
              }`}>
                Lvl {word.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Definition */}
        <div className="word-meaning-section">
          <div className="word-section-label">Definition</div>
          <p className="word-meaning-text">{definition}</p>
        </div>

        {/* Example */}
        {word.example && (
          <div className="word-example-box">
            <div className="word-section-label" style={{ marginBottom: '8px' }}>Example</div>
            <p className="word-example-text">"{word.example}"</p>
          </div>
        )}

        {/* Synonyms */}
        {word.synonyms && word.synonyms.length > 0 && (
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <div className="word-section-label">Synonyms</div>
            <div className="word-synonyms">
              {word.synonyms.map(syn => (
                <span key={syn} className="word-synonym-chip">{syn}</span>
              ))}
            </div>
          </div>
        )}

        {/* Antonyms */}
        {word.antonyms && word.antonyms.length > 0 && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <div className="word-section-label">Antonyms</div>
            <div className="word-synonyms">
              {word.antonyms.map(ant => (
                <span key={ant} className="word-synonym-chip antonym">{ant}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="word-actions">
          <button
            className={`btn ${bookmarked ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => toggleBookmark(getWordData())}
          >
            <FiBookmark fill={bookmarked ? 'currentColor' : 'none'} />
            {bookmarked ? 'Unbookmark' : 'Bookmark'}
          </button>
          <button
            className={`btn ${inRevision ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => toggleRevision(getWordData())}
          >
            <FiRefreshCw />
            {inRevision ? 'In Revision' : 'Add to Revision'}
          </button>
        </div>
      </div>
    </div>
  );
}
