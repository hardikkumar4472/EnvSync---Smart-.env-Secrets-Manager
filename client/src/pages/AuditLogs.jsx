import { useEffect, useState } from 'react';
import { auditAPI } from '../services/api';
import { 
  FileText, Shield, Activity, RefreshCw, Search, Clock, Globe, 
  Terminal, ShieldAlert, ShieldCheck, Database, User, Cpu, Zap
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { TableSkeleton } from '../components/Skeleton';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditAPI.list();
      const logsArray = Array.isArray(response.logs) ? response.logs : [];
      setLogs(logsArray.filter(log => log && typeof log === 'object'));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.action === filter;
    const matchesSearch = log.action?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         log.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const actionConfigs = {
    LOGIN: { color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5', icon: Zap },
    SECRET_CREATE: { color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/5', icon: Database },
    SECRET_VIEW: { color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5', icon: ShieldCheck },
    SECRET_RUNTIME_ACCESS: { color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', icon: Cpu },
    PROJECT_CREATE: { color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5', icon: Activity },
    SECRET_DELETE: { color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/5', icon: ShieldAlert },
    SECRET_LEAK_PREVENTED: { color: 'text-red-500', border: 'border-red-600/50', bg: 'bg-red-600/10', icon: ShieldAlert, pulse: true }
  };

  const uniqueActions = [...new Set(logs.map((log) => log.action).filter(Boolean))];

  if (loading) {
    return <TableSkeleton rows={8} />;
  }

  return (
    <PageTransition>
      <div className="space-y-10 pb-20">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,1)]" />
              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/40">Compliance / Activity_Log</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">Security Ledger</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
             <div className="relative group w-full lg:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Scan events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white focus:border-red-500/50 outline-none transition-all placeholder:text-white/10"
                />
             </div>
             <button
               onClick={fetchLogs}
               className="btn-glass px-6 py-3.5 flex items-center justify-center space-x-3 text-white/60 hover:text-white transition-all group w-full sm:w-auto"
             >
               <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
               <span className="text-[10px] uppercase font-black tracking-[0.2em]">Resync Ledger</span>
             </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="hero-glass-card p-8 border-white/5 relative overflow-hidden bg-white/[0.01]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/[0.02] blur-[60px] pointer-events-none" />
          <div className="flex items-center space-x-3 mb-6">
            <Terminal className="w-4 h-4 text-red-500" />
            <span className="text-[10px] uppercase font-black text-white/40 tracking-[0.3em]">Protocol Selection Matrix</span>
          </div>
          <div className="flex items-center space-x-3 flex-wrap gap-y-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] transition-all relative overflow-hidden group/btn ${
                filter === 'all' 
                ? 'bg-white/10 text-white shadow-xl' 
                : 'text-white/20 hover:text-white/40 hover:bg-white/[0.02]'
              }`}
            >
              {filter === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500" />}
              All Streams ({logs.length})
            </button>
            {uniqueActions.map((action) => (
              <button
                key={action}
                onClick={() => setFilter(action)}
                className={`px-6 py-3 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] transition-all relative overflow-hidden group/btn ${
                  filter === action 
                  ? 'bg-white/10 text-white shadow-xl' 
                  : 'text-white/20 hover:text-white/40 hover:bg-white/[0.02]'
                }`}
              >
                {filter === action && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500" />}
                {action ? action.replace(/_/g, ' ') : 'Unknown'}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Stream */}
        {filteredLogs.length === 0 ? (
          <div className="hero-glass-card py-40 text-center flex flex-col items-center justify-center space-y-8 border-dashed border-white/5 bg-white/[0.01]">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
              <FileText className="w-10 h-10 text-white/10" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Ledger_Zero_State</h3>
               <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] mt-3">No matching records found in protocol memory</p>
            </div>
          </div>
        ) : (
          <div className="hero-glass-card border-white/5 overflow-hidden shadow-2xl shadow-black/50">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10">
                    <th className="px-10 py-6 text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Action Matrix</th>
                    <th className="px-10 py-6 text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Personnel Identity</th>
                    <th className="px-10 py-6 text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Context_Env</th>
                    <th className="px-10 py-6 text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Source_IP</th>
                    <th className="px-10 py-6 text-[10px] uppercase font-black tracking-[0.3em] text-white/40 text-right">Sequence_Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLogs.map((log, index) => {
                    const config = actionConfigs[log.action] || { color: 'text-white/40', border: 'border-white/10', bg: 'bg-white/5', icon: Terminal };
                    const Icon = config.icon;
                    return (
                      <tr 
                        key={index}
                        className="group hover:bg-white/[0.05] transition-all duration-300"
                      >
                        <td className="px-10 py-7">
                          <div className="flex flex-col space-y-2.5">
                            <div className={`inline-flex items-center space-x-3 px-4 py-2 rounded-xl border ${config.bg} ${config.border} ${config.color} ${config.pulse ? 'animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}>
                              <Icon className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                {log.action ? log.action.replace(/_/g, ' ') : 'Unknown'}
                              </span>
                            </div>
                            {log.details && (
                              <div className="flex items-center space-x-2 pl-2">
                                 <div className="w-4 h-px bg-white/10" />
                                 <span className="text-[10px] text-white/40 font-mono tracking-tight group-hover:text-white/60 transition-colors">
                                   {log.details}
                                 </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:bg-white/10`}>
                               <User className={`w-5 h-5 ${log.userId?.role === 'admin' ? 'text-red-500' : 'text-cyan-500'}`} />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                 {log.userId?.name || 'Unknown User'}
                               </span>
                               {log.userId?.email && (
                                 <span className="text-[10px] text-white/20 font-mono lowercase mt-0.5">
                                   {log.userId.email}
                                 </span>
                               )}
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          {log.environment ? (
                            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                               <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                               <span>{log.environment}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Global_Root</span>
                          )}
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex items-center space-x-3 text-white/20 font-mono text-xs">
                            <Globe className="w-3.5 h-3.5 text-white/10" />
                            <span className="group-hover:text-white/40 transition-colors">{log.ipAddress || '127.0.0.1'}</span>
                          </div>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <div className="flex flex-col items-end space-y-1">
                            <div className="flex items-center space-x-2 text-white/60">
                               <Clock className="w-3.5 h-3.5 text-white/20" />
                               <span className="text-xs font-black uppercase tracking-tight">{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <span className="text-[10px] font-black text-white/20 tracking-widest font-mono">{log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AuditLogs;
