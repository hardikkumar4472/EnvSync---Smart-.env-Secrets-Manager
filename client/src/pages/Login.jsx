import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, AlertCircle, Moon, Sun } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: 'linear-gradient(135deg, var(--color-dark) 0%, var(--color-secondary) 100%)'}}>
      {/* Dark Mode Toggle - Floating */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 p-3 rounded-lg transition-all shadow-lg z-50"
        style={{
          backgroundColor: isDarkMode ? 'rgba(77, 179, 179, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          color: isDarkMode ? '#4DB3B3' : '#FFFFFF',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? (
          <Sun className="w-6 h-6" />
        ) : (
          <Moon className="w-6 h-6" />
        )}
      </button>

      <div className="max-w-md w-full">
        <div className="rounded-2xl shadow-2xl p-8" style={{backgroundColor: 'var(--color-bg-card)'}}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 gradient-primary shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--color-text-primary)'}}>EnvSync</h1>
            <p style={{color: 'var(--color-text-light)'}}>Secure Secret Management System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border rounded-lg p-4 flex items-start space-x-3" style={{backgroundColor: 'rgba(191, 9, 47, 0.1)', borderColor: '#BF092F'}}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: '#BF092F'}} />
                <p className="text-sm" style={{color: '#BF092F'}}>{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{color: 'var(--color-text-primary)'}}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-light)',
                  borderColor: 'var(--color-text-light)',
                  color: 'var(--color-text-primary)'
                }}
                placeholder="admin@envsync.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{color: 'var(--color-text-primary)'}}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-light)',
                  borderColor: 'var(--color-text-light)',
                  color: 'var(--color-text-primary)'
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-white transition-all gradient-primary"
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center">
              <p style={{color: 'var(--color-text-light)'}}>
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium transition-colors"
                  style={{color: '#3B9797'}}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#4DB3B3'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#3B9797'}
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
