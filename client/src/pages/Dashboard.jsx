import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI, secretAPI, auditAPI } from '../services/api';
import {
  FolderKanban,
  Key,
  FileText,
  Activity,
  Shield,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Dashboard = () => {
  const [recentActivityRef, recentActivityVisible] = useScrollAnimation({ once: true });
  const [quickActionsRef, quickActionsVisible] = useScrollAnimation({ once: true });
  const [stats, setStats] = useState({
    projects: 0,
    secrets: 0,
    auditLogs: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, auditRes] = await Promise.all([
          projectAPI.list(),
          auditAPI.list(),
        ]);

        let secretsCount = 0;
        if (projectsRes.projects?.length > 0) {
          // Count secrets across all projects and environments
          const secretPromises = projectsRes.projects.flatMap((project) =>
            ['dev', 'staging', 'prod'].map((env) =>
              secretAPI.list(project._id, env).catch(() => ({ secrets: [] }))
            )
          );
          const secretResults = await Promise.all(secretPromises);
          secretsCount = secretResults.reduce(
            (sum, res) => sum + (res.secrets?.length || 0),
            0
          );
        }

        setStats({
          projects: projectsRes.count || 0,
          secrets: secretsCount,
          auditLogs: auditRes.logs?.length || 0,
          recentActivity: auditRes.logs?.slice(0, 5) || [],
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Projects',
      value: stats.projects,
      icon: FolderKanban,
      bgColor: 'rgba(22, 71, 106, 0.1)',
      iconColor: '#16476A',
    },
    {
      title: 'Secrets',
      value: stats.secrets,
      icon: Key,
      bgColor: 'rgba(59, 151, 151, 0.1)',
      iconColor: '#3B9797',
    },
    {
      title: 'Audit Logs',
      value: stats.auditLogs,
      icon: FileText,
      bgColor: 'rgba(191, 9, 47, 0.1)',
      iconColor: '#BF092F',
    },
    {
      title: 'Status',
      value: 'Active',
      icon: Activity,
      bgColor: 'rgba(59, 151, 151, 0.1)',
      iconColor: '#3B9797',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#BF092F'}}></div>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="space-y-4">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--color-text-primary)'}}>Dashboard</h1>
        <p style={{color: 'var(--color-text-light)'}}>
          Welcome to EnvSync Admin Dashboard. Manage your secrets securely.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`rounded-xl shadow-md border p-6 transition-all hover:shadow-lg hover-lift fade-in-up delay-${index}00`}
              style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{color: 'var(--color-text-light)'}}>
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold" style={{color: 'var(--color-text-primary)'}}>
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{backgroundColor: stat.bgColor}}>
                  <Icon className="w-6 h-6" style={{color: stat.iconColor}} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Documentation Section - Placed right after stats to eliminate gap */}
      <div className="rounded-xl shadow-md border p-6" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
        <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--color-text-primary)'}}>
          📚 Documentation & Guide
        </h2>
        
        <div className="space-y-4">
          {/* Getting Started */}
          <div className="rounded-lg border p-4" style={{backgroundColor: 'var(--color-bg-light)', borderColor: 'var(--color-text-light)'}}>
            <h3 className="text-lg font-semibold mb-3" style={{color: 'var(--color-text-primary)'}}>
              🚀 Getting Started
            </h3>
            <div className="space-y-2 text-sm" style={{color: 'var(--color-text-secondary)'}}>
              <p><strong>1. Create a Project:</strong> Go to Projects and create your first project</p>
              <p><strong>2. Add Secrets:</strong> Navigate to Secrets and add environment variables</p>
              <p><strong>3. Install CLI:</strong> Run <code className="px-2 py-1 rounded font-mono text-xs" style={{backgroundColor: '#132440', color: '#3B9797'}}>npm install -g envsync-cli</code></p>
              <p><strong>4. Login:</strong> Use <code className="px-2 py-1 rounded font-mono text-xs" style={{backgroundColor: '#132440', color: '#3B9797'}}>envsync login</code> to authenticate</p>
              <p><strong>5. Run Your App:</strong> Use <code className="px-2 py-1 rounded font-mono text-xs" style={{backgroundColor: '#132440', color: '#3B9797'}}>envsync run --project ID --env dev npm start</code></p>
            </div>
          </div>

          {/* Key Features */}
          <div className="rounded-lg border p-4" style={{backgroundColor: 'var(--color-bg-light)', borderColor: 'var(--color-text-light)'}}>
            <h3 className="text-lg font-semibold mb-3" style={{color: 'var(--color-text-primary)'}}>
              ✨ Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start space-x-2">
                <span style={{color: '#3B9797'}}>✓</span>
                <span className="text-sm" style={{color: 'var(--color-text-secondary)'}}>AES-256 Encryption</span>
              </div>
              <div className="flex items-start space-x-2">
                <span style={{color: '#3B9797'}}>✓</span>
                <span className="text-sm" style={{color: 'var(--color-text-secondary)'}}>Role-Based Access Control</span>
              </div>
              <div className="flex items-start space-x-2">
                <span style={{color: '#3B9797'}}>✓</span>
                <span className="text-sm" style={{color: 'var(--color-text-secondary)'}}>Audit Logging</span>
              </div>
              <div className="flex items-start space-x-2">
                <span style={{color: '#3B9797'}}>✓</span>
                <span className="text-sm" style={{color: 'var(--color-text-secondary)'}}>Multi-Environment Support</span>
              </div>
              <div className="flex items-start space-x-2">
                <span style={{color: '#3B9797'}}>✓</span>
                <span className="text-sm" style={{color: 'var(--color-text-secondary)'}}>CLI Integration</span>
              </div>
              <div className="flex items-start space-x-2">
                <span style={{color: '#3B9797'}}>✓</span>
                <span className="text-sm" style={{color: 'var(--color-text-secondary)'}}>Bulk Import/Export</span>
              </div>
            </div>
          </div>

          {/* Security Best Practices */}
          <div className="rounded-lg border p-4" style={{backgroundColor: 'rgba(191, 9, 47, 0.05)', borderColor: '#BF092F'}}>
            <h3 className="text-lg font-semibold mb-3" style={{color: 'var(--color-text-primary)'}}>
              🔒 Security Best Practices
            </h3>
            <ul className="space-y-2 text-sm" style={{color: 'var(--color-text-secondary)'}}>
              <li className="flex items-start space-x-2">
                <span style={{color: '#BF092F'}}>•</span>
                <span>Never commit .env files to version control</span>
              </li>
              <li className="flex items-start space-x-2">
                <span style={{color: '#BF092F'}}>•</span>
                <span>Use different secrets for each environment (dev, staging, prod)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span style={{color: '#BF092F'}}>•</span>
                <span>Rotate secrets regularly</span>
              </li>
              <li className="flex items-start space-x-2">
                <span style={{color: '#BF092F'}}>•</span>
                <span>Review audit logs periodically</span>
              </li>
              <li className="flex items-start space-x-2">
                <span style={{color: '#BF092F'}}>•</span>
                <span>Limit access using role-based permissions</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/app/documentation"
              className="px-4 py-2 rounded-lg border transition-all text-sm font-medium"
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
              View Full Documentation
            </Link>
            <Link
              to="/app/cli-commands"
              className="px-4 py-2 rounded-lg border transition-all text-sm font-medium"
              style={{borderColor: '#16476A', color: '#16476A'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#16476A';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#16476A';
              }}
            >
              CLI Commands Reference
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <div ref={recentActivityRef} className={`rounded-xl shadow-md border p-6 ${recentActivityVisible ? 'fade-in-up' : 'opacity-0'}`} style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{color: 'var(--color-text-primary)'}}>
              Recent Activity
            </h2>
            <Activity className="w-5 h-5" style={{color: 'var(--color-text-light)'}} />
          </div>
          <div className="space-y-3">
            {stats.recentActivity.map((log, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{backgroundColor: 'var(--color-bg-light)'}}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center gradient-accent">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{color: 'var(--color-text-primary)'}}>
                      {log.action}
                    </p>
                    <p className="text-xs" style={{color: 'var(--color-text-light)'}}>
                      {log.environment && `${log.environment} • `}
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded" style={{backgroundColor: 'rgba(59, 151, 151, 0.1)', color: '#3B9797'}}>
                  {log.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div ref={quickActionsRef} className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${quickActionsVisible ? '' : 'opacity-0'}`}>
        <div className={`rounded-xl p-6 border-2 transition-all hover:shadow-lg hover-lift ${quickActionsVisible ? 'fade-in-left' : 'opacity-0'}`} style={{background: 'linear-gradient(135deg, rgba(22, 71, 106, 0.05) 0%, rgba(22, 71, 106, 0.1) 100%)', borderColor: '#16476A'}}>
          <h3 className="text-lg font-semibold mb-2" style={{color: '#132440'}}>
            Getting Started
          </h3>
          <p className="text-sm mb-4" style={{color: '#4A5568'}}>
            Create your first project and start managing secrets securely.
          </p>
          <Link
            to="/app/projects"
            className="inline-flex items-center font-medium text-sm transition-colors"
            style={{color: '#16476A'}}
            onMouseEnter={(e) => e.currentTarget.style.color = '#132440'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#16476A'}
          >
            Go to Projects →
          </Link>
        </div>

        <div className={`rounded-xl p-6 border-2 transition-all hover:shadow-lg hover-lift ${quickActionsVisible ? 'fade-in-right' : 'opacity-0'}`} style={{background: 'linear-gradient(135deg, rgba(59, 151, 151, 0.05) 0%, rgba(59, 151, 151, 0.1) 100%)', borderColor: '#3B9797'}}>
          <h3 className="text-lg font-semibold mb-2" style={{color: '#132440'}}>
            CLI Documentation
          </h3>
          <p className="text-sm mb-4" style={{color: '#4A5568'}}>
            Learn how to use EnvSync CLI commands in your projects.
          </p>
          <Link
            to="/app/cli-commands"
            className="inline-flex items-center font-medium text-sm transition-colors"
            style={{color: '#3B9797'}}
            onMouseEnter={(e) => e.currentTarget.style.color = '#16476A'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#3B9797'}
          >
            View CLI Commands →
          </Link>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Dashboard;
