import { Link } from 'react-router-dom';
import { 
  BookOpen, Shield, Code, Users, Key, FileText, Terminal, 
  ArrowLeft, Moon, Sun, ChevronDown, Zap, Cpu, Lock, 
  Globe, Activity, ShieldCheck, Database, Layout, Server,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import PageTransition from '../components/PageTransition';

const Documentation = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const isPublicView = !user;

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-x-hidden pb-20">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/[0.03] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/[0.03] blur-[120px] pointer-events-none" />

        {/* Header - Integrated with App Theme */}
        <header className="glass-header px-4 sm:px-8 py-4 sm:py-6 sticky top-0 z-50 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-black" />
              </div>
              <div className="flex flex-col">
                 <span className="text-xl sm:text-2xl font-black tracking-tighter text-white leading-none">EnvSync</span>
                 <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">System_Protocol</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link to="/" className="text-white/40 hover:text-white transition-all font-black text-[8px] sm:text-[10px] uppercase tracking-widest flex items-center space-x-2 group">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden xs:inline">Return to Central</span>
              </Link>
              <div className="h-6 sm:h-8 w-px bg-white/10" />
              <button
                onClick={toggleDarkMode}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl transition-all bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60"
              >
                {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-12 sm:pt-20 space-y-16 sm:space-y-24">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 mb-4 animate-pulse">
               <Zap className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Documentation Shards</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-tight sm:leading-none">
              Operational <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Manual</span>
            </h1>
            <p className="text-lg text-white/40 max-w-3xl mx-auto font-medium leading-relaxed">
              Complete administrator and developer guide for managing EnvSync industrial secrets. 
              Synchronize your development lifecycle with absolute security protocol.
            </p>
          </div>

          {/* Guide Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Administrator Section */}
            <div className="hero-glass-card p-12 relative overflow-hidden group border-white/5 bg-white/[0.01]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/[0.02] blur-[80px] pointer-events-none" />
              <div className="flex items-center space-x-5 mb-12">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                  <ShieldCheck className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-white tracking-tight">Admin Protocol</h2>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">Management_Infrastructure</p>
                </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-6">
                  <h3 className="text-white/40 font-black text-xs uppercase tracking-[0.4em] flex items-center space-x-3">
                     <Layout className="w-4 h-4 text-cyan-500" />
                     <span>01_Core_Setup</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                     {[
                       { title: 'Identity Verification', desc: 'Authenticate via secure administrative portal.' },
                       { title: 'Vault Initialization', desc: 'Establish encrypted project containers.' },
                       { title: 'Entity Provisioning', desc: 'Grant project access to development shards.' }
                     ].map((step, i) => (
                       <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-colors group/item">
                          <span className="text-cyan-500 font-black text-[10px] uppercase mb-1 block">Phase_{i+1}</span>
                          <h4 className="text-white font-bold text-sm">{step.title}</h4>
                          <p className="text-white/30 text-xs mt-1">{step.desc}</p>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-white/40 font-black text-xs uppercase tracking-[0.4em] flex items-center space-x-3">
                     <Database className="w-4 h-4 text-cyan-500" />
                     <span>02_Secret_Lifecycle</span>
                  </h3>
                  <div className="p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500 text-black text-[8px] font-black uppercase tracking-widest rounded-bl-xl">Secure_Note</div>
                     <p className="text-sm text-white/70 leading-relaxed font-medium">
                       Values are encrypted with AES-256-GCM. Decryption occurs only in ephemeral RAM. Persistent storage never contains plaintext payloads.
                     </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CLI / Developer Section */}
            <div className="hero-glass-card p-12 relative overflow-hidden group border-white/5 bg-white/[0.01]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/[0.02] blur-[80px] pointer-events-none" />
              <div className="flex items-center space-x-5 mb-12">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                  <Terminal className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-white tracking-tight">Developer SDK</h2>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">CLI_Injection_Engine</p>
                </div>
              </div>

              <div className="space-y-10">
                <div className="bg-black/60 rounded-3xl p-10 border border-white/5 font-mono relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent opacity-20" />
                  <div className="flex items-center space-x-2 mb-8">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    <span className="text-white/20 text-[10px] ml-6 tracking-[0.4em] uppercase font-black">Secure_Shell_V4.2</span>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <p className="text-[10px] text-white/20 uppercase tracking-widest">// Initialize session</p>
                       <div className="flex items-center space-x-4">
                          <span className="text-purple-500 font-bold">$</span>
                          <span className="text-white/90 font-bold">envsync login</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] text-white/20 uppercase tracking-widest">// Link vault container</p>
                       <div className="flex items-center space-x-4">
                          <span className="text-purple-400 font-bold">$</span>
                          <span className="text-white/90 font-bold">envsync use <span className="text-cyan-400">PROJ_82X1</span></span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] text-white/20 uppercase tracking-widest">// Inject secrets to runtime</p>
                       <div className="flex items-center space-x-4">
                          <span className="text-purple-400 font-bold">$</span>
                          <span className="text-white/90 font-bold">envsync run <span className="text-purple-400">--env prod</span> npm start</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                      <Cpu className="w-5 h-5 text-purple-400 mb-3" />
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">Fast_Sync</h4>
                      <p className="text-[10px] text-white/30 mt-1">Ultra-low latency secret retrieval via Redis edge.</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                      <Lock className="w-5 h-5 text-purple-400 mb-3" />
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">E2E_Enc</h4>
                      <p className="text-[10px] text-white/30 mt-1">Encrypted transmission from vault to CLI.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Grid */}
          <div className="space-y-12">
             <div className="text-center">
                <h3 className="text-white/20 font-black text-xs uppercase tracking-[0.6em]">Security_Standards_&_Compliance</h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Shield, label: 'SOC2 Ready', color: 'text-cyan-400' },
                  { icon: Activity, label: 'Audit Stream', color: 'text-red-400' },
                  { icon: Server, label: 'Memory Only', color: 'text-purple-400' },
                  { icon: Users, label: 'RBAC Control', color: 'text-emerald-400' }
                ].map((item, i) => (
                  <div key={i} className="hero-glass-card p-6 flex flex-col items-center justify-center text-center space-y-4 border-white/5 hover:bg-white/[0.04] transition-all">
                     <item.icon className={`w-8 h-8 ${item.color}`} />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{item.label}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Terminal / Call to Action */}
          <div className="hero-glass-card p-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[40px] overflow-hidden">
             <div className="bg-[#0A0A0A] rounded-[38px] p-16 text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                <h2 className="text-4xl font-black text-white tracking-tight">Ready to Secure Your Deployment?</h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                   <Link to="/app/projects" className="btn-purple px-12 py-5 rounded-2xl flex items-center space-x-3 group shadow-2xl shadow-purple-500/20">
                      <span className="font-black uppercase tracking-widest text-xs">Initialize Vault</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </Link>
                   <Link to="/app/cli-commands" className="btn-glass px-12 py-5 rounded-2xl flex items-center space-x-3 group text-white/60 hover:text-white">
                      <Terminal className="w-4 h-4" />
                      <span className="font-black uppercase tracking-widest text-xs">Explore CLI Commands</span>
                   </Link>
                </div>
             </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-20 text-center relative z-10 opacity-30">
          <div className="w-12 h-1 bg-white/10 mx-auto mb-10 rounded-full" />
          <span className="text-3xl font-black text-white tracking-tighter">EnvSync</span>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-6">© 2026_Terminal_Identity_Managed</p>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Documentation;
