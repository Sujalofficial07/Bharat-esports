import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { UserProfile } from './components/Profile/UserProfile';
import { TournamentList } from './components/Tournaments/TournamentList';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Navigation } from './components/Layout/Navigation';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-aqua text-xl">Loading...</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-aqua text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {user && <Navigation />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/tournaments" /> : <Login />} />
        <Route
          path="/tournaments"
          element={
            <ProtectedRoute>
              <TournamentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={user ? "/tournaments" : "/login"} />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
