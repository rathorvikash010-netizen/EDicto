import { FiCheck, FiX, FiRefreshCw, FiHome, FiAward, FiStar, FiThumbsUp, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function QuizResult({ score, total, onRetry }) {
  const navigate = useNavigate();
  const accuracy = Math.round((score / total) * 100);

  const getGrade = () => {
    if (accuracy >= 90) return { icon: <FiAward size={40} />, label: 'Outstanding!', color: 'var(--accent-success)' };
    if (accuracy >= 70) return { icon: <FiStar size={40} />, label: 'Great job!', color: 'var(--accent-primary)' };
    if (accuracy >= 50) return { icon: <FiThumbsUp size={40} />, label: 'Good effort!', color: 'var(--accent-warning)' };
    return { icon: <FiTrendingUp size={40} />, label: 'Keep practicing!', color: 'var(--accent-secondary)' };
  };

  const grade = getGrade();

  return (
    <div className="card quiz-result animate-scale-in">
      <div style={{ marginBottom: '8px', color: grade.color }}>{grade.icon}</div>
      <h2 style={{ marginBottom: '4px' }}>{grade.label}</h2>
      <div className="quiz-result-score" style={{ color: grade.color }}>
        {accuracy}%
      </div>
      <div className="quiz-result-label">Quiz Accuracy</div>

      <div className="quiz-result-details">
        <div className="quiz-result-stat">
          <div className="quiz-result-stat-value" style={{ color: 'var(--accent-success)' }}>
            <FiCheck style={{ marginRight: '4px' }} />
            {score}
          </div>
          <div className="quiz-result-stat-label">Correct</div>
        </div>
        <div className="quiz-result-stat">
          <div className="quiz-result-stat-value" style={{ color: 'var(--accent-secondary)' }}>
            <FiX style={{ marginRight: '4px' }} />
            {total - score}
          </div>
          <div className="quiz-result-stat-label">Wrong</div>
        </div>
        <div className="quiz-result-stat">
          <div className="quiz-result-stat-value">{total}</div>
          <div className="quiz-result-stat-label">Total</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-lg" onClick={onRetry}>
          <FiRefreshCw /> Try Again
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>
          <FiHome /> Dashboard
        </button>
      </div>
    </div>
  );
}
