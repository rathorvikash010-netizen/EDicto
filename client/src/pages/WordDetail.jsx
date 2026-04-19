import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiArrowLeft, FiBookmark, FiRefreshCw, FiVolume2, FiSearch } from 'react-icons/fi';
import usePronunciation from '../hooks/usePronunciation';

export default function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dailyWords, bookmarkedWords, isBookmarked, isInRevision, toggleBookmark, toggleRevision } = useApp();
  const { speak, speaking } = usePronunciation();

  // Search in daily words first, then bookmarks
  const allAvailableWords = [...dailyWords, ...bookmarkedWords];
  const word = allAvailableWords.find(w => (w._id || w.id) === id);

  if (!word) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon"><FiSearch size={48} /></div>
          <h3 className="empty-state-title">Word not found</h3>
          <p className="empty-state-desc">This word doesn't exist or may have expired.</p>
          <button className="btn btn-primary" onClick={() => navigate('/daily')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const getWordData = () => ({
    word: word.word,
    partOfSpeech: word.partOfSpeech || '',
    definition: word.definition || word.meaning || '',
    pronunciation: word.pronunciation || '',
    example: word.example || '',
    synonyms: word.synonyms || [],
    antonyms: word.antonyms || [],
  });

  const bookmarked = isBookmarked(word.word);
  const inRevision = isInRevision(word.word);

  return (
    <div className="page-container">
      <button
        className="btn btn-ghost"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 'var(--space-lg)' }}
      >
        <FiArrowLeft /> Back
      </button>

      <div className="word-card-full animate-scale-in">
        <div className="word-title-section">
          <h1 className="word-main-title">{word.word}</h1>
          <div className="word-phonetic">
            <button
              className={`word-audio-btn btn-icon ${speaking ? 'audio-playing' : ''}`}
              title="Listen to pronunciation"
              onClick={() => speak(word.word, word.audioUrl)}
            >
              <FiVolume2 />
            </button>
            <span>{word.pronunciation}</span>
          </div>
          {word.partOfSpeech && (
            <span className="word-pos-badge">{word.partOfSpeech}</span>
          )}
        </div>

        <div className="word-meaning-section">
          <div className="word-section-label">Definition</div>
          <p className="word-meaning-text">{word.definition || word.meaning}</p>
        </div>

        {word.example && (
          <div className="word-example-box">
            <div className="word-section-label" style={{ marginBottom: '8px' }}>Example</div>
            <p className="word-example-text">"{word.example}"</p>
          </div>
        )}

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

        <div className="word-actions">
          <button
            className={`btn ${bookmarked ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => toggleBookmark(getWordData())}
          >
            <FiBookmark fill={bookmarked ? 'currentColor' : 'none'} />
            {bookmarked ? 'Unbookmark' : 'Save Word'}
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
