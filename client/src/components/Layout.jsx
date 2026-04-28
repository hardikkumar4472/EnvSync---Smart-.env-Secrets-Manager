import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  FolderKanban,
  Key,
  FileText,
  Terminal,
  LogOut,
  Menu,
  X,
  Shield,
  Moon,
  Sun,
  ChevronDown,
  Users,
  User as UserIcon
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const navItems = [
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', adminOnly: true },
    { path: '/app/projects', icon: FolderKanban, label: 'Projects', adminOnly: true },
    { path: '/app/secrets', icon: Key, label: 'Secrets', adminOnly: true },
    { path: '/app/users', icon: Users, label: 'Users', adminOnly: true },
    { path: '/app/audit-logs', icon: FileText, label: 'Audit Logs', adminOnly: true },
    { path: '/app/cli-commands', icon: Terminal, label: 'CLI', adminOnly: false },
  ].filter(item => !item.adminOnly || user?.role === 'admin');

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background & Scanners */}
      <div className="homepage-bg z-0" />
      <div className="scanline z-[2]" />
      <div className="fixed inset-0 pointer-events-none z-[1] bg-black/40 backdrop-blur-[2px]" />

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-[100] glass-header bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <Link to="/app/dashboard" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shadow-lg group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-all overflow-hidden p-1.5 relative">
                  <img 
                    src="/logo.svg" 
                    alt="EnvSync Logo" 
                    className="w-full h-full object-contain relative z-10"
                  />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-white tracking-tighter leading-none">EnvSync</h1>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/40 font-black">Industrial Protocol</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-xl transition-all group border ${
                      isActive 
                        ? 'bg-white/10 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                        : 'text-white/40 border-transparent hover:text-white hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                    <span className="text-[10px] font-black tracking-widest uppercase">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User Dropdown Container */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center space-x-2 sm:space-x-3 p-1 sm:p-1.5 pr-1.5 sm:pr-4 rounded-xl border transition-all ${
                    profileDropdownOpen 
                    ? 'bg-white/15 border-purple-500/50 shadow-lg shadow-purple-500/10' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                  </div>
                  <div className="hidden xs:block text-left">
                    <p className="text-[10px] sm:text-[11px] font-black text-white leading-none truncate max-w-[80px] sm:max-w-[120px]">{user?.email?.split('@')[0]}</p>
                    <div className="flex items-center space-x-1 mt-0.5">
                       <div className="w-1 h-1 rounded-full bg-cyan-500" />
                       <p className="text-[8px] uppercase font-black text-white/30 tracking-[0.1em]">{user?.role}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-white/30 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {/* Dropdown Card */}
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-3 w-64 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                       <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5">Authorized Entity</p>
                          <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                       </div>
                       <div className="p-2 space-y-1">
                          <button
                            onClick={() => { navigate('/app/dashboard'); setProfileDropdownOpen(false); }}
                            className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all text-white/60 hover:text-white hover:bg-white/5 font-bold text-xs"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>System Dashboard</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold text-xs"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Terminate Protocol</span>
                          </button>
                       </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Icon */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] lg:hidden" 
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <div className="lg:hidden fixed top-16 sm:top-20 left-0 w-full bg-[#0A0A0A] border-t border-white/10 shadow-2xl z-[200] animate-in slide-in-from-top duration-300">
              <div className="p-4 space-y-2 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="px-5 py-2 mb-2">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Protocol Navigation</p>
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-4 px-5 py-4 rounded-xl transition-all border ${
                        isActive 
                          ? 'bg-purple-500/20 text-white border-purple-500/40 shadow-lg shadow-purple-500/10' 
                          : 'text-white/40 border-transparent hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                      <span className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                    </Link>
                  );
                })}
                
                <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="flex items-center space-x-4 w-full px-5 py-4 rounded-xl text-red-500/60 hover:bg-red-500/10 transition-all text-sm font-black uppercase tracking-widest"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Terminate Session</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 pt-24 sm:pt-32 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Industrial Status Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-4 sm:p-6 pointer-events-none flex justify-between items-end z-40">
        <div className="flex items-center space-x-3 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl">
           <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[8px] sm:text-[9px] uppercase font-black tracking-[0.4em] text-white/60">System Link Active</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 px-5 py-2.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl">
           <div className="flex items-center space-x-2">
              <Shield className="w-3 h-3 text-cyan-400" />
              <span className="text-[9px] uppercase font-black tracking-[0.4em] text-white/40">AES_256_GCM</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
