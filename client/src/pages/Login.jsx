import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, AlertCircle, ArrowLeft, Lock, Mail, ChevronRight, Activity } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
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
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden selection:bg-cyan-500/30">
      {/* Background & Effects */}
      <div className="homepage-bg opacity-40" />
      <div className="scanline" />
      
      {/* Dynamic Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-0" />

      {/* Access Status Overlays */}
      {accessGranted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="text-center space-y-4">
             <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(6,182,212,0.5)]">
               <Shield className="w-10 h-10 text-black" />
             </div>
             <div className="text-4xl font-black text-cyan-400 tracking-[0.5em] uppercase glitch" data-text="ACCESS GRANTED">ACCESS GRANTED</div>
             <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Redirecting to core mainframe...</p>
          </div>
        </div>
      )}

      {/* Login Card */}
      <div className="max-w-md w-full relative z-10 fade-in-up">
        <div className="hero-glass-card p-10 border-white/10 shadow-2xl shadow-cyan-500/5">
          {/* Back to Home */}
          <Link to="/" className="inline-flex items-center space-x-2 text-white/40 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Hub</span>
          </Link>

          <div className="mb-10 text-center sm:text-left">
            <div className="flex items-center space-x-3 mb-4 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2 shadow-lg shadow-cyan-500/20">
                <Shield className="text-white w-full h-full" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">EnvSync</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">System Login</h1>
            <p className="text-white/40 text-sm font-medium">Verify your security identity to proceed.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`border rounded-2xl p-4 flex items-start space-x-3 bg-red-500/10 backdrop-blur-md border-red-500/20 ${accessDenied ? 'animate-shake' : ''}`}>
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-200 font-bold uppercase tracking-tight">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Protocol Identifier</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-cyan-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-white/10 font-medium"
                  placeholder="admin@envsync.io"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Security Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-purple-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-white/10 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-purple w-full py-5 text-lg group relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm font-black uppercase tracking-widest">Encrypting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-black uppercase tracking-widest">Authenticate</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>

            <div className="text-center pt-4">
              <p className="text-white/30 text-xs font-bold uppercase tracking-wider">
                New security entity?{' '}
                <Link 
                  to="/register" 
                  className="text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-8"
                >
                  Create Identity
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex items-center justify-between px-2">
          <div className="flex items-center space-x-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
            <Activity className="w-3 h-3" />
            <span>Server: prod-tunnel-01</span>
          </div>
          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">
            v2.0.4-SECURE
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
