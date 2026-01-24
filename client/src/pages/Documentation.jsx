import { Link } from 'react-router-dom';
import { BookOpen, Shield, Code, Users, Key, FileText, Terminal, ArrowLeft, Moon, Sun, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Documentation = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const isPublicView = !user;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background & Effects */}
      <div className="homepage-bg" />
      <div className="scanline" />
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-black/10 dark:bg-black/30" />

      {/* Header (Always show themed header for consistent UI) */}
      <header className="glass-header px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md shadow-lg border border-white/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">EnvSync</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-white/80 hover:text-white transition-colors font-medium flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full transition-all bg-white/10 hover:bg-white/20 border border-white/20 text-white"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 space-y-16">
        {/* Title Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black text-white tracking-tight">
            System <span className="text-cyan-400">Documentation</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium">
            Complete administrator and developer guide for managing EnvSync industrial secrets.
          </p>
        </div>

        {/* Administrator Guide */}
        <div className="hero-glass-card p-10 relative overflow-hidden group">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-lg">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-white">Administrator Guide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-cyan-400 font-bold text-lg mb-3 uppercase tracking-wider">1. Getting Started</h3>
                <ul className="space-y-3">
                  {['Login with your admin credentials', 'Create projects for your applications', 'Add secrets for each environment', 'Monitor audit logs for security transparency'].map((item, i) => (
                    <li key={i} className="flex items-start space-x-3 text-white/70">
                      <span className="text-cyan-500 mt-1 font-bold">»</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-cyan-400 font-bold text-lg mb-3 uppercase tracking-wider">2. Managing Projects</h3>
                <p className="text-white/60 mb-4">Projects represent your core applications and isolated environments.</p>
                <div className="space-y-2">
                  <div className="feature-compact-card">
                    <span className="text-white font-bold">New Project:</span>
                    <span className="text-white/50 ml-2">Define cross-environment secret containers.</span>
                  </div>
                  <div className="feature-compact-card">
                    <span className="text-white font-bold">Project ID:</span>
                    <span className="text-white/50 ml-2">Unique identifiers for CLI memory injection.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-cyan-400 font-bold text-lg mb-3 uppercase tracking-wider">3. Managing Secrets</h3>
                <p className="text-white/60 mb-4">Industrial grade AES-256-GCM encryption at rest.</p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 border-l-4 border-l-cyan-500">
                  <p className="text-sm text-white/80 leading-relaxed font-mono">
                    Values are only decrypted in the application's RAM during runtime. Never written to persistent storage.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-cyan-400 font-bold text-lg mb-3 uppercase tracking-wider">4. Security Compliance</h3>
                <ul className="grid grid-cols-2 gap-4">
                  {['SOC2 Ready', 'Full Audit Trail', 'Memory Only', 'RBAC Enabled'].map((item, i) => (
                    <li key={i} className="flex items-center space-x-2 text-white/60 bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CLI Usage Guide */}
        <div className="hero-glass-card p-10 relative overflow-hidden group border-l-8 border-l-purple-500">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-lg">
              <Terminal className="w-6 h-6 text-purple-500" />
            </div>
            <h2 className="text-3xl font-bold text-white">Developer CLI Guide</h2>
          </div>

          <div className="bg-black/40 rounded-2xl p-8 border border-white/5 font-mono">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-white/40 text-xs ml-4 tracking-widest">ENVSYNC_SECURE_SHELL</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <span className="text-purple-400">$</span>
                <span className="text-white/90">envsync login</span>
                <span className="text-white/30 text-sm"># Identity verification</span>
              </div>
              <div className="flex space-x-4">
                <span className="text-purple-400">$</span>
                <span className="text-white/90">envsync use [project_id]</span>
                <span className="text-white/30 text-sm"># Local config</span>
              </div>
              <div className="flex space-x-4">
                <span className="text-purple-400">$</span>
                <span className="text-white/90">envsync run --env prod npm start</span>
                <span className="text-white/30 text-sm"># Injection complete</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link to="/app/cli-commands" className="btn-purple py-4 px-12 text-lg inline-flex items-center space-x-3">
              <span>View Full Reference</span>
              <Code className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/app/projects" className="hero-glass-card p-8 transition-all hover:scale-[1.02] hover:bg-white/5">
            <Key className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Projects</h3>
            <p className="text-white/50 text-sm">Initialize secure environment containers.</p>
          </Link>
          
          <Link to="/app/audit-logs" className="hero-glass-card p-8 transition-all hover:scale-[1.02] hover:bg-white/5">
            <FileText className="w-8 h-8 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Audit Trails</h3>
            <p className="text-white/50 text-sm">Track real-time encryption activities.</p>
          </Link>

          <Link to="/app/dashboard" className="hero-glass-card p-8 transition-all hover:scale-[1.02] hover:bg-white/5">
            <Users className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Admin Dashboard</h3>
            <p className="text-white/50 text-sm">Monitor overall system security health.</p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-16 glass-footer text-center mt-20 relative z-10">
        <span className="text-2xl font-black text-white">EnvSync</span>
        <p className="text-white/30 text-xs uppercase tracking-widest mt-4">© 2026 | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Documentation;
