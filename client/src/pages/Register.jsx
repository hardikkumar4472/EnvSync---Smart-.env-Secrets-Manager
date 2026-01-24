import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, AlertCircle, Moon, Sun, ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('developer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

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
      const result = await register(email, password, role);

      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setAccessGranted(true);
      
      setTimeout(() => {
        if (result.user.role === 'admin') {
          navigate('/app/dashboard');
        } else {
          navigate('/app/cli-commands');
        }
      }, 1500);

    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background & Effects */}
      <div className="homepage-bg z-0" />
      <div className="scanline z-[2]" />
      <div className="fixed inset-0 pointer-events-none z-[1] bg-black/40 backdrop-blur-[2px]" />

      {/* Access Status Overlay */}
      {accessGranted && (
        <div className="access-status access-granted">
          IDENTITY CREATED
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

      <div className="max-w-2xl w-full relative z-10 py-4">
        <div className="hero-glass-card p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Logo & Title */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 space-y-4 sm:space-y-0 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 shadow-xl flex items-center justify-center flex-shrink-0 overflow-hidden p-2 relative">
              <img 
                src="/logo.svg" 
                alt="EnvSync Logo" 
                className="w-full h-full object-contain relative z-10"
              />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black text-white tracking-tighter">Create Identity</h1>
              <p className="text-white/50 text-sm font-medium">Join the EnvSync security protocol</p>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="border border-red-500/50 rounded-xl p-3 flex items-start space-x-3 bg-red-500/10 backdrop-blur-md">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-200 font-medium">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-1">Protocol Identifier</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-white/20 text-sm"
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-1">Entity Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none appearance-none text-sm"
                >
                  <option value="developer" className="bg-gray-900">Developer Entity</option>
                  <option value="admin" className="bg-gray-900">Admin Authority</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-1">Security Key</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-white/20 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-1">Confirm Identity Key</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-white/20 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-purple w-full py-4 text-base font-bold tracking-widest uppercase shadow-lg shadow-purple-500/20"
              >
                {loading ? 'Processing...' : 'Register Identity'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-white/30 text-xs font-medium">
                Already part of the protocol?{' '}
                <Link 
                  to="/login" 
                  className="text-purple-400 hover:text-purple-300 font-bold underline underline-offset-4 ml-1"
                >
                  Authenticate
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
