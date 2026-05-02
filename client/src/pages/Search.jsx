import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';
import { FiBookmark, FiRefreshCw, FiVolume2, FiSearch, FiAlertCircle, FiBookOpen } from 'react-icons/fi';
import usePronunciation from '../hooks/usePronunciation';

export default function Search() {
  const { isBookmarked, isInRevision, toggleBookmark, toggleRevision } = useApp();
  const { speak, speaking } = usePronunciation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchedTerm, setSearchedTerm] = useState('');

  // Auto-search when navigated here with ?q=...
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim()) {
      doSearch(q.trim());
    }
  }, [searchParams]);

  const doSearch = async (term) => {
    setLoading(true);
    setError('');
    setResult(null);
    setSearchedTerm(term);

    try {
      const res = await api.search.query(term);
      setResult(res.data);
    } catch (err) {
      setError(err.data?.message || err.message || 'Word not found');
    } finally {
      setLoading(false);
    }
  };

  const getWordData = () => {
    if (!result) return null;
    return {
      word: result.word,
      partOfSpeech: result.partOfSpeech,
      definition: result.definition,
      pronunciation: result.pronunciation,
      example: result.example,
      synonyms: result.synonyms || [],
      antonyms: result.antonyms || [],
    };
  };

  const bookmarked = result ? isBookmarked(result.word) : false;
  const inRevision = result ? isInRevision(result.word) : false;

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <FiSearch style={{ marginRight: '8px', verticalAlign: '-2px' }} />
            Search Results
          </h2>
          <p className="section-subtitle">
            {searchedTerm ? `Showing results for "${searchedTerm}"` : 'Use the search bar above to look up any word'}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div className="search-loading-spinner" />
          <p style={{ marginTop: '16px' }}>Looking up "{searchedTerm}"...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="search-error animate-fade-in">
          <div className="empty-state">
            <div className="empty-state-icon"><FiAlertCircle size={48} /></div>
            <h3 className="empty-state-title">Word Not Found</h3>
            <p className="empty-state-desc">{error}</p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && !loading && (
        <div className="search-result-card animate-scale-in">
          <div className="word-title-section">
            <h1 className="word-main-title">{result.word}</h1>
            <div className="word-phonetic">
              <button
                className={`word-audio-btn btn-icon ${speaking ? 'audio-playing' : ''}`}
                title="Listen to pronunciation"
                onClick={() => speak(result.word, result.audioUrl)}
              >
                <FiVolume2 />
              </button>
              <span>{result.pronunciation}</span>
            </div>
            <span className="word-pos-badge">{result.partOfSpeech}</span>
          </div>

          <div className="word-meaning-section">
            <div className="word-section-label">Definition</div>
            <p className="word-meaning-text">{result.definition}</p>
          </div>

          {result.example && (
            <div className="word-example-box">
              <div className="word-section-label" style={{ marginBottom: '8px' }}>Example</div>
              <p className="word-example-text">"{result.example}"</p>
            </div>
          )}

          {result.synonyms && result.synonyms.length > 0 && (
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <div className="word-section-label">Synonyms</div>
              <div className="word-synonyms">
                {result.synonyms.map(syn => (
                  <span
                    key={syn}
                    className="word-synonym-chip clickable-chip"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(syn)}`)}
                    title={`Look up "${syn}"`}
                  >
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.antonyms && result.antonyms.length > 0 && (
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <div className="word-section-label">Antonyms</div>
              <div className="word-synonyms">
                {result.antonyms.map(ant => (
                  <span
                    key={ant}
                    className="word-synonym-chip antonym clickable-chip"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(ant)}`)}
                    title={`Look up "${ant}"`}
                  >
                    {ant}
                  </span>
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
      )}

      {/* Empty state before search */}
      {!searchedTerm && !loading && (
        <div className="empty-state animate-fade-in">
          <div className="empty-state-icon"><FiBookOpen size={48} /></div>
          <h3 className="empty-state-title">Discover New Words</h3>
          <p className="empty-state-desc">
            Type any word in the search bar above and press Enter to see its definition, pronunciation, examples, synonyms, and antonyms.
          </p>
        </div>
      )}
    </div>
  );
}
