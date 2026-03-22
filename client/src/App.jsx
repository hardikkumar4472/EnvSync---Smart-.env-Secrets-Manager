import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Secrets from './pages/Secrets';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';
import CLICommands from './pages/CLICommands';
import Documentation from './pages/Documentation';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminOnlyRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Redirect developers to CLI commands page
    return <Navigate to="/app/cli-commands" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
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
      {/* Public Documentation Route */}
      <Route path="/app/documentation" element={<Documentation />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Admin-only routes */}
        <Route path="dashboard" element={<AdminOnlyRoute><Dashboard /></AdminOnlyRoute>} />
        <Route path="projects" element={<Projects />} />
        <Route path="secrets" element={<Secrets />} />
        <Route path="audit-logs" element={<AdminOnlyRoute><AuditLogs /></AdminOnlyRoute>} />
        <Route path="users" element={<AdminOnlyRoute><Users /></AdminOnlyRoute>} />
        
        {/* Available to all authenticated users */}
        <Route path="cli-commands" element={<CLICommands />} />
        
        {/* Default redirect based on role */}
        <Route index element={user?.role === 'admin' ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/app/cli-commands" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
