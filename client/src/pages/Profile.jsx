import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { FiUser, FiMail, FiCalendar, FiBookmark, FiRefreshCw, FiCheck, FiTarget, FiArrowLeft, FiEdit3 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const { bookmarkedWords, revisionWords, quizResults, stats, streak } = useApp();
  const navigate = useNavigate();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const statItems = [
    { icon: <FiBookmark />, number: bookmarkedWords.length, label: 'Bookmarked', bg: 'var(--accent-primary-bg)', color: 'var(--accent-primary)' },
    { icon: <FiRefreshCw />, number: revisionWords.length, label: 'In Revision', bg: 'var(--accent-teal-bg)', color: 'var(--accent-teal)' },
    { icon: <FiCheck />, number: stats.totalWordsLearned || 0, label: 'Learned', bg: 'var(--accent-success-bg)', color: 'var(--accent-success)' },
    { icon: <FiEdit3 />, number: quizResults.length, label: 'Quizzes Taken', bg: 'var(--accent-warning-bg)', color: 'var(--accent-warning)' },
    { icon: <FiTarget />, number: `${stats.quizAccuracy}%`, label: 'Quiz Accuracy', bg: 'var(--accent-coral-bg)', color: 'var(--accent-coral)' },
    { icon: <FiTarget />, number: streak.count, label: 'Day Streak', bg: 'rgba(155,107,255,0.1)', color: 'var(--accent-primary)' },
  ];

  return (
    <div className="page-container">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-lg)' }}>
        <FiArrowLeft /> Back
      </button>

      <div className="section-header">
        <div>
          <h2 className="section-title">
            <FiUser style={{ marginRight: '8px', verticalAlign: '-2px' }} />
            Profile
          </h2>
          <p className="section-subtitle">Your account and learning summary</p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="profile-card animate-fade-in">
        <div className="profile-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user?.name || 'User'}</h2>
          <div className="profile-detail"><FiMail size={14} /><span>{user?.email || 'No email'}</span></div>
          <div className="profile-detail"><FiCalendar size={14} /><span>Member since {memberSince}</span></div>
        </div>
        <button className="btn btn-ghost profile-logout-btn" onClick={async () => { await logout(); navigate('/login'); }}>
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 'var(--space-xl) 0 var(--space-lg)' }}>
        Learning Summary
      </h3>
      <div className="profile-stats-grid animate-fade-in-up">
        {statItems.map((s, i) => (
          <div key={i} className="profile-stat-card">
            <div className="profile-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="profile-stat-number">{s.number}</div>
            <div className="profile-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
