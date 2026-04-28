import { useState, useEffect, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, ArrowRight, BookOpen, Lock, Zap, FileText, 
  CheckCircle, Database, Key, Code, User, Github, Linkedin, 
  Mail, X, Terminal, Cpu, Globe, Server, Activity, Layers,
  ChevronRight, ExternalLink
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FeatureCard = memo(({ icon: Icon, title, description, colorClass, delayClass }) => (
  <div className={`hero-glass-card p-8 group hover:scale-[1.02] transition-all duration-500 fade-in-up ${delayClass}`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/5 border border-white/10 group-hover:border-${colorClass}-500/50 transition-colors`}>
      <Icon className={`w-7 h-7 text-${colorClass}-400`} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-white/60 leading-relaxed">{description}</p>
  </div>
));

const Step = memo(({ number, title, description, icon: Icon }) => (
  <div className="flex flex-col items-center text-center space-y-4 fade-in-up">
    <div className="relative">
      <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-white relative z-10 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon className="w-8 h-8 text-cyan-400" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold text-black z-20 shadow-lg">
        {number}
      </div>
    </div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="text-white/50 text-sm max-w-[200px]">{description}</p>
  </div>
));

const About = () => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('cli');

  const sequences = useMemo(() => [
    'INITIALIZING CORE...', 
    'ENCRYPTING ENVIRONMENT...', 
    'ESTABLISHING SECURE HANDSHAKE...', 
    'ACCESS GRANTED.'
  ], []);

  useEffect(() => {
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
        <div className="relative mb-12">
          <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div className="text-cyan-400 text-lg mb-8 tracking-widest uppercase font-black glitch" data-text={loadingText}>{loadingText}</div>
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 animate-[loading-bar_1s_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black selection:bg-cyan-500/30">
      {/* Background Elements */}
      <div className="homepage-bg opacity-40" />
      <div className="scanline" />
      
      {/* Dynamic Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="glass-header mx-auto max-w-7xl mt-4 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border border-white/5 mx-4 sm:mx-6">
          <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 p-1.5 sm:p-2 shadow-lg shadow-cyan-500/20 group-hover:rotate-12 transition-transform">
              <Shield className="text-white w-full h-full" />
            </div>
            <span className="text-lg sm:text-xl font-black text-white tracking-tight">EnvSync</span>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#features" className="text-white/60 hover:text-white transition-colors text-xs sm:text-sm font-medium uppercase tracking-wider">Features</a>
            <a href="#security" className="text-white/60 hover:text-white transition-colors text-xs sm:text-sm font-medium uppercase tracking-wider">Security</a>
            <Link to="/app/cli-commands" className="text-white/60 hover:text-white transition-colors text-xs sm:text-sm font-medium uppercase tracking-wider">CLI</Link>
            <Link to="/app/documentation" className="text-white/60 hover:text-white transition-colors text-xs sm:text-sm font-medium uppercase tracking-wider">Docs</Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => setIsDevModalOpen(true)}
              className="p-2 text-white/60 hover:text-white transition-colors rounded-xl bg-white/5 border border-white/10"
              title="Developer Profile"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <Link to="/login" className="hidden xs:block text-white/80 hover:text-white transition-colors font-bold text-xs sm:text-sm px-2 sm:px-4">Log In</Link>
            <Link to="/register" className="btn-purple !py-2 sm:!py-2.5 !px-4 sm:!px-6 text-xs sm:text-sm whitespace-nowrap">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-20 sm:mb-32 fade-in-down">
            <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black text-white mb-6 sm:mb-8 tracking-tighter leading-[0.9] text-balance">
              Secrets are better <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">Left in Memory.</span>
            </h1>
            <p className="text-base sm:text-xl text-white/50 max-w-3xl mx-auto mb-10 sm:mb-12 leading-relaxed">
              Ditch the insecure <code className="text-red-400/80 bg-red-400/5 px-2 py-0.5 rounded">.env</code> files. 
              Inject production secrets directly into your runtime via secure encrypted tunnels. 
              Built for teams that take security seriously.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-purple !py-4 sm:!py-5 !px-8 sm:!px-10 text-base sm:text-lg group w-full sm:w-auto">
                <span>Deploy EnvSync Now</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/app/documentation" className="btn-glass !py-4 sm:!py-5 !px-8 sm:!px-10 text-base sm:text-lg flex items-center space-x-2 w-full sm:w-auto justify-center">
                <Terminal className="w-5 h-5" />
                <span>Try the CLI</span>
              </Link>
            </div>
          </div>

          {/* CLI Preview / Dashboard Preview Section */}
          <div className="mb-40 fade-in-up delay-200">
            <div className="hero-glass-card p-2 sm:p-4 overflow-hidden shadow-2xl shadow-cyan-500/5 border-white/10">
              <div className="flex items-center space-x-2 p-4 border-b border-white/5 bg-white/2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex bg-white/5 rounded-lg p-1">
                    <button 
                      onClick={() => setActiveTab('cli')}
                      className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'cli' ? 'bg-cyan-500 text-black' : 'text-white/40'}`}
                    >
                      Terminal CLI
                    </button>
                    <button 
                      onClick={() => setActiveTab('dashboard')}
                      className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-cyan-500 text-black' : 'text-white/40'}`}
                    >
                      Audit Engine
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-8 font-mono text-sm sm:text-base min-h-[300px] flex flex-col justify-center bg-black/40">
                {activeTab === 'cli' ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">➜</span>
                      <span className="text-cyan-400">envsync</span>
                      <span className="text-white">login</span>
                    </div>
                    <div className="text-white/50">✔ Authenticated as <span className="text-purple-400">admin@envsync.io</span></div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">➜</span>
                      <span className="text-cyan-400">envsync</span>
                      <span className="text-white">run --project <span className="text-yellow-400">"Core-API"</span> --env <span className="text-green-400">"prod"</span> -- npm start</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-cyan-400/80">[EnvSync] Initializing secure tunnel...</div>
                      <div className="text-cyan-400/80">[EnvSync] Fetching 12 secrets for Core-API (Production)</div>
                      <div className="text-cyan-400/80">[EnvSync] Injecting secrets into memory...</div>
                      <div className="text-green-500 font-bold">[Success] Application started with secure environment variables.</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-white/80 font-bold">Latest Security Events</span>
                      <span className="text-xs text-cyan-400 animate-pulse font-bold uppercase">Live Monitoring</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { time: '14:20:12', user: 'system-bot', action: 'Secret Injection', status: 'GRANTED', color: 'green' },
                        { time: '14:19:45', user: 'dev-user-09', action: 'Project Access', status: 'GRANTED', color: 'green' },
                        { time: '14:18:22', user: 'unknown-ip', action: 'API Key Read', status: 'DENIED', color: 'red' },
                      ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between text-xs sm:text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                          <div className="flex items-center space-x-4">
                            <span className="text-white/30">{log.time}</span>
                            <span className="text-purple-400 font-bold">{log.user}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-white/60">{log.action}</span>
                            <span className={`px-2 py-0.5 rounded bg-${log.color}-500/20 text-${log.color}-400 font-black`}>{log.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div id="features" className="mb-40 scroll-mt-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">Core Infrastructure</h2>
              <p className="text-white/40">Built with zero-trust principles for high-compliance environments.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Lock} 
                title="RAM-Only Runtime" 
                description="Decrypted secrets never touch your storage. They exist only in the application's memory space and vanish instantly on process exit."
                colorClass="cyan"
                delayClass="delay-100"
              />
              <FeatureCard 
                icon={Layers} 
                title="Zero Drift" 
                description="Centralize configurations. One change in the dashboard instantly updates the entire cluster via secure Socket.io channels."
                colorClass="purple"
                delayClass="delay-200"
              />
              <FeatureCard 
                icon={FileText} 
                title="Audit Ledger" 
                description="Every access request, injection, and modification is logged with millisecond precision. Perfect for SOC2 and ISO compliance."
                colorClass="blue"
                delayClass="delay-300"
              />
              <FeatureCard 
                icon={Cpu} 
                title="Project Isolation" 
                description="Granular Role-Based Access Control. Developers only see what they need, and admins control the master encryption keys."
                colorClass="pink"
                delayClass="delay-400"
              />
              <FeatureCard 
                icon={Globe} 
                title="Multi-Cloud Sync" 
                description="Works everywhere. AWS, GCP, Azure, or on-prem. The CLI acts as a universal bridge for your secrets."
                colorClass="yellow"
                delayClass="delay-500"
              />
              <FeatureCard 
                icon={Zap} 
                title="Instant Cleanup" 
                description="Automated rotation and cleanup services ensure stale secrets are flushed from the system periodically."
                colorClass="green"
                delayClass="delay-600"
              />
            </div>
          </div>

          {/* Flow Section */}
          <div id="security" className="hero-glass-card p-16 mb-40 relative overflow-hidden group scroll-mt-32">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] -mr-48 -mt-48 group-hover:bg-cyan-500/20 transition-all duration-700" />
            <h2 className="text-4xl font-black text-white mb-20 text-center">Seamless Lifecycle</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              <Step number="01" title="Vault" description="Securely store your keys in our AES-256 encrypted vault." icon={Database} />
              <Step number="02" title="Bridge" description="Create secure project tunnels via the dashboard." icon={Layers} />
              <Step number="03" title="Inject" description="Use the CLI to pull secrets into your app memory." icon={Code} />
              <Step number="04" title="Audit" description="Monitor every interaction in real-time." icon={Activity} />
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center py-20 fade-in">
            <h2 className="text-5xl font-black text-white mb-8">Ready to secure your stack?</h2>
            <p className="text-white/40 mb-12 max-w-xl mx-auto text-lg">Join us to eliminate the ".env leak" risk forever. Open-source, secure, and blazing fast.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="btn-purple !py-5 !px-16 text-xl shadow-2xl shadow-purple-500/30">Get Started Free</Link>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                <a href="https://github.com/hardikkumar4472" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-white/60 hover:text-white transition-all font-bold text-lg group">
                  <Github className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>GitHub</span>
                </a>
                <a href="https://www.npmjs.com/package/@hardik010190/envsync" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-white/60 hover:text-white transition-all font-bold text-lg group">
                  <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center group-hover:bg-red-500 transition-colors">
                     <span className="text-[10px] font-black text-white">npm</span>
                  </div>
                  <span>NPM Package</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Developer Modal Enhancement */}
      {isDevModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsDevModalOpen(false)} />
          <div className="max-w-md w-full relative z-10">
            {/* ID Card Style */}
            <div className="bg-[#111] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-cyan-500/20">
              <div className="h-32 bg-gradient-to-r from-cyan-500 to-purple-600 p-8 flex justify-end">
                <Shield className="text-white/20 w-16 h-16" />
              </div>
              <div className="px-8 pb-10 -mt-16">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 rounded-3xl bg-[#222] border-4 border-[#111] overflow-hidden flex items-center justify-center">
                    <User className="w-16 h-16 text-white/20" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#111]" />
                </div>
                
                <h2 className="text-3xl font-black text-white mb-1">Hardik Kumar</h2>
                <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-6">Software Developer</p>
                
                <div className="space-y-3">
                  <a href="mailto:hardikv715@gmail.com" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group">
                    <div className="flex items-center space-x-4">
                      <Mail className="w-5 h-5 text-white/40 group-hover:text-red-500 transition-colors" />
                      <span className="text-white/70 font-medium">hardikv715@gmail.com</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </a>
                  <a href="https://github.com/hardikkumar4472" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group">
                    <div className="flex items-center space-x-4">
                      <Github className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                      <span className="text-white/70 font-medium">@hardikkumar4472</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </a>
                  <a href="https://www.linkedin.com/in/hardik-kumar-63a4b3249" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group">
                    <div className="flex items-center space-x-4">
                      <Linkedin className="w-5 h-5 text-white/40 group-hover:text-blue-500 transition-colors" />
                      <span className="text-white/70 font-medium">LinkedIn Profile</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </a>
                </div>

                <button 
                  onClick={() => setIsDevModalOpen(false)}
                  className="w-full mt-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-tighter hover:bg-cyan-500 transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="py-20 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2">
              <Shield className="text-white w-full h-full" />
            </div>
            <span className="text-xl font-black text-white">EnvSync</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-white/40 text-sm font-medium">
            <Link to="/app/documentation" className="hover:text-white transition-colors">Documentation</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <a href="https://github.com/hardikkumar4472" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/package/@hardik010190/envsync" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">NPM</a>
          </div>

          <p className="text-white/20 text-xs font-medium uppercase tracking-[0.2em]">
            © 2026 | Smart Secrets Management
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
