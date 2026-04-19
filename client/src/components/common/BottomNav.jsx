import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiBookmark, FiRefreshCw, FiEdit3, FiBarChart2 } from 'react-icons/fi';

const navItems = [
  { path: '/daily', icon: <FiHome />, label: 'Home' },
  { path: '/bookmarks', icon: <FiBookmark />, label: 'Saved' },
  { path: '/revision', icon: <FiRefreshCw />, label: 'Revise' },
  { path: '/quiz', icon: <FiEdit3 />, label: 'Quiz' },
  { path: '/dashboard', icon: <FiBarChart2 />, label: 'Stats' },
];

export default function BottomNav() {
  const location = useLocation();

  // Don't show on landing page
  if (location.pathname === '/') return null;

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="bottom-nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
