import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI, secretAPI, auditAPI } from '../services/api';
import {
  FolderKanban,
  Key,
  FileText,
  Activity,
  Shield,
  Zap,
  Lock,
  ArrowRight,
  ChevronRight,
  Database,
  Terminal,
  Clock,
  BookOpen
} from 'lucide-react';
import PageTransition from '../components/PageTransition';

const Dashboard = () => {
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
      color: 'text-cyan-400',
      glow: 'shadow-cyan-500/20'
    },
    {
      title: 'Secrets',
      value: stats.secrets,
      icon: Key,
      color: 'text-purple-400',
      glow: 'shadow-purple-500/20'
    },
    {
      title: 'Audit Logs',
      value: stats.auditLogs,
      icon: FileText,
      color: 'text-red-400',
      glow: 'shadow-red-500/20'
    },
    {
      title: 'Status',
      value: 'Active',
      icon: Activity,
      color: 'text-emerald-400',
      glow: 'shadow-emerald-500/20'
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-cyan-500 animate-spin shadow-lg shadow-cyan-500/20" />
        <p className="text-cyan-500 font-mono text-xs uppercase tracking-[0.3em] font-black animate-pulse">Syncing Protocols...</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]" />
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-[var(--color-text-light)] opacity-60">Terminal / Mainframe</span>
            </div>
            <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">Command Centre</h1>
          </div>
          <div className="flex items-center space-x-2 text-[var(--color-text-light)] opacity-40 text-xs font-mono">
            <Clock className="w-4 h-4" />
            <span>LAST_SYNC: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`hero-glass-card p-6 group transition-all hover:translate-y-[-4px] hover:bg-white/10 ${stat.glow}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-[var(--color-text-light)] opacity-20 uppercase tracking-widest">0{index + 1}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-light)] opacity-60 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
                  <p className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid: Docs & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Documentation & Guide */}
          <div className="lg:col-span-2 space-y-6">
            <div className="hero-glass-card p-8 border-l-4 border-l-cyan-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">Operation Manual</h2>
                </div>
                <Link to="/app/documentation" className="text-xs font-bold text-cyan-500 hover:text-cyan-400 flex items-center space-x-1 uppercase tracking-widest">
                  <span>Full Docs</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white/80 uppercase tracking-wider flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>Quick Deployment</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      { s: 'Initialize Project', d: 'Create secure container in Projects' },
                      { s: 'Define Secrets', d: 'Add sensitive variables in Secrets' },
                      { s: 'Inject Runtime', d: 'Use CLI for zero-disk memory injection' }
                    ].map((step, i) => (
                      <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-cyan-500 font-mono text-xs font-bold mt-0.5">{i+1}.</span>
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text-primary)]">{step.s}</p>
                          <p className="text-[10px] text-[var(--color-text-light)] opacity-60">{step.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white/80 uppercase tracking-wider flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Industrial Security</span>
                  </h3>
                  <div className="space-y-2">
                    {['AES-256-GCM Encryption', 'Zero-Trust Architecture', 'Real-time Audit Trails', 'Memory-only Decryption'].map((f, i) => (
                      <div key={i} className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-bold text-white/70">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/app/projects" className="hero-glass-card p-6 flex items-center justify-between group overflow-hidden">
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[var(--color-text-primary)] font-bold">Secure Projects</h4>
                    <p className="text-[10px] text-[var(--color-text-light)] opacity-60 uppercase tracking-widest font-black">Access Vaults</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--color-text-light)] opacity-20 group-hover:text-cyan-400 transition-all group-hover:translate-x-1" />
              </Link>

              <Link to="/app/cli-commands" className="hero-glass-card p-6 flex items-center justify-between group overflow-hidden">
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">CLI Protocols</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Command Reference</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-purple-400 transition-all group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="space-y-6">
            <div className="hero-glass-card p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tight">Security Feed</h3>
                </div>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>

              <div className="space-y-4 flex-1">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((log, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{log.action}</span>
                        <span className="text-[9px] text-white/20 font-mono italic">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs font-bold text-white/80">{log.environment ? `Context: ${log.environment}` : 'System Protocol Execution'}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Entity: {log.role}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-30">
                    <Shield className="w-12 h-12" />
                    <p className="text-xs uppercase font-black tracking-widest text-white">No active feeds</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
