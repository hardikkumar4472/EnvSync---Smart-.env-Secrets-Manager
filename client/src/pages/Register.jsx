import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, AlertCircle, Moon, Sun } from 'lucide-react';
const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://envsync-backend.onrender.com';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('developer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
     const response = await fetch(`${API_URL}/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password, role }),
});

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto-login after registration
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Navigate based on role
      if (data.user.role === 'admin') {
        navigate('/app/dashboard');
      } else {
        navigate('/app/cli-commands'); // Developers go to CLI commands
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
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
            <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--color-text-primary)'}}>Create Account</h1>
            <p style={{color: 'var(--color-text-light)'}}>Register for EnvSync</p>
          </div>

          {/* Registration Form */}
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
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium mb-2"
                style={{color: 'var(--color-text-primary)'}}
              >
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-light)',
                  borderColor: 'var(--color-text-light)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="developer">Developer</option>
                <option value="admin">Admin</option>
              </select>
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
                style={{color: 'var(--color-text-primary)'}}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center">
              <p style={{color: 'var(--color-text-light)'}}>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium transition-colors"
                  style={{color: '#3B9797'}}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#4DB3B3'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#3B9797'}
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
