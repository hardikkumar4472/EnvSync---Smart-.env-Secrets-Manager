import { useEffect, useState, useRef } from 'react';
import { projectAPI, secretAPI } from '../services/api';
import { 
  Plus, Key, Eye, Copy, Search, Upload, CheckCircle, AlertCircle, FileUp, X, Edit2, 
  Trash2, Database, Shield, ChevronRight, Terminal, Clock, Lock, ShieldCheck, ShieldAlert,
  Activity, Info, Cpu, Hash
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';
import { TableSkeleton } from '../components/Skeleton';

const Secrets = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [secrets, setSecrets] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('dev');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '',
    environment: 'dev',
    key: '',
    value: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [secretValue, setSecretValue] = useState('');
  const [loadingValue, setLoadingValue] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkEnvContent, setBulkEnvContent] = useState('');
  const [parsedSecrets, setParsedSecrets] = useState([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [importMode, setImportMode] = useState('paste');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject && selectedEnv) {
      fetchSecrets();
    } else {
      setSecrets([]);
    }
  }, [selectedProject, selectedEnv]);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.list();
      setProjects(response.projects || []);
      if (response.projects?.length > 0 && !selectedProject) {
        setSelectedProject(response.projects[0]._id);
        setFormData((prev) => ({
          ...prev,
          projectId: response.projects[0]._id,
        }));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecrets = async () => {
    if (!selectedProject || !selectedEnv) return;
    setLoading(true);
    try {
      const response = await secretAPI.list(selectedProject, selectedEnv);
      setSecrets(response.secrets || []);
    } catch (error) {
      console.error('Error fetching secrets:', error);
      setError('Failed to load secrets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await secretAPI.create(
        formData.projectId,
        formData.environment,
        formData.key,
        formData.value
      );
      setShowModal(false);
      setFormData({
        projectId: selectedProject,
        environment: selectedEnv,
        key: '',
        value: '',
      });
      fetchSecrets();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create secret');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewValue = async (secretId) => {
    setLoadingValue(true);
    try {
      const response = await secretAPI.getValue(secretId);
      setSecretValue(response.value);
      setShowValueModal(secretId);
    } catch (error) {
      setError('Failed to load secret value');
    } finally {
      setLoadingValue(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('SECURE_PAYLOAD copied to buffer');
  };

  const handleEditSecret = async (secret) => {
    try {
      const response = await secretAPI.getValue(secret._id);
      setSelectedSecret(secret);
      setFormData({
        projectId: secret.projectId,
        environment: secret.environment,
        key: secret.key,
        value: response.value,
      });
      setShowEditModal(true);
    } catch (error) {
      setError('Failed to load secret for editing');
    }
  };

  const handleUpdateSecret = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await secretAPI.update(selectedSecret._id, formData.key, formData.value);
      setShowEditModal(false);
      setSelectedSecret(null);
      setFormData({
        projectId: selectedProject,
        environment: selectedEnv,
        key: '',
        value: '',
      });
      fetchSecrets();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update secret');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSecret = async () => {
    setError('');
    setSubmitting(true);

    try {
      await secretAPI.delete(selectedSecret._id);
      setShowDeleteModal(false);
      setSelectedSecret(null);
      fetchSecrets();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete secret');
      setSubmitting(false);
    }
  };

  const parseEnvContent = (content) => {
    const lines = content.split('\n');
    const secrets = [];
    lines.forEach((line, index) => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const match = line.match(/^([^=#\s]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (key) secrets.push({ key, value, lineNumber: index + 1 });
      }
    });
    return secrets;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.env') && !file.name.endsWith('.env.local') && !file.name.endsWith('.env.example')) {
      setError('Please upload a valid .env file');
      return;
    }
    setUploadedFileName(file.name);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setBulkEnvContent(content);
      handleBulkParse(content);
    };
    reader.readAsText(file);
  };

  const handleBulkParse = (content = null) => {
    const contentToParse = content || bulkEnvContent;
    if (!contentToParse.trim()) {
      setError('Please provide .env content');
      return;
    }
    const parsed = parseEnvContent(contentToParse);
    if (parsed.length === 0) {
      setError('No valid key-value pairs detected');
      setParsedSecrets([]);
      return;
    }
    setParsedSecrets(parsed);
    setError('');
  };

  const handleBulkSubmit = async () => {
    if (!selectedProject || parsedSecrets.length === 0) return;
    setBulkSubmitting(true);
    let successCount = 0;
    for (const secret of parsedSecrets) {
      try {
        await secretAPI.create(selectedProject, selectedEnv, secret.key, secret.value);
        successCount++;
      } catch (err) {
        console.error(`Failed: ${secret.key}`);
      }
    }
    setBulkSubmitting(false);
    setBulkSuccess(true);
    setTimeout(() => {
      setShowBulkModal(false);
      setBulkSuccess(false);
      fetchSecrets();
      setParsedSecrets([]);
      setBulkEnvContent('');
    }, 1500);
  };

  const filteredSecrets = secrets.filter(s => 
    s.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const environments = ['dev', 'staging', 'prod'];

  if (loading && projects.length === 0) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <PageTransition>
      <div className="space-y-10 pb-20">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_12px_rgba(6,182,212,1)]" />
              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/40">Secrets / Identity_Vault</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">Identity Secrets</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative group w-full lg:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-white/10"
                />
            </div>
            {isAdmin && (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => { setShowBulkModal(true); setImportMode('upload'); }}
                  className="btn-glass px-6 py-4 text-cyan-400 flex items-center justify-center space-x-3 group relative overflow-hidden"
                >
                  <FileUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-[10px] uppercase font-black tracking-[0.2em]">Bulk Import</span>
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-purple px-8 sm:px-10 py-4 flex items-center justify-center space-x-3 shadow-xl shadow-purple-500/20 group w-full sm:w-auto"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">New Secret</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 hero-glass-card p-8 border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.03] blur-[60px] pointer-events-none" />
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center space-x-2 ml-1">
                    <Database className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Target Project Vault</span>
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-6 py-4.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-cyan-500/50 outline-none appearance-none cursor-pointer transition-all pr-12 text-lg tracking-tight"
                    >
                      <option value="" disabled className="bg-[#0A0A0A]">Select Vault...</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id} className="bg-[#0A0A0A]">
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 pointer-events-none rotate-90" />
                  </div>
                </div>

                <div className="w-px h-16 bg-white/5 hidden md:block" />

                <div className="flex-1 space-y-4">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center space-x-2 ml-1">
                     <Terminal className="w-3.5 h-3.5 text-purple-500" />
                     <span>Protocol Environment</span>
                   </label>
                   <div className="flex p-1.5 rounded-2xl bg-black/40 border border-white/10">
                    {environments.map((env) => (
                      <button
                        key={env}
                        onClick={() => setSelectedEnv(env)}
                        className={`flex-1 py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative overflow-hidden group/btn ${
                          selectedEnv === env 
                          ? 'bg-white/10 text-white shadow-xl' 
                          : 'text-white/30 hover:text-white/60'
                        }`}
                      >
                        {selectedEnv === env && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500" />}
                        {env}
                      </button>
                    ))}
                  </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-4 hero-glass-card p-8 border-white/5 flex flex-col justify-center bg-white/[0.01]">
             <div className="flex items-center space-x-4 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Status</p>
                   <p className="text-sm font-black text-white tracking-tight uppercase">Encryption_Verified</p>
                </div>
             </div>
             <p className="text-[10px] text-white/20 font-medium leading-relaxed">
                All transmissions are secured via AES-256-GCM. Decryption logs are recorded in the security ledger.
             </p>
          </div>
        </div>

        {/* Main Content Matrix */}
        <div className="hero-glass-card border-white/5 overflow-hidden pb-4 shadow-2xl shadow-black/50">
           {!selectedProject ? (
              <div className="py-40 text-center flex flex-col items-center justify-center space-y-6">
                 <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                    <Shield className="w-10 h-10 text-white/10" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white/40 tracking-tighter uppercase">Awaiting Vault Connection</h3>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] mt-2">Select a project container to proceed</p>
                 </div>
              </div>
           ) : loading ? (
              <div className="p-8">
                 <TableSkeleton rows={6} />
              </div>
           ) : filteredSecrets.length === 0 ? (
              <div className="py-40 text-center flex flex-col items-center justify-center space-y-8 border-dashed border-white/5 m-8 rounded-3xl border-2">
                 <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-white/10" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tighter">Identity_Buffer_Empty</h3>
                    <p className="text-white/30 max-w-sm mx-auto text-xs font-medium leading-relaxed">
                       No secrets identified in the {selectedEnv} environment for this node. Initialize a new identity sequence.
                    </p>
                 </div>
                 {isAdmin && <button onClick={() => setShowModal(true)} className="btn-glass px-12 py-4 text-cyan-400 font-black uppercase tracking-[0.2em] text-[10px]">Initialize Identity</button>}
              </div>
           ) : (
              <div className="overflow-x-auto custom-scrollbar">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-white/[0.03] border-b border-white/10">
                       <th className="px-10 py-6 text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Identifier Key</th>
                       <th className="px-10 py-6 text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Methodology</th>
                       <th className="px-10 py-6 text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Provisioned</th>
                       <th className="px-10 py-6 text-[10px] uppercase font-black tracking-[0.3em] text-white/40 text-right">Directives</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {filteredSecrets.map((secret, idx) => (
                       <tr key={secret._id} className="group hover:bg-white/[0.05] transition-all duration-300">
                         <td className="px-10 py-6">
                           <div className="flex items-center space-x-5">
                             <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-black group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-500">
                                <Hash className="w-5 h-5" />
                             </div>
                             <div>
                                <code className="text-lg font-black text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{secret.key}</code>
                                <div className="flex items-center space-x-2 mt-1">
                                   <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                                   <span className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono truncate max-w-[120px]">REF_{secret._id.slice(-8)}</span>
                                </div>
                             </div>
                           </div>
                         </td>
                         <td className="px-10 py-6">
                            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white/70 transition-colors">
                               <ShieldCheck className="w-3 h-3 text-emerald-500" />
                               <span>AES_256_GCM</span>
                            </div>
                         </td>
                         <td className="px-10 py-6">
                           <div className="flex items-center space-x-3 text-white/20 font-mono">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-black">{new Date(secret.createdAt).toLocaleDateString()}</span>
                           </div>
                         </td>
                         <td className="px-10 py-6 text-right">
                           <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                             <button 
                                onClick={() => handleViewValue(secret._id)} 
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-white/10 transition-all flex items-center justify-center" 
                                title="Decrypt Temporary"
                             >
                               <Eye className="w-4 h-4" />
                             </button>
                             {isAdmin && (
                               <>
                                 <button 
                                    onClick={() => handleEditSecret(secret)} 
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all flex items-center justify-center" 
                                    title="Modify Identity"
                                 >
                                   <Edit2 className="w-4 h-4" />
                                 </button>
                                 <button 
                                    onClick={() => { setSelectedSecret(secret); setShowDeleteModal(true); }} 
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-all flex items-center justify-center" 
                                    title="Purge Identity"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                               </>
                             )}
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
           )}
        </div>

        {/* Operation Modals - Standardized Premium Style */}
        {(showModal || showEditModal) && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => { setShowModal(false); setShowEditModal(false); }} />
             <div className="hero-glass-card max-w-xl w-full p-10 relative z-10 animate-in zoom-in-95 duration-300 border-white/10 shadow-[0_0_100px_rgba(168,85,247,0.1)]">
                <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                         <Key className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                         <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{showModal ? 'Define Identity' : 'Modify Sequence'}</h2>
                         <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mt-2">Initialize Security Environment</p>
                      </div>
                   </div>
                   <button onClick={() => { setShowModal(false); setShowEditModal(false); }} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <form onSubmit={showModal ? handleSubmit : handleUpdateSecret} className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Identity Key</label>
                      <div className="relative">
                         <input
                           type="text"
                           value={formData.key}
                           onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                           required
                           className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none font-black text-lg font-mono uppercase tracking-tight"
                           placeholder="DB_MAINFRAME_PWD"
                         />
                         <Cpu className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 pointer-events-none" />
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Target</label>
                        <div className="px-6 py-4.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black tracking-widest uppercase flex items-center space-x-2">
                           <Activity className="w-3 h-3" />
                           <span>{selectedEnv.toUpperCase()} Matrix</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Methodology</label>
                        <div className="px-6 py-4.5 rounded-2xl bg-white/5 border border-white/10 text-emerald-500/60 text-[10px] font-black tracking-widest uppercase flex items-center space-x-2">
                           <ShieldCheck className="w-3 h-3" />
                           <span>AES_256_GCM</span>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Sensitive Payload</label>
                      <textarea
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        required
                        rows={4}
                        className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none resize-none font-mono text-sm leading-relaxed"
                        placeholder="Paste or type secret value here..."
                      />
                   </div>

                   <button type="submit" disabled={submitting} className="btn-purple w-full py-5 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-purple-500/20">
                      {submitting ? 'Encrypting Data Stream...' : (showModal ? 'Commit Identity' : 'Update Protocol')}
                   </button>
                </form>
             </div>
          </div>
        )}

        {/* Value Display Modal - Re-engineered for Security feel */}
        {showValueModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setShowValueModal(null)} />
             <div className="hero-glass-card max-w-lg w-full p-10 relative z-10 animate-in zoom-in-95 duration-300 border-cyan-500/30 shadow-[0_0_100px_rgba(6,182,212,0.1)]">
                <div className="text-center space-y-8">
                   <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(6,182,212,0.4)]">
                      <Lock className="w-10 h-10 text-black" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Buffer_Decrypted</h2>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-3">Temporary Memory Access Verified</p>
                   </div>

                   <div className="relative group/val">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur opacity-10 group-hover/val:opacity-20 transition-opacity" />
                      <textarea
                        readOnly
                        value={secretValue}
                        rows={5}
                        className="relative w-full p-8 rounded-2xl bg-black/80 border border-white/10 text-cyan-400 font-mono text-base leading-relaxed outline-none"
                      />
                      <button 
                        onClick={() => copyToClipboard(secretValue)} 
                        className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                      >
                         <Copy className="w-4 h-4" />
                      </button>
                   </div>

                   <div className="flex items-center space-x-3 p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-[10px] font-black text-red-400 uppercase tracking-widest text-left">
                      <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                      <span>Security Protocol: Buffer will clear from local memory upon termination. Do not leave unattended.</span>
                   </div>

                   <button 
                      onClick={() => setShowValueModal(null)} 
                      className="w-full py-5 text-xs font-black uppercase tracking-[0.5em] text-white/10 hover:text-white transition-all bg-white/5 rounded-2xl border border-white/5"
                    >
                       TERMINATE_CONNECTION
                    </button>
                </div>
             </div>
          </div>
        )}

        {/* Bulk Import Modal - Data Extraction UI */}
        {showBulkModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowBulkModal(false)} />
             <div className="hero-glass-card max-w-4xl w-full p-10 relative z-10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar border-white/10">
                <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                         <Upload className="w-7 h-7 text-cyan-400" />
                      </div>
                      <div>
                         <h2 className="text-3xl font-black text-white tracking-tighter leading-none">Bulk_Injection</h2>
                         <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mt-3">Multi-Matrix Secret Extraction</p>
                      </div>
                   </div>
                   <button 
                      onClick={() => setShowBulkModal(false)} 
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all"
                   >
                      <X className="w-6 h-6" />
                   </button>
                </div>

                <div className="space-y-8">
                   <div className="flex p-2 rounded-2xl bg-black/40 border border-white/5">
                      <button 
                        onClick={() => setImportMode('upload')} 
                        className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden ${
                          importMode === 'upload' ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/60'
                        }`}
                      >
                         {importMode === 'upload' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500" />}
                         Source File (.env)
                      </button>
                      <button 
                        onClick={() => setImportMode('paste')} 
                        className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden ${
                          importMode === 'paste' ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/60'
                        }`}
                      >
                         {importMode === 'paste' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500" />}
                         Buffer Stream
                      </button>
                   </div>

                   {importMode === 'upload' ? (
                      <div className="border-3 border-dashed border-white/5 rounded-[40px] p-20 text-center hover:border-cyan-500/30 transition-all group/up cursor-pointer relative bg-white/[0.01]">
                         <input ref={fileInputRef} type="file" accept=".env,.env.local,.env.example" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                         <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6 group-hover/up:bg-cyan-500 group-hover/up:text-black transition-all duration-500">
                            <FileUp className="w-10 h-10" />
                         </div>
                         <p className="text-xl font-black text-white/80 group-hover/up:text-white transition-colors">{uploadedFileName || 'Drop .env matrix or click to scan'}</p>
                         <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-3">{uploadedFileName ? 'Payload Ready for Parsing' : 'Awaiting Metadata Stream'}</p>
                      </div>
                   ) : (
                      <div className="relative group">
                        <textarea
                          value={bulkEnvContent}
                          onChange={(e) => setBulkEnvContent(e.target.value)}
                          rows={10}
                          className="w-full p-8 rounded-3xl bg-black/60 border border-white/10 text-cyan-400 font-mono text-sm leading-relaxed outline-none focus:border-purple-500/50 transition-all"
                          placeholder="DB_URL=postgres://...&#10;JWT_SECRET=supersecret...&#10;LOG_LEVEL=debug"
                        />
                        <div className="absolute top-4 right-4 flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-black border border-white/10">
                           <Info className="w-3 h-3 text-white/40" />
                           <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Parsed Live</span>
                        </div>
                      </div>
                   )}

                   {parsedSecrets.length > 0 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                               <Cpu className="w-4 h-4 text-cyan-500" />
                               <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Extraction Preview</h4>
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                               {parsedSecrets.length} Identities Identified
                            </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-4 custom-scrollbar">
                            {parsedSecrets.map((s, i) => (
                               <div key={i} className="group/item p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/[0.08] transition-all">
                                  <div className="flex items-center space-x-3 truncate">
                                     <div className="w-2 h-2 rounded-full bg-cyan-500/40 group-hover/item:bg-cyan-500 transition-colors" />
                                     <code className="text-xs font-black text-white/80 group-hover/item:text-cyan-400 transition-colors truncate">{s.key}</code>
                                  </div>
                                  <CheckCircle className="w-4 h-4 text-emerald-500/40 group-hover/item:text-emerald-500 transition-colors" />
                               </div>
                            ))}
                         </div>
                      </div>
                   )}

                   <div className="flex items-center space-x-6 pt-10 border-t border-white/5">
                      <button 
                        onClick={() => setShowBulkModal(false)} 
                        className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-all bg-white/5 rounded-2xl border border-white/5"
                      >
                         Abort directive
                      </button>
                      <button
                        onClick={parsedSecrets.length > 0 ? handleBulkSubmit : () => handleBulkParse()}
                        disabled={bulkSubmitting || bulkSuccess}
                        className="flex-[2] btn-purple py-5 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-purple-500/20 group/btn"
                      >
                         <div className="flex items-center justify-center space-x-3">
                           {bulkSubmitting ? (
                             <>
                               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                               <span>Injecting Nodes...</span>
                             </>
                           ) : (
                             <>
                               <span>{parsedSecrets.length > 0 ? `Execute Injection` : 'Analyze Metadata'}</span>
                               <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                             </>
                           )}
                         </div>
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Delete Confirmation Modal - Atomic Destruction UI */}
        {showDeleteModal && selectedSecret && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-red-950/20 backdrop-blur-xl" onClick={() => setShowDeleteModal(false)} />
            <div className="hero-glass-card max-w-md w-full p-12 relative z-10 animate-in zoom-in-95 duration-300 border-red-500/30 shadow-[0_0_100px_rgba(239,68,68,0.1)]">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                  <Trash2 className="w-10 h-10 text-black" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter mb-4">PURGE_SEQUENCE</h2>
                <p className="text-white/50 text-sm mb-12 leading-relaxed font-medium">
                  CAUTION: You are initiating an atomic purge for <span className="text-red-400 font-mono font-black">{selectedSecret.key}</span>. All encrypted shards will be destroyed instantly.
                </p>

                <div className="flex flex-col space-y-4">
                  <button
                    onClick={handleDeleteSecret}
                    disabled={submitting}
                    className="w-full py-5 rounded-2xl bg-red-500 text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-red-400 transition-all shadow-xl shadow-red-500/20"
                  >
                    {submitting ? 'Purging Nodes...' : 'Execute Erasure'}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full py-5 text-white/30 hover:text-white text-[10px] font-black uppercase tracking-[0.5em] transition-all bg-white/5 rounded-2xl border border-white/5"
                  >
                    Abort Directive
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Secrets;
