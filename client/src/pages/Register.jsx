import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, AlertCircle, ArrowLeft, Lock, Mail, UserPlus, ChevronRight, Activity } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('admin');
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
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden selection:bg-purple-500/30">
      {/* Background & Effects */}
      <div className="homepage-bg opacity-30" />
      <div className="scanline" />
      
      {/* Dynamic Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none z-0" />

      {/* Access Status Overlay */}
      {accessGranted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="text-center space-y-4">
             <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(168,85,247,0.5)]">
               <UserPlus className="w-10 h-10 text-black" />
             </div>
             <div className="text-4xl font-black text-purple-400 tracking-[0.5em] uppercase glitch" data-text="IDENTITY CREATED">IDENTITY CREATED</div>
             <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Initializing security environment...</p>
          </div>
        </div>
      )}

      {/* Register Card */}
      <div className="max-w-2xl w-full relative z-10 fade-in-up py-10">
        <div className="hero-glass-card p-10 border-white/10 shadow-2xl shadow-purple-500/5">
          {/* Back to Home */}
          <Link to="/" className="inline-flex items-center space-x-2 text-white/40 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Hub</span>
          </Link>

          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center space-x-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-2 shadow-lg shadow-purple-500/20">
                   <Shield className="text-white w-full h-full" />
                 </div>
                 <span className="text-xl font-black text-white tracking-tight">EnvSync</span>
               </div>
               <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Create Identity</h1>
               <p className="text-white/40 text-sm font-medium">Provision a new administrative authority.</p>
            </div>
            <div className="hidden md:block">
               <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                  Step 01 / Registration
               </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border border-red-500/20 rounded-2xl p-4 flex items-start space-x-3 bg-red-500/10 backdrop-blur-md animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-200 font-bold uppercase tracking-tight">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Protocol Identifier</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-purple-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-white/10 font-medium"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Authority Level</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-purple-400 transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                  <select
                    value={role}
                    disabled
                    className="w-full pl-11 pr-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white/40 outline-none appearance-none font-medium cursor-not-allowed"
                  >
                    <option value="admin">Admin Authority (Default)</option>
                  </select>
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

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Confirm Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-purple-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-white/10 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
               <button
                 type="submit"
                 disabled={loading}
                 className="btn-purple w-full py-5 text-lg group relative overflow-hidden shadow-xl shadow-purple-500/20"
               >
                 <div className="relative z-10 flex items-center justify-center space-x-3">
                   {loading ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       <span className="text-sm font-black uppercase tracking-widest">Provisioning...</span>
                     </>
                   ) : (
                     <>
                       <span className="text-sm font-black uppercase tracking-widest">Register Identity</span>
                       <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </>
                   )}
                 </div>
               </button>
            </div>

            <div className="text-center pt-2">
              <p className="text-white/30 text-xs font-bold uppercase tracking-wider">
                Already part of the protocol?{' '}
                <Link 
                  to="/login" 
                  className="text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-8"
                >
                  Authenticate
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex items-center justify-between px-2">
          <div className="flex items-center space-x-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
            <Activity className="w-3 h-3" />
            <span>Node: auth-cluster-west</span>
          </div>
          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest text-right">
            By proceeding, you agree to the <br className="md:hidden" /> security protocols.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

