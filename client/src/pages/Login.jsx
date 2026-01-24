import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, AlertCircle, Moon, Sun, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      setAccessGranted(true);
    } else {
      setAccessDenied(true);
      setError(result.message);
      setTimeout(() => setAccessDenied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background & Effects */}
      <div className="homepage-bg" />
      <div className="scanline" />
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-black/10 dark:bg-black/40" />

      {/* Access Status Overlays */}
      {accessGranted && (
        <div className="access-status access-granted">
          ACCESS GRANTED
        </div>
      )}
      {accessDenied && (
        <div className="access-status access-denied">
          ACCESS DENIED
        </div>
      )}

      {/* Header-like Nav */}
      <div className="fixed top-0 left-0 w-full p-6 flex items-center justify-between z-50">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-all">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">Back to Home</span>
        </Link>
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
        >
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="hero-glass-card p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 bg-white/5 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden p-3 relative">
              <img 
                src="/logo.svg" 
                alt="EnvSync Logo" 
                className="w-full h-full object-contain relative z-10"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tighter">System Login</h1>
            <p className="text-white/50 font-medium">Verify your security credentials</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border border-red-500/50 rounded-xl p-4 flex items-start space-x-3 bg-red-500/10 backdrop-blur-md">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-white/70 uppercase tracking-widest ml-1">Identifier</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-white/20"
                placeholder="admin@envsync.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white/70 uppercase tracking-widest ml-1">Security Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-purple w-full py-5 text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : 'Authenticate'}
            </button>

            <div className="text-center pt-4">
              <p className="text-white/40 font-medium">
                New security entity?{' '}
                <Link 
                  to="/register" 
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4"
                >
                  Create Identity
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
