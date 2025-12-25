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
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/app/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/app/secrets', icon: Key, label: 'Secrets' },
    { path: '/app/audit-logs', icon: FileText, label: 'Audit Logs' },
    { path: '/app/cli-commands', icon: Terminal, label: 'CLI Commands' },
  ];

  return (
    <div className="h-screen overflow-hidden" style={{backgroundColor: 'var(--color-bg-light)'}}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{backgroundColor: 'rgba(19, 36, 64, 0.5)'}}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{backgroundColor: 'var(--color-dark)'}}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b" style={{borderColor: 'var(--color-dark-light)'}}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center gradient-primary">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">EnvSync</h1>
                <p className="text-xs" style={{color: '#A0AEC0'}}>Admin Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden transition-colors"
              style={{color: '#A0AEC0'}}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#A0AEC0'}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b" style={{borderColor: 'var(--color-dark-light)'}}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center gradient-accent">
                <span className="text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                <p className="text-xs capitalize" style={{color: '#A0AEC0'}}>{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: isActive ? 'rgba(59, 151, 151, 0.2)' : 'transparent',
                    color: isActive ? '#3B9797' : '#A0AEC0',
                    fontWeight: isActive ? '500' : '400'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#A0AEC0';
                    }
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t" style={{borderColor: 'var(--color-dark-light)'}}>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all"
              style={{color: '#BF092F'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(191, 9, 47, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 h-full flex flex-col">
        {/* Top Bar */}
        <header className="shadow-sm border-b sticky top-0 z-30" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden transition-colors"
              style={{color: 'var(--color-text-light)'}}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg transition-all"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(77, 179, 179, 0.1)' : 'rgba(22, 71, 106, 0.1)',
                  color: isDarkMode ? '#4DB3B3' : '#16476A'
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
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <div className="hidden md:flex items-center space-x-2 text-sm" style={{color: 'var(--color-secondary)'}}>
                <Shield className="w-4 h-4" />
                <span className="capitalize font-medium">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{backgroundColor: 'var(--color-bg-light)'}}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
