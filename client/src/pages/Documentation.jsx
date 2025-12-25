import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Shield, Code, Users, Key, FileText, Terminal, ArrowLeft, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Documentation = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const isPublicView = !user;

  return (
    <div className={isPublicView ? "min-h-screen" : ""} style={isPublicView ? {background: 'linear-gradient(to bottom, var(--color-bg-light) 0%, var(--color-bg-light) 100%)'} : {}}>
      {/* Public Header - Only shown when not logged in */}
      {isPublicView && (
        <header className="shadow-sm border-b" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center gradient-primary">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{color: 'var(--color-text-primary)'}}>EnvSync</h1>
                  <p className="text-xs" style={{color: 'var(--color-text-light)'}}>Secure Secret Management</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
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

                <Link
                  to="/"
                  className="px-6 py-2 border-2 rounded-lg transition-all font-medium flex items-center space-x-2"
                  style={{borderColor: '#3B9797', color: '#3B9797'}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#3B9797';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#3B9797';
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className={isPublicView ? "max-w-7xl mx-auto px-6 py-12" : ""}>
        <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--color-text-primary)'}}>
          Documentation
        </h1>
        <p style={{color: 'var(--color-text-light)'}}>
          Complete administrator guide for managing EnvSync
        </p>
      </div>

      {/* Admin Guide */}
      <div className="rounded-xl shadow-md border p-6" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgba(191, 9, 47, 0.1)'}}>
            <Shield className="w-5 h-5" style={{color: '#BF092F'}} />
          </div>
          <h2 className="text-2xl font-semibold" style={{color: 'var(--color-text-primary)'}}>
            Administrator Guide
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>
              1. Getting Started
            </h3>
            <p className="mb-3" style={{color: 'var(--color-text-secondary)'}}>
              As an administrator, you have full access to manage projects,
              secrets, and view audit logs. Follow these steps to get started:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4" style={{color: 'var(--color-text-secondary)'}}>
              <li>Login with your admin credentials</li>
              <li>Create projects for your applications</li>
              <li>Add secrets for each environment (dev, staging, prod)</li>
              <li>Monitor audit logs for security compliance</li>
              <li>Share project IDs with your team members who use the CLI</li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>
              2. Managing Projects
            </h3>
            <p className="mb-3" style={{color: 'var(--color-text-secondary)'}}>
              Projects represent your applications. Each project can have
              multiple secrets across different environments.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4" style={{color: 'var(--color-text-secondary)'}}>
              <li>
                <strong style={{color: 'var(--color-text-primary)'}}>Create Project:</strong> Click "New Project" button,
                enter name and description
              </li>
              <li>
                <strong style={{color: 'var(--color-text-primary)'}}>Copy Project ID:</strong> Click "Copy ID" to get the
                MongoDB ObjectId
              </li>
              <li>
                <strong style={{color: 'var(--color-text-primary)'}}>Share Project ID:</strong> Share the Project ID with team members
                so they can use it in CLI commands
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>
              3. Managing Secrets
            </h3>
            <p className="mb-3" style={{color: 'var(--color-text-secondary)'}}>
              Secrets are encrypted using AES-256-GCM encryption and stored
              securely in MongoDB. Only admins can view decrypted values.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4" style={{color: 'var(--color-text-secondary)'}}>
              <li>
                <strong style={{color: 'var(--color-text-primary)'}}>Create Secret:</strong> Select project, environment,
                enter key and value
              </li>
              <li>
                <strong style={{color: 'var(--color-text-primary)'}}>View Secret Value:</strong> Click the eye icon to view
                decrypted value (admin only)
              </li>
              <li>
                <strong style={{color: 'var(--color-text-primary)'}}>Environments:</strong> Use dev, staging, or prod for
                different deployment stages
              </li>
              <li>
                <strong style={{color: 'var(--color-text-primary)'}}>Security:</strong> Values are encrypted at rest, only
                decrypted in memory when accessed
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>
              4. Audit Logs
            </h3>
            <p className="mb-3" style={{color: 'var(--color-text-secondary)'}}>
              All actions are logged for compliance and security monitoring.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4" style={{color: 'var(--color-text-secondary)'}}>
              <li>
                <strong style={{color: 'var(--color-text-primary)'}}>View Logs:</strong> Navigate to Audit Logs page to see
                all activities
              </li>
              <li>
                <strong style={{color: 'var(--color-text-primary)'}}>Filter:</strong> Filter by action type (LOGIN,
                SECRET_CREATE, etc.)
              </li>
              <li>
                <strong style={{color: 'var(--color-text-primary)'}}>Compliance:</strong> Complete audit trail for SOC2,
                HIPAA, and other compliance requirements
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>
              5. Best Practices
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-4" style={{color: 'var(--color-text-secondary)'}}>
              <li>Use different secrets for each environment</li>
              <li>Rotate secrets regularly</li>
              <li>Review audit logs weekly</li>
              <li>Limit admin access to trusted personnel</li>
              <li>Use strong master keys (32+ characters)</li>
              <li>Enable HTTPS in production</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CLI Usage Guide for Team Members */}
      <div className="rounded-xl shadow-md border p-6" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgba(59, 151, 151, 0.1)'}}>
            <Terminal className="w-5 h-5" style={{color: '#3B9797'}} />
          </div>
          <h2 className="text-2xl font-semibold" style={{color: 'var(--color-text-primary)'}}>
            CLI Usage Guide (For Team Members)
          </h2>
        </div>

        <div className="space-y-4">
          <p style={{color: 'var(--color-text-secondary)'}} className="mb-4">
            This section provides information about how team members can use the EnvSync CLI tool.
            Share this guide with developers who need to use secrets in their applications.
          </p>

          <div>
            <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>
              Quick Start for Team Members
            </h3>
            <ol className="list-decimal list-inside space-y-2 ml-4" style={{color: 'var(--color-text-secondary)'}}>
              <li>Install CLI: <code className="px-1 py-0.5 rounded" style={{backgroundColor: '#F8F9FA', color: '#BF092F'}}>cd cli && npm install && npm link</code></li>
              <li>Login: <code className="px-1 py-0.5 rounded" style={{backgroundColor: '#F8F9FA', color: '#BF092F'}}>envsync login</code></li>
              <li>Get Project ID from admin dashboard</li>
              <li>Run app: <code className="px-1 py-0.5 rounded" style={{backgroundColor: '#F8F9FA', color: '#BF092F'}}>envsync run --project ID --env dev npm start</code></li>
            </ol>
          </div>

          <div className="border rounded-lg p-4" style={{backgroundColor: 'rgba(59, 151, 151, 0.05)', borderColor: '#3B9797'}}>
            <p className="text-sm" style={{color: '#16476A'}}>
              <strong>Note:</strong> For complete CLI command reference, visit the{' '}
              <Link to="/app/cli-commands" className="underline font-semibold" style={{color: '#BF092F'}}>
                CLI Commands
              </Link>{' '}
              page.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/app/cli-commands"
          className="rounded-xl shadow-md border p-6 transition-all hover:shadow-lg block"
          style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}
        >
          <div className="flex items-center space-x-3 mb-2">
            <Terminal className="w-6 h-6" style={{color: '#3B9797'}} />
            <h3 className="text-lg font-semibold" style={{color: 'var(--color-text-primary)'}}>
              CLI Commands
            </h3>
          </div>
          <p className="text-sm" style={{color: 'var(--color-text-light)'}}>
            Complete reference for all CLI commands
          </p>
        </Link>

        <Link
          to="/app/projects"
          className="rounded-xl shadow-md border p-6 transition-all hover:shadow-lg block"
          style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}
        >
          <div className="flex items-center space-x-3 mb-2">
            <Key className="w-6 h-6" style={{color: '#16476A'}} />
            <h3 className="text-lg font-semibold" style={{color: 'var(--color-text-primary)'}}>Projects</h3>
          </div>
          <p className="text-sm" style={{color: 'var(--color-text-light)'}}>
            Manage your application projects
          </p>
        </Link>

        <Link
          to="/app/audit-logs"
          className="rounded-xl shadow-md border p-6 transition-all hover:shadow-lg block"
          style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}
        >
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="w-6 h-6" style={{color: '#BF092F'}} />
            <h3 className="text-lg font-semibold" style={{color: 'var(--color-text-primary)'}}>
              Audit Logs
            </h3>
          </div>
          <p className="text-sm" style={{color: 'var(--color-text-light)'}}>
            View complete activity trail
          </p>
        </Link>
      </div>
      </div>
    </div>
    </div>
  );
};

export default Documentation;
