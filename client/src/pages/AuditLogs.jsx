import { useEffect, useState } from 'react';
import { auditAPI } from '../services/api';
import { FileText, Shield, Calendar, Filter, RefreshCw } from 'lucide-react';

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
      // Ensure we have an array and filter out any invalid entries
      const logsArray = Array.isArray(response.logs) ? response.logs : [];
      setLogs(logsArray.filter(log => log && typeof log === 'object'));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs =
    filter === 'all'
      ? logs
      : logs.filter((log) => log.action === filter);

  const actionColors = {
    LOGIN: { bg: 'rgba(59, 151, 151, 0.1)', text: '#3B9797' },
    SECRET_CREATE: { bg: 'rgba(22, 71, 106, 0.1)', text: '#16476A' },
    SECRET_VIEW: { bg: 'rgba(191, 9, 47, 0.1)', text: '#BF092F' },
    RUNTIME_SECRET_ACCESS: { bg: 'rgba(59, 151, 151, 0.1)', text: '#3B9797' },
    PROJECT_CREATE: { bg: 'rgba(22, 71, 106, 0.1)', text: '#16476A' },
  };

  const uniqueActions = [...new Set(logs.map((log) => log.action).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#BF092F'}}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{color: '#132440'}}>
            Audit Logs
          </h1>
          <p style={{color: '#718096'}}>
            Complete activity trail for compliance and security
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all"
          style={{backgroundColor: 'var(--color-bg-light)', color: '#4A5568'}}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E2E8F0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F8F9FA';
          }}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl shadow-md border p-4" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: filter === 'all' ? '#3B9797' : '#F8F9FA',
              color: filter === 'all' ? '#FFFFFF' : '#4A5568'
            }}
            onMouseEnter={(e) => {
              if (filter !== 'all') {
                e.currentTarget.style.backgroundColor = '#E2E8F0';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== 'all') {
                e.currentTarget.style.backgroundColor = '#F8F9FA';
              }
            }}
          >
            All ({logs.length})
          </button>
          {uniqueActions.map((action) => (
            <button
              key={action}
              onClick={() => setFilter(action)}
              className="px-4 py-2 rounded-lg font-medium capitalize transition-all"
              style={{
                backgroundColor: filter === action ? '#3B9797' : '#F8F9FA',
                color: filter === action ? '#FFFFFF' : '#4A5568'
              }}
              onMouseEnter={(e) => {
                if (filter !== action) {
                  e.currentTarget.style.backgroundColor = '#E2E8F0';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== action) {
                  e.currentTarget.style.backgroundColor = '#F8F9FA';
                }
              }}
            >
              {action ? action.replace(/_/g, ' ') : 'Unknown'} (
              {logs.filter((log) => log.action === action).length})
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="rounded-xl shadow-md border p-12 text-center" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
          <FileText className="w-16 h-16 mx-auto mb-4" style={{color: '#718096'}} />
          <h3 className="text-lg font-semibold mb-2" style={{color: '#132440'}}>
            No audit logs found
          </h3>
          <p style={{color: '#718096'}}>
            {filter === 'all'
              ? 'Activity logs will appear here'
              : `No logs found for ${filter ? filter.replace(/_/g, ' ') : 'selected filter'}`}
          </p>
        </div>
      ) : (
        <div className="rounded-xl shadow-md border overflow-hidden" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{backgroundColor: 'var(--color-bg-light)', borderBottom: '1px solid #E2E8F0'}}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: '#718096'}}>
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: '#718096'}}>
                    User Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: '#718096'}}>
                    Environment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: '#718096'}}>
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: '#718096'}}>
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody style={{backgroundColor: 'var(--color-bg-card)'}}>
                {filteredLogs.map((log, index) => (
                  <tr 
                    key={index} 
                    className="transition-colors"
                    style={{borderBottom: '1px solid #E2E8F0'}}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: actionColors[log.action]?.bg || 'rgba(113, 128, 150, 0.1)',
                          color: actionColors[log.action]?.text || '#718096'
                        }}
                      >
                        {log.action ? log.action.replace(/_/g, ' ') : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded capitalize" style={{backgroundColor: 'rgba(59, 151, 151, 0.1)', color: '#3B9797'}}>
                        {log.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.environment ? (
                        <span className="px-2 py-1 text-xs font-medium rounded capitalize" style={{backgroundColor: 'var(--color-bg-light)', color: '#4A5568'}}>
                          {log.environment}
                        </span>
                      ) : (
                        <span style={{color: '#A0AEC0'}}>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono" style={{color: '#718096'}}>
                      {log.ipAddress || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: '#718096'}}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
