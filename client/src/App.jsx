import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy-loaded pages (code-split for smaller initial bundle)
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const DailyWord = lazy(() => import('./pages/DailyWord'));
const WordDetail = lazy(() => import('./pages/WordDetail'));
const Search = lazy(() => import('./pages/Search'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Revision = lazy(() => import('./pages/Revision'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Categories = lazy(() => import('./pages/Categories'));
const Profile = lazy(() => import('./pages/Profile'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));

// Page loading fallback
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', color: 'var(--text-light)', fontSize: '1rem',
    }}>
      <div className="page-loader">
        <div className="page-loader-spinner" />
      </div>
    </div>
  );
}

// Redirect to login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// Redirect to /daily if already authenticated
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/daily" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Guest-only routes (login/register) */}
                  <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
                  <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                  <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                  {/* Protected app routes */}
                  <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/daily" element={<DailyWord />} />
                    <Route path="/word/:id" element={<WordDetail />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path="/revision" element={<Revision />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
