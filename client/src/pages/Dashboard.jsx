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
  BookOpen,
  Server,
  ShieldCheck,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { DashboardSkeleton } from '../components/Skeleton';

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
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      glow: 'shadow-cyan-500/10'
    },
    {
      title: 'Secrets',
      value: stats.secrets,
      icon: Key,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      glow: 'shadow-purple-500/10'
    },
    {
      title: 'Audit Logs',
      value: stats.auditLogs,
      icon: FileText,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      glow: 'shadow-red-500/10'
    },
    {
      title: 'Node Status',
      value: 'Online',
      icon: Cpu,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'shadow-emerald-500/10'
    },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="space-y-12 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_12px_rgba(6,182,212,1)]" />
              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/40">Terminal / Root_Access</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter">Command Centre</h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">cluster-v2-active</span>
             </div>
             <div className="flex items-center space-x-2 text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
               <Clock className="w-3.5 h-3.5" />
               <span>{new Date().toLocaleTimeString()}</span>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`hero-glass-card p-7 group transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 relative overflow-hidden border-white/5 ${stat.glow}`}
              >
                {/* Background Pattern */}
                <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`}>
                   <Icon className="w-32 h-32" />
                </div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className={`p-3.5 rounded-2xl ${stat.bg} border ${stat.border} ${stat.color} shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">REG_{index + 104}</span>
                     <div className="w-8 h-1 bg-white/5 rounded-full mt-1" />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1.5">{stat.title}</p>
                  <p className="text-4xl font-black text-white tracking-tighter flex items-baseline">
                    {stat.value}
                    {stat.title === 'Node Status' && <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid: Docs & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Documentation & Guide */}
          <div className="lg:col-span-2 space-y-8">
            <div className="hero-glass-card p-10 border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter leading-tight">Operation Manual</h2>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Protocol Execution Guide</p>
                  </div>
                </div>
                <Link to="/app/cli-commands" className="btn-glass px-5 py-2.5 flex items-center space-x-2 text-cyan-400 group/btn">
                  <span className="text-[10px] font-black uppercase tracking-widest">Full Protocols</span>
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-white/60 uppercase tracking-[0.2em] flex items-center space-x-3">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>Deployment Sequence</span>
                  </h3>
                  <div className="space-y-4">
                    {[
                      { s: 'Initialize Vault', d: 'Provision a secure container for your project secrets.' },
                      { s: 'Define Identity', d: 'Map your environment variables to encrypted keys.' },
                      { s: 'Inject Runtime', d: 'Execute memory-only injection via the CLI protocol.' }
                    ].map((step, i) => (
                      <div key={i} className="flex items-start space-x-4 group/step">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-cyan-500 group-hover/step:bg-cyan-500 group-hover/step:text-black transition-all">
                          0{i+1}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white/90 mb-1">{step.s}</p>
                          <p className="text-[11px] text-white/30 leading-relaxed font-medium">{step.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black text-white/60 uppercase tracking-[0.2em] flex items-center space-x-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Security Specs</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { l: 'AES-256-GCM', v: 'Standard' },
                      { l: 'Zero-Disk', v: 'Active' },
                      { l: 'Audit_Flow', v: 'Real-time' },
                      { l: 'SSL_Tunnel', v: 'Enforced' }
                    ].map((f, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-all group/item">
                        <span className="text-[11px] font-black text-white/40 group-hover/item:text-white/70 uppercase tracking-widest">{f.l}</span>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-lg">{f.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/app/secrets" className="hero-glass-card p-8 flex items-center justify-between group overflow-hidden border-white/5">
                <div className="relative z-10 flex items-center space-x-5">
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all duration-300">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white tracking-tight">Access Vaults</h4>
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black mt-1">Manage Encryption Keys</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-white/10 group-hover:text-cyan-400 transition-all group-hover:translate-x-2" />
              </Link>

              <Link to="/app/audit-logs" className="hero-glass-card p-8 flex items-center justify-between group overflow-hidden border-white/5">
                <div className="relative z-10 flex items-center space-x-5">
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-black transition-all duration-300">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white tracking-tight">Security Ledger</h4>
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black mt-1">Real-time Traffic Monitor</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-white/10 group-hover:text-red-400 transition-all group-hover:translate-x-2" />
              </Link>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="space-y-8">
            <div className="hero-glass-card p-8 border-white/5 flex flex-col h-full bg-white/[0.02]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-red-500" />
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Live Stream</h3>
                </div>
                <div className="flex items-center space-x-2">
                   <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Secured</span>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                </div>
              </div>

              <div className="space-y-5 flex-1">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((log, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group/log relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-[9px] text-white/20 font-mono italic">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs font-bold text-white/80 leading-tight">
                         {log.details || `Accessing ${log.environment || 'Global'} Environment`}
                      </p>
                      <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center space-x-1.5">
                           <UserPlus className="w-3 h-3 text-white/20" />
                           <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{log.role}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[9px] font-black text-white/20 font-mono">{log.ipAddress || '127.0.0.1'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-20">
                    <ShieldAlert className="w-16 h-16" />
                    <div>
                       <p className="text-sm uppercase font-black tracking-[0.3em] text-white">No active feeds</p>
                       <p className="text-[10px] text-white/50 mt-1">Protocol is currently idle</p>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/app/audit-logs" className="mt-8 text-center py-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-colors">View All Transmissions</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;

export default Dashboard;
