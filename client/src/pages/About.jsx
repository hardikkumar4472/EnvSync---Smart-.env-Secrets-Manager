import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, BookOpen, Moon, Sun, ChevronDown, Lock, Zap, FileText, CheckCircle, Database, Key, Code, User, Github, Linkedin, Mail, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const About = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  useEffect(() => {
    const sequences = ['INITIALIZING...', 'ENCRYPTING...', 'ACCESS GRANTED.'];
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < sequences.length) {
        setLoadingText(sequences[currentLine]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 500);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[2000] font-mono">
        <div className="text-cyan-400 text-2xl mb-8 glitch" data-text={loadingText}>{loadingText}</div>
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 animate-[loading-bar_1s_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Background Layer */}
      <div className="homepage-bg" />
      <div className="scanline" />

      {/* Header */}
      <header className="glass-header px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shadow-lg p-1.5 overflow-hidden">
            <img src="/logo.svg" alt="EnvSync Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-black text-white">EnvSync</span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <button 
            onClick={() => setIsDevModalOpen(true)}
            className="hidden md:flex items-center space-x-2 text-white/80 hover:text-white transition-colors font-medium text-sm sm:text-base"
          >
            <User className="w-4 h-4" />
            <span>Developer</span>
          </button>
          <Link to="/app/documentation" className="hidden md:flex items-center space-x-2 text-white/80 hover:text-white transition-colors font-medium text-sm sm:text-base">
            <BookOpen className="w-4 h-4" />
            <span>Docs</span>
          </Link>
          <Link to="/login" className="text-white/80 hover:text-white transition-colors font-medium text-sm sm:text-base">Log In</Link>
          <Link to="/register" className="btn-purple px-4 sm:px-8 text-xs sm:text-base">Sign Up</Link>
          <button onClick={toggleDarkMode} className="p-2.5 rounded-full bg-white/10 border border-white/20 text-white">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          
          <div className="hero-glass-card max-w-4xl w-full p-8 sm:p-12 md:p-20 text-center mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white mb-6 tracking-tighter leading-tight">
              Secure Runtime. <br />
              <span className="text-cyan-400">Injected in Memory.</span>
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Protect infrastructure by eliminating .env files. Military-grade encryption at rest and runtime injection.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/login" className="btn-purple py-4 px-12 text-lg inline-flex items-center space-x-3 w-full sm:w-auto">
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/app/documentation" className="btn-glass py-4 px-12 text-lg inline-flex items-center space-x-3 w-full sm:w-auto">
                <BookOpen className="w-5 h-5" />
                <span>Documentation</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="feature-compact-card flex items-start space-x-4">
              <Lock className="w-6 h-6 text-cyan-400 flex-shrink-0" />
              <div><h3 className="text-white font-bold mb-1">Zero-Disk</h3><p className="text-white/50 text-sm">Secrets exist only in RAM.</p></div>
            </div>
            <div className="feature-compact-card flex items-start space-x-4">
              <Zap className="w-6 h-6 text-purple-400 flex-shrink-0" />
              <div><h3 className="text-white font-bold mb-1">Instant</h3><p className="text-white/50 text-sm">CLI integration for any framework.</p></div>
            </div>
            <div className="feature-compact-card flex items-start space-x-4">
              <FileText className="w-6 h-6 text-indigo-400 flex-shrink-0" />
              <div><h3 className="text-white font-bold mb-1">Audit</h3><p className="text-white/50 text-sm">Track every secret access request.</p></div>
            </div>
          </div>

          <div className="w-full mt-32 space-y-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="hero-glass-card p-10 border-l-8 border-red-500/50">
                <h2 className="text-3xl font-black mb-6 text-red-500 uppercase">The Problem</h2>
                <ul className="space-y-4 text-white/80">
                  {['.env files in plain text', 'Secrets committed to Git', 'Shared insecurely'].map((t, i) => <li key={i}>✕ {t}</li>)}
                </ul>
              </div>
              <div className="hero-glass-card p-10 border-l-8 border-cyan-500/50">
                <h2 className="text-3xl font-black mb-6 text-cyan-500 uppercase">The Solution</h2>
                <ul className="space-y-4 text-white/80">
                  {['Encrypted storage', 'Memory-only decryption', 'Zero plain text'].map((t, i) => <li key={i}>✓ {t}</li>)}
                </ul>
              </div>
            </div>

            <div className="hero-glass-card p-12 text-center">
              <h2 className="text-4xl font-extrabold mb-12 text-white">How It Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {['Project', 'Secrets', 'CLI', 'Logs'].map((s, i) => (
                  <div key={i}>
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 bg-white/10 text-white font-bold text-2xl">{i+1}</div>
                    <h3 className="text-white font-bold">{s}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Developer Modal */}
      {isDevModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDevModalOpen(false)} />
          <div className="hero-glass-card max-w-md w-full p-8 relative z-10 scale-in shadow-[0_0_100px_rgba(45,212,191,0.2)]">
            <button 
              onClick={() => setIsDevModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6">
                <User className="w-12 h-12 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Hardik Kumar</h2>
              
              <div className="space-y-4">
                <a href="mailto:hardikv715@gmail.com" className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/80 hover:text-white">
                  <Mail className="w-5 h-5 text-red-500" />
                  <span className="font-medium">hardikv715@gmail.com</span>
                </a>
                <a href="https://github.com/hardikkumar4472" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/80 hover:text-white">
                  <Github className="w-5 h-5 text-white" />
                  <span className="font-medium">hardikkumar4472</span>
                </a>
                <a href="https://www.linkedin.com/in/hardik-kumar-63a4b3249" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/80 hover:text-white">
                  <Linkedin className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">LinkedIn Profile</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="py-16 glass-footer text-center mt-20 relative z-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-2 overflow-hidden mx-auto">
            <img src="/logo.svg" alt="EnvSync Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-black text-white">EnvSync</span>
        </div>
        <p className="text-white/30 text-[10px] uppercase tracking-widest mt-4">© 2026 | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default About;
