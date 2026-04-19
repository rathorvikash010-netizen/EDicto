import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import StreakCard from '../components/dashboard/StreakCard';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import { FiBookmark, FiCheck, FiTarget, FiRefreshCw, FiEdit3, FiBarChart2 } from 'react-icons/fi';

export default function Dashboard() {
  const { stats, streak, weeklyData, activities, bookmarkedWords, revisionWords, quizResults } = useApp();
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <FiBarChart2 style={{ marginRight: '8px', verticalAlign: '-2px' }} />
            Dashboard
          </h2>
          <p className="section-subtitle">Your learning journey at a glance</p>
        </div>
      </div>

      {/* Top Row: Streak + Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '200px 1fr',
        gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)', alignItems: 'stretch'
      }} className="dashboard-top-row">
        <StreakCard count={streak.count} />

        <div className="stats-grid">
          <StatCard
            icon={<FiCheck />}
            number={stats.totalWordsLearned || 0}
            label="Words Learned"
            color="var(--accent-primary)"
            bgColor="var(--accent-primary-bg)"
          />
          <StatCard
            icon={<FiBookmark />}
            number={bookmarkedWords.length}
            label="Words Saved"
            color="var(--accent-teal)"
            bgColor="var(--accent-teal-bg)"
          />
          <StatCard
            icon={<FiTarget />}
            number={`${stats.quizAccuracy}%`}
            label="Quiz Accuracy"
            color="var(--accent-warning)"
            bgColor="var(--accent-warning-bg)"
          />
          <StatCard
            icon={<FiEdit3 />}
            number={quizResults.length}
            label="Quizzes Taken"
            color="var(--accent-success)"
            bgColor="var(--accent-success-bg)"
          />
          <StatCard
            icon={<FiRefreshCw />}
            number={revisionWords.length}
            label="In Revision"
            color="var(--accent-coral)"
            bgColor="var(--accent-coral-bg)"
          />
        </div>
      </div>

      {/* Chart + Activity */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)',
      }} className="dashboard-bottom-row">
        <WeeklyChart data={weeklyData} />
        <RecentActivity activities={activities} />
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .dashboard-top-row {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .dashboard-bottom-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}
      </style>
    </div>
  );
}
