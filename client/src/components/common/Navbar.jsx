import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon, FiSearch } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import * as api from '../../services/api';

/**
 * Custom hook: debounced value.
 * Returns the value after the specified delay of inactivity.
 */
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function Navbar() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchWrapperRef = useRef(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Don't show on landing/auth pages
  if (['/', '/login', '/register'].includes(location.pathname)) return null;

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let cancelled = false;
    setLoadingSuggestions(true);

    api.search.suggest(debouncedQuery.trim())
      .then((res) => {
        if (!cancelled) {
          const items = res.data || [];
          setSuggestions(items);
          setShowSuggestions(items.length > 0);
          setActiveSuggestion(-1);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSuggestions(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    submitSearch(searchQuery.trim());
  };

  const submitSearch = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      submitSearch(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (word) => {
    submitSearch(word);
  };

  return (
    <header className="navbar">
      {/* Left spacer for balance */}
      <div className="navbar-left" />

      {/* Center: Search Bar with Suggestions */}
      <div className="navbar-search-wrapper" ref={searchWrapperRef}>
        <form onSubmit={handleSearch} className="navbar-search-form">
          <FiSearch className="navbar-search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search any word..."
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            id="navbar-search"
            autoComplete="off"
          />
          <button type="submit" className="navbar-search-btn" aria-label="Search">
            <FiSearch size={16} />
          </button>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions-dropdown">
            {suggestions.map((word, index) => (
              <button
                key={word}
                className={`search-suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
                onClick={() => handleSuggestionClick(word)}
                onMouseEnter={() => setActiveSuggestion(index)}
              >
                <FiSearch size={13} className="suggestion-icon" />
                <span className="suggestion-text">
                  {/* Highlight matching prefix */}
                  <strong>{word.slice(0, searchQuery.length)}</strong>
                  {word.slice(searchQuery.length)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="navbar-actions">
        <button
          className="btn-icon theme-toggle"
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <FiSun /> : <FiMoon />}
        </button>

        <button
          className="navbar-avatar"
          title={user?.name || 'Profile'}
          onClick={() => navigate('/profile')}
          aria-label="Go to profile"
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </button>
      </div>
    </header>
  );
}
