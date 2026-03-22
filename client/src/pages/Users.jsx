import { useEffect, useState } from 'react';
import { adminAPI, projectAPI, authAPI } from '../services/api';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Shield, 
  Search, 
  MoreVertical, 
  Mail, 
  Briefcase, 
  Plus, 
  X, 
  Check, 
  AlertCircle,
  ChevronRight,
  Database,
  Trash2
} from 'lucide-react';
import PageTransition from '../components/PageTransition';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    role: 'developer'
  });
  
  const [assignProjectId, setAssignProjectId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        adminAPI.listUsers(),
        projectAPI.list()
      ]);
      setUsers(usersRes.users || []);
      setProjects(projectsRes.projects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load system entities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await authAPI.adminCreateUser(
        createFormData.email, 
        createFormData.password, 
        createFormData.role
      );
      setSuccess('Entity established and transmission sent');
      setShowCreateModal(false);
      setCreateFormData({ email: '', password: '', role: 'developer' });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Protocol failure during creation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignProject = async (e) => {
    e.preventDefault();
    if (!assignProjectId) return;
    
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await adminAPI.assignProject(selectedUser._id, assignProjectId);
      setSuccess('Vault access granted to entity');
      setShowAssignModal(false);
      setAssignProjectId('');
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Access grant failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignProject = async (userId, projectId) => {
    if (!window.confirm('Terminate vault access for this entity?')) return;
    
    setError('');
    setSuccess('');
    
    try {
      await adminAPI.unassignProject(userId, projectId);
      setSuccess('Access revoked');
      fetchData();
    } catch (error) {
      setError('Revocation failed');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently de-provision entity: ${user.email}?\nThis action is irreversible.`)) return;
    
    setError('');
    setSuccess('');
    
    try {
      await adminAPI.deleteUser(user._id);
      setSuccess('Entity purged from system');
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Purge protocol failure');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-cyan-500 animate-spin shadow-lg shadow-cyan-500/20" />
        <p className="text-cyan-500 font-mono text-xs uppercase tracking-[0.3em] font-black animate-pulse">Scanning Personnel...</p>
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
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]" />
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Entities / Personnel</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Identity Management</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-purple px-8 py-4 flex items-center justify-center space-x-3 shadow-lg shadow-purple-500/20 w-full md:w-auto"
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-bold tracking-tight">Establish New Entity</span>
          </button>
        </div>

        {/* Messaging */}
        {error && (
          <div className="hero-glass-card border-red-500/30 p-4 bg-red-500/5 flex items-center space-x-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-bold text-red-200">{error}</p>
          </div>
        )}
        {success && (
          <div className="hero-glass-card border-emerald-500/30 p-4 bg-emerald-500/5 flex items-center space-x-3">
            <Check className="w-5 h-5 text-emerald-500" />
            <p className="text-sm font-bold text-emerald-200">{success}</p>
          </div>
        )}

        {/* Search & Filter */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by protocol identifier or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none"
          />
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredUsers.map((user) => (
            <div key={user._id} className="hero-glass-card p-6 flex flex-col md:flex-row gap-6 hover:bg-white/10 transition-all group relative overflow-hidden">
              {/* Profile / Basic Info */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all">
                  <Shield className={`w-8 h-8 ${user.role === 'admin' ? 'text-red-400' : 'text-cyan-400'}`} />
                </div>
                <span className={`text-[10px] font-black p-1 px-2 rounded-md uppercase tracking-widest ${user.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                  {user.role}
                </span>
              </div>

              {/* Identity Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white truncate max-w-[250px]">{user.email}</h3>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest font-black">ENTITY_ID: {user._id.slice(-8)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Authorized Vaults</span>
                    <button 
                      onClick={() => { setSelectedUser(user); setShowAssignModal(true); }}
                      className="p-1 px-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-white/50 hover:text-white hover:bg-white/10 transition-all uppercase tracking-tighter"
                    >
                      Grant Access
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.assignedProjects?.length > 0 ? (
                      user.assignedProjects.map(proj => (
                        <div key={proj._id} className="flex items-center space-x-2 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group/proj">
                          <span className="text-[10px] font-bold">{proj.name}</span>
                          <button 
                            onClick={() => handleUnassignProject(user._id, proj._id)}
                            className="p-0.5 rounded hover:bg-red-500/20 text-white/20 hover:text-red-500 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] font-bold text-white/20 italic uppercase">Zero vaults assigned</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta information */}
              <div className="flex flex-col justify-between items-end text-right border-l border-white/5 pl-6">
                <div className="space-y-1">
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">Status</p>
                 <span className="text-[10px] font-bold text-emerald-400 flex items-center justify-end space-x-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span>ACTIVE</span>
                 </span>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <p className="text-[10px] font-mono text-white/20">EST: {new Date(user.createdAt).toLocaleDateString()}</p>
                  <button 
                    onClick={() => handleDeleteUser(user)}
                    className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center space-x-1.5 group/del"
                    title="Purge Entity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-tighter hidden group-hover/del:block">Purge Entity</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CREATE USER MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
            <div className="hero-glass-card max-w-lg w-full p-10 relative z-10 scale-in border-cyan-500/30">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-3">
                  <UserPlus className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-black text-white tracking-tight">Identity Provisioning</h2>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-white/30 hover:text-white"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Transmission Address</label>
                  <input
                    type="email"
                    required
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({...createFormData, email: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Initial Security Key</label>
                  <input
                    type="password"
                    required
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Entity Authority</label>
                  <select
                    value={createFormData.role}
                    onChange={(e) => setCreateFormData({...createFormData, role: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none appearance-none"
                  >
                    <option value="developer" className="bg-gray-900">Developer Entity</option>
                    <option value="viewer" className="bg-gray-900">Viewer Only</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-purple py-4 font-bold tracking-tight shadow-lg shadow-purple-500/20 mt-4"
                >
                  {submitting ? 'Encrypting & Sending...' : 'Provision Entity'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ASSIGN PROJECT MODAL */}
        {showAssignModal && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAssignModal(false)} />
            <div className="hero-glass-card max-w-lg w-full p-10 relative z-10 scale-in border-cyan-500/30">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-3">
                  <Database className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-black text-white tracking-tight">Access Grant</h2>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="text-white/30 hover:text-white"><X className="w-6 h-6" /></button>
              </div>

              <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs font-bold text-white/60 mb-1 uppercase tracking-widest">Target Entity</p>
                <p className="text-lg font-black text-cyan-400">{selectedUser.email}</p>
              </div>

              <form onSubmit={handleAssignProject} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Available Vaults</label>
                  <select
                    required
                    value={assignProjectId}
                    onChange={(e) => setAssignProjectId(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none appearance-none"
                  >
                    <option value="" className="bg-gray-900">Select a vault...</option>
                    {projects
                      .filter(p => !selectedUser.assignedProjects.some(ap => ap._id === p._id))
                      .map(p => (
                        <option key={p._id} value={p._id} className="bg-gray-900">{p.name}</option>
                      ))
                    }
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !assignProjectId}
                  className="w-full btn-purple py-4 font-bold tracking-tight shadow-lg shadow-purple-500/20 mt-4"
                >
                  {submitting ? 'Applying GPO...' : 'Authorize Vault Access'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
};

export default Users;
