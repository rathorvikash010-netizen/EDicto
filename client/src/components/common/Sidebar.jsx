import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiBookmark, FiRefreshCw, FiEdit3, FiBarChart2, FiGrid, FiBook, FiLogOut, FiSun, FiMoon, FiAward } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { path: '/daily', icon: <FiHome />, label: 'Home' },
  { path: '/bookmarks', icon: <FiBookmark />, label: 'Saved' },
  { path: '/revision', icon: <FiRefreshCw />, label: 'Revise' },
  { path: '/quiz', icon: <FiEdit3 />, label: 'Quiz' },
  { path: '/dashboard', icon: <FiBarChart2 />, label: 'Stats' },
  { path: '/categories', icon: <FiGrid />, label: 'Browse' },
  { path: '/leaderboard', icon: <FiAward />, label: 'Leaderboard' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate('/daily')} style={{ cursor: 'pointer' }}>
        <div className="sidebar-brand-icon">
          <FiBook />
        </div>
        <span className="sidebar-brand-text text-gradient">Edicto</span>
      </div>

      <div className="sidebar-section-title">Menu</div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-section-title">Account</div>

        {/* Theme Toggle */}
        <button className="sidebar-link sidebar-theme-btn" onClick={toggleTheme}>
          <span className="sidebar-link-icon">{isDark ? <FiSun /> : <FiMoon />}</span>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {user && (
          <div
            className="sidebar-user-info sidebar-user-clickable"
            onClick={() => navigate('/profile')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
            title="View profile"
          >
            <div className="sidebar-user-avatar">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
          </div>
        )}

        <button className="sidebar-link sidebar-logout-btn" onClick={handleLogout}>
          <span className="sidebar-link-icon"><FiLogOut /></span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
