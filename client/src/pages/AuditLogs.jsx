import { useEffect, useState } from 'react';
import { auditAPI } from '../services/api';
import { FileText, Shield, Activity, RefreshCw, ChevronRight, Search, Clock, Globe } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const filteredLogs = filter === 'all' ? logs : logs.filter((log) => log.action === filter);

  const actionGlows = {
    LOGIN: 'border-cyan-500/30 text-cyan-400',
    SECRET_CREATE: 'border-purple-500/30 text-purple-400',
    SECRET_VIEW: 'border-amber-500/30 text-amber-400',
    RUNTIME_SECRET_ACCESS: 'border-emerald-500/30 text-emerald-400',
    PROJECT_CREATE: 'border-blue-500/30 text-blue-400',
    SECRET_DELETE: 'border-red-500/30 text-red-400'
  };

  const uniqueActions = [...new Set(logs.map((log) => log.action).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-red-500 animate-spin shadow-lg shadow-red-500/20" />
        <p className="text-red-500 font-mono text-xs uppercase tracking-[0.3em] font-black animate-pulse">Decrypting Audit Trails...</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Compliance / Activity</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Security Ledger</h1>
          </div>
          <button
            onClick={fetchLogs}
            className="btn-glass px-6 py-3 flex items-center space-x-2 text-white/70 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-[10px] uppercase font-black tracking-widest">Refresh Stream</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="hero-glass-card p-6 border-white/10">
          <div className="flex items-center space-x-4 mb-4">
            <Search className="w-4 h-4 text-white/20" />
            <span className="text-[10px] uppercase font-black text-white/30 tracking-widest">Protocol Filters</span>
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all border ${
                filter === 'all' 
                ? 'bg-white/10 text-white border-white/20 shadow-lg' 
                : 'text-white/40 border-transparent hover:text-white/60'
              }`}
            >
              All Events ({logs.length})
            </button>
            {uniqueActions.map((action) => (
              <button
                key={action}
                onClick={() => setFilter(action)}
                className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all border ${
                  filter === action 
                  ? 'bg-white/10 text-white border-white/20 shadow-lg' 
                  : 'text-white/40 border-transparent hover:text-white/60'
                }`}
              >
                {action ? action.replace(/_/g, ' ') : 'Unknown'}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Stream */}
        {filteredLogs.length === 0 ? (
          <div className="hero-glass-card py-24 text-center border-dashed border-white/10">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ledger Is Clear</h3>
            <p className="text-white/40 max-w-sm mx-auto text-sm">
              No security events have been logged for the selected protocol parameters.
            </p>
          </div>
        ) : (
          <div className="hero-glass-card overflow-hidden border-white/5">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Action Matrix</th>
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Authority Role</th>
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Context/Env</th>
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Source IP</th>
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-white/40 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLogs.map((log, index) => (
                    <tr 
                      key={index}
                      className="group hover:bg-white/5 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border bg-white/5 text-[10px] font-black uppercase tracking-widest ${actionGlows[log.action] || 'border-white/10 text-white/40'}`}>
                          {log.action ? log.action.replace(/_/g, ' ') : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${log.role === 'admin' ? 'bg-red-500' : 'bg-cyan-500'}`} />
                          <span className="text-xs font-bold text-white/70 uppercase tracking-tight">{log.role}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {log.environment ? (
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 py-1 rounded bg-white/5 border border-white/5">
                            {log.environment}
                          </span>
                        ) : (
                          <span className="text-white/10 font-mono text-xs">GLOBAL_SYS</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2 text-white/30 font-mono text-xs">
                          <Globe className="w-3 h-3" />
                          <span>{log.ipAddress || '127.0.0.1'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-white/60">{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'N/A'}</span>
                          <span className="text-[10px] font-mono text-white/20">{log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
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
