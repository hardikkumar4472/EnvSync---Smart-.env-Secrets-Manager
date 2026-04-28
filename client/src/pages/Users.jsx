import { useEffect, useState } from 'react';
import { adminAPI, projectAPI, authAPI } from '../services/api';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Shield, 
  Search, 
  Mail, 
  X, 
  Database,
  Trash2,
  Lock,
  Zap,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Clock,
  Eye,
  ChevronRight,
  Plus
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
      <div className="flex flex-col items-center justify-center h-full space-y-8 pt-40">
        <div className="relative">
           <div className="w-24 h-24 rounded-3xl border-4 border-white/5 border-t-cyan-500 animate-spin shadow-[0_0_30px_rgba(6,182,212,0.2)]" />
           <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-cyan-500 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
           <p className="text-cyan-500 font-black text-xs uppercase tracking-[0.5em] animate-pulse">Scanning Personnel Matrix</p>
           <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Decrypting Identity Shards...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-10 pb-20">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_12px_rgba(6,182,212,1)]" />
              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/40">Entities / Personnel_Data</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">Identity Management</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-purple px-8 sm:px-10 py-4 flex items-center justify-center space-x-3 shadow-xl shadow-purple-500/20 w-full lg:w-auto group overflow-hidden relative"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs">Establish New Entity</span>
          </button>
        </div>

        {/* Messaging Matrix */}
        {(error || success) && (
          <div className={`hero-glass-card p-6 flex items-center space-x-5 animate-in slide-in-from-top-4 duration-300 ${error ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${error ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
               {error ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
               <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${error ? 'text-red-500' : 'text-emerald-500'}`}>
                 {error ? 'Protocol_Failure' : 'System_Acknowledgement'}
               </p>
               <p className={`text-sm font-bold ${error ? 'text-red-200' : 'text-emerald-200'}`}>{error || success}</p>
            </div>
            <button onClick={() => { setError(''); setSuccess(''); }} className="ml-auto text-white/10 hover:text-white transition-colors">
               <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Search & Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           <div className="lg:col-span-3 relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                 <Search className="w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Scan identities by protocol identifier or role authority..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all outline-none text-lg tracking-tight placeholder:text-white/10 shadow-inner"
              />
           </div>
           <div className="hero-glass-card p-4 flex items-center justify-between border-white/5 bg-white/[0.01]">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total_Entities</span>
                 <span className="text-3xl font-black text-white leading-none mt-1">{users.length}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                 <Activity className="w-6 h-6 text-cyan-400 opacity-50" />
              </div>
           </div>
        </div>

        {/* Users Matrix Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredUsers.map((user) => (
            <div key={user._id} className="hero-glass-card p-8 flex flex-col md:flex-row gap-8 hover:bg-white/[0.08] transition-all duration-500 group relative overflow-hidden border-white/5 shadow-2xl shadow-black/50">
              {/* Profile / Authority Indicator */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-500 relative">
                  <Shield className={`w-10 h-10 ${user.role === 'admin' ? 'text-red-500' : 'text-cyan-400'} group-hover:text-black transition-colors`} />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-black ${user.role === 'admin' ? 'bg-red-500' : 'bg-cyan-500'}`}>
                     <Zap className="w-3 h-3 text-black" />
                  </div>
                </div>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${user.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                  {user.role} Authority
                </div>
              </div>

              {/* Identity Details Shard */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tighter truncate max-w-[320px]">{user.email}</h3>
                  <div className="flex items-center space-x-3 mt-1.5">
                     <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Identity_Shard:</span>
                     <code className="text-[10px] font-mono text-cyan-500/60 uppercase">{user._id.slice(-8)}</code>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                       <Lock className="w-3.5 h-3.5 text-white/20" />
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Authorized Vault Access</span>
                    </div>
                    <button 
                      onClick={() => { setSelectedUser(user); setShowAssignModal(true); }}
                      className="group/btn p-2 px-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-white/10 transition-all uppercase tracking-[0.1em] flex items-center space-x-2"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Grant Access</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {user.assignedProjects?.length > 0 ? (
                      user.assignedProjects.map(proj => (
                        <div key={proj._id} className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 group/proj hover:bg-cyan-500/10 transition-colors">
                          <Database className="w-3.5 h-3.5" />
                          <span className="text-xs font-black tracking-tight">{proj.name}</span>
                          <button 
                            onClick={() => handleUnassignProject(user._id, proj._id)}
                            className="p-1 rounded-lg hover:bg-red-500 hover:text-black text-white/10 transition-all ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5 w-full">
                         <ShieldAlert className="w-4 h-4 text-white/10" />
                         <p className="text-[10px] font-black text-white/20 italic uppercase tracking-widest leading-none mt-0.5">Isolated_Entity: No active vault permissions</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Personnel Operations */}
              <div className="flex flex-col justify-between items-end text-right md:border-l border-white/5 md:pl-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] leading-none">Security_Status</p>
                  <div className="flex items-center justify-end space-x-2.5 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    <span className="text-[10px] font-black tracking-[0.2em]">SYNCHRONIZED</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-4">
                  <div className="flex items-center space-x-2 text-white/20 font-mono text-[10px]">
                     <Clock className="w-3.5 h-3.5" />
                     <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteUser(user)}
                    className="group/del w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-all flex items-center justify-center"
                    title="Purge Entity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODALS */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowCreateModal(false)} />
            <div className="hero-glass-card max-w-xl w-full p-10 relative z-10 animate-in zoom-in-95 duration-300 border-white/10 shadow-[0_0_100px_rgba(168,85,247,0.1)]">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <UserPlus className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter leading-none">Entity Provisioning</h2>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mt-3">Establish Authorized Personnel Shard</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all">
                   <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Transmission Alias</label>
                  <div className="relative">
                     <input
                       type="email"
                       required
                       value={createFormData.email}
                       onChange={(e) => setCreateFormData({...createFormData, email: e.target.value})}
                       className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none font-bold text-lg"
                       placeholder="entity@envsync.io"
                     />
                     <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Primary Access Token</label>
                  <div className="relative">
                     <input
                       type="password"
                       required
                       value={createFormData.password}
                       onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
                       className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none font-mono"
                       placeholder="••••••••••••"
                     />
                     <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Authority Level</label>
                  <div className="grid grid-cols-2 gap-4">
                     {['developer', 'viewer'].map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setCreateFormData({...createFormData, role})}
                          className={`py-5 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-2 group/role ${
                            createFormData.role === role 
                            ? 'bg-purple-500 text-black border-purple-500 shadow-xl shadow-purple-500/20' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                          }`}
                        >
                           {role === 'developer' ? <Cpu className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                           <span className="text-[10px] font-black uppercase tracking-[0.2em]">{role} Shard</span>
                        </button>
                     ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-purple py-6 font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-purple-500/20 mt-4 group"
                >
                  <div className="flex items-center justify-center space-x-3">
                     {submitting ? (
                        <>
                           <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                           <span>Provisioning...</span>
                        </>
                     ) : (
                        <>
                           <span>Execute Provisioning</span>
                           <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                     )}
                  </div>
                </button>
              </form>
            </div>
          </div>
        )}

        {showAssignModal && selectedUser && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowAssignModal(false)} />
            <div className="hero-glass-card max-w-xl w-full p-10 relative z-10 animate-in zoom-in-95 duration-300 border-white/10 shadow-[0_0_100px_rgba(6,182,212,0.1)]">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Database className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter leading-none">Access Grant</h2>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mt-3">Vault Permission Initialization</p>
                  </div>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all">
                   <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-10 p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1.5">Target Entity</p>
                   <p className="text-xl font-black text-cyan-400 tracking-tight leading-none">{selectedUser.email}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                   <UserPlus className="w-6 h-6 text-cyan-400" />
                </div>
              </div>

              <form onSubmit={handleAssignProject} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Available Security Vaults</label>
                  <div className="relative group">
                    <select
                      required
                      value={assignProjectId}
                      onChange={(e) => setAssignProjectId(e.target.value)}
                      className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-cyan-500/50 outline-none appearance-none transition-all pr-14 text-lg"
                    >
                      <option value="" className="bg-[#0A0A0A]">Select Target Vault...</option>
                      {projects
                        .filter(p => !selectedUser.assignedProjects.some(ap => ap._id === p._id))
                        .map(p => (
                          <option key={p._id} value={p._id} className="bg-[#0A0A0A]">{p.name}</option>
                        ))
                      }
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 pointer-events-none rotate-90" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !assignProjectId}
                  className="w-full btn-purple py-6 font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-purple-500/20 mt-4 group"
                >
                   <div className="flex items-center justify-center space-x-3">
                     {submitting ? (
                        <>
                           <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                           <span>Granting Access...</span>
                        </>
                     ) : (
                        <>
                           <span>Execute Grant</span>
                           <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                     )}
                  </div>
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
