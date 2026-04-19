import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiTarget, FiEdit3, FiTrendingUp } from 'react-icons/fi';
import dictionaryBg from '../assets/dictionary-bg.png';

const features = [
  {
    icon: <FiBookOpen />,
    title: 'Daily Words',
    desc: 'Learn a new carefully curated word every day with meanings, examples, and pronunciation.',
    color: 'var(--accent-primary)',
    bg: 'var(--accent-primary-bg)',
  },
  {
    icon: <FiTarget />,
    title: 'Smart Revision',
    desc: 'Spaced-repetition system ensures you review words at the optimal time for long-term memory.',
    color: 'var(--accent-teal)',
    bg: 'var(--accent-teal-bg)',
  },
  {
    icon: <FiEdit3 />,
    title: 'Quiz Practice',
    desc: 'Test your knowledge with interactive quizzes and get instant scoring and feedback.',
    color: 'var(--accent-warning)',
    bg: 'var(--accent-warning-bg)',
  },
  {
    icon: <FiTrendingUp />,
    title: 'Track Progress',
    desc: 'Monitor your learning journey with detailed stats, streaks, and weekly progress charts.',
    color: 'var(--accent-secondary)',
    bg: 'rgba(228, 75, 194, 0.08)',
  },
];

const stats = [
  { number: '2,500+', label: 'Vocabulary Words' },
  { number: '150K+', label: 'Active Learners' },
  { number: '4.9★', label: 'User Rating' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-bg">
        <img src={dictionaryBg} alt="" />
        <div className="landing-bg-overlay" />
      </div>

      <div className="landing-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-light))',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1.1rem'
            }}>
              <FiBookOpen />
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="text-gradient">
              Edicto
            </span>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/login')} style={{ fontSize: '0.85rem' }}>
            Sign In →
          </button>
        </div>

        {/* Hero */}
        <div className="landing-hero">
          <div className="landing-badge animate-fade-in">
            Your vocabulary companion
          </div>

          <h1 className="landing-title animate-fade-in-up stagger-1">
            Master Words,<br />
            <span className="text-gradient">Elevate Your Mind</span>
          </h1>

          <p className="landing-subtitle animate-fade-in-up stagger-2">
            Build a powerful vocabulary with daily words, smart revision, interactive quizzes, and progress tracking — designed for GRE, IELTS, and professional growth.
          </p>

          <div className="landing-cta-group animate-fade-in-up stagger-3">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Start Learning <FiArrowRight />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/categories')}>
              Browse Words
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="landing-stats animate-fade-in-up stagger-4">
          {stats.map(stat => (
            <div key={stat.label} className="landing-stat">
              <div className="landing-stat-number">{stat.number}</div>
              <div className="landing-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="landing-features">
          {features.map((feature, i) => (
            <div key={feature.title} className={`landing-feature-card animate-fade-in-up stagger-${i + 1}`}>
              <div className="landing-feature-icon" style={{ background: feature.bg, color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="landing-feature-title">{feature.title}</h3>
              <p className="landing-feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '80px',
          padding: '24px 0',
          borderTop: '1px solid var(--border-light)',
          color: 'var(--text-light)',
          fontSize: '0.8rem'
        }}>
          © 2026 Edicto. Crafted for learners who love words.
        </div>
      </div>
    </div>
  );
}
