import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon, FiSearch } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Don't show on landing/auth pages
  if (['/', '/login', '/register'].includes(location.pathname)) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  return (
    <header className="navbar">
      {/* Left spacer for balance */}
      <div className="navbar-left" />

      {/* Center: Search Bar */}
      <form onSubmit={handleSearch} className="navbar-search-form">
        <FiSearch className="navbar-search-icon" />
        <input
          type="text"
          className="navbar-search-input"
          placeholder="Search any word..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="navbar-search"
        />
        <button type="submit" className="navbar-search-btn" aria-label="Search">
          <FiSearch size={16} />
        </button>
      </form>

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
