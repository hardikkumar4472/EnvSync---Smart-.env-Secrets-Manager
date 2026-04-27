import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';

// Lazy load pages
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const Secrets = lazy(() => import('./pages/Secrets'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Users = lazy(() => import('./pages/Users'));
const CLICommands = lazy(() => import('./pages/CLICommands'));
const Documentation = lazy(() => import('./pages/Documentation'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono">
    <div className="relative mb-8">
      <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
    </div>
    <div className="text-cyan-400 text-xs tracking-[0.3em] uppercase animate-pulse">
      Loading Secure Environment...
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingFallback />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminOnlyRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <LoadingFallback />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/app/cli-commands" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingFallback />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<About />} />
        <Route
          path="/login"
          element={user ? (user.role === 'admin' ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/app/cli-commands" replace />) : <Login />}
        />
        <Route
          path="/register"
          element={user ? (user.role === 'admin' ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/app/cli-commands" replace />) : <Register />}
        />
        <Route path="/app/documentation" element={<Documentation />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminOnlyRoute><Dashboard /></AdminOnlyRoute>} />
          <Route path="projects" element={<Projects />} />
          <Route path="secrets" element={<Secrets />} />
          <Route path="audit-logs" element={<AdminOnlyRoute><AuditLogs /></AdminOnlyRoute>} />
          <Route path="users" element={<AdminOnlyRoute><Users /></AdminOnlyRoute>} />
          <Route path="cli-commands" element={<CLICommands />} />
          <Route index element={user?.role === 'admin' ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/app/cli-commands" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
