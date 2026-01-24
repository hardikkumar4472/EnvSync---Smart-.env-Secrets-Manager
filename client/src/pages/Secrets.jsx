import { useEffect, useState, useRef } from 'react';
import { projectAPI, secretAPI } from '../services/api';
import { Plus, Key, Eye, Copy, Search, Upload, CheckCircle, AlertCircle, FileUp, X, Edit2, Trash2, Database, Shield, ChevronRight, Terminal, Clock, Lock } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const Secrets = () => {
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
    alert('Copied to clipboard!');
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

  const environments = ['dev', 'staging', 'prod'];

  if (loading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-purple-500 animate-spin shadow-lg shadow-purple-500/20" />
        <p className="text-purple-500 font-mono text-xs uppercase tracking-[0.3em] font-black animate-pulse">Accessing Vaults...</p>
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
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Secrets / Repository</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">Identity Secrets</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { setShowBulkModal(true); setImportMode('upload'); }}
              className="btn-glass px-4 sm:px-6 py-2.5 sm:py-3 text-cyan-400 flex items-center space-x-2 group"
            >
              <FileUp className="w-4 h-4" />
              <span className="text-[10px] uppercase font-black tracking-widest">Bulk Import</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-purple px-6 sm:px-8 py-2.5 sm:py-3 flex items-center space-x-2 shadow-lg shadow-purple-500/20"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs sm:text-base font-bold tracking-tight">New Secret</span>
            </button>
          </div>
        </div>

        {/* Global Controls Filter */}
        <div className="hero-glass-card p-6 border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 flex items-center space-x-2">
                <Database className="w-3 h-3" />
                <span>Target Project Container</span>
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-gray-900">Select Project Vault</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id} className="bg-gray-900">
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 flex items-center space-x-2">
                <Terminal className="w-3 h-3" />
                <span>Deployment Environment</span>
              </label>
              <div className="flex p-1.5 rounded-xl bg-black/40 border border-white/5">
                {environments.map((env) => (
                  <button
                    key={env}
                    onClick={() => setSelectedEnv(env)}
                    className={`flex-1 py-3 px-2 sm:px-4 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedEnv === env 
                      ? 'bg-white/10 text-white shadow-lg' 
                      : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Messaging */}
        {error && (
          <div className="hero-glass-card border-red-500/30 p-4 bg-red-500/5 flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-sm font-bold text-red-200">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-white/20 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Main Records Table */}
        {!selectedProject ? (
          <div className="hero-glass-card py-24 text-center border-dashed border-white/10">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-xl font-bold text-white/40">Awaiting Vault Selection</h3>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-24">
             <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-cyan-500 animate-spin" />
          </div>
        ) : secrets.length === 0 ? (
          <div className="hero-glass-card py-24 text-center border-dashed border-white/10">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Secrets Defined</h3>
            <p className="text-white/40 max-w-sm mx-auto mb-8 text-sm">
              This environment is currently devoid of runtime configurations. Initialize your first industrial-grade secret.
            </p>
            <button onClick={() => setShowModal(true)} className="btn-purple px-10 py-4 font-bold tracking-tight">Initialize Secret</button>
          </div>
        ) : (
          <div className="hero-glass-card overflow-hidden border-white/5 pb-10">
             <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Identifier Key</th>
                      <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Auth Method</th>
                      <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Created At</th>
                      <th className="px-8 py-5 text-[10px] uppercase font-black tracking-[0.2em] text-white/40 text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {secrets.map((secret) => (
                      <tr key={secret._id} className="group hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-white/5 text-purple-400 group-hover:bg-purple-500/10 group-hover:text-purple-300 transition-all">
                               <Key className="w-4 h-4" />
                            </div>
                            <code className="text-sm font-black text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{secret.key}</code>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-3 py-1 rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-[9px] font-black uppercase tracking-widest text-cyan-400">ENCRYPTED_MEMORY</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-2 text-white/30 text-xs">
                             <Clock className="w-3 h-3" />
                             <span className="font-bold">{new Date(secret.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end space-x-1 opacity-20 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleViewValue(secret._id)} className="p-2.5 rounded-xl bg-white/5 text-white/60 hover:text-cyan-400 hover:bg-white/10 transition-all" title="Decrypt Temporary">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEditSecret(secret)} className="p-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all" title="Modify Protocol">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setSelectedSecret(secret); setShowDeleteModal(true); }} className="p-2.5 rounded-xl bg-white/5 text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Terminate Secret">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Modals - All Decentred and High-Tech */}
        {(showModal || showEditModal) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setShowModal(false); setShowEditModal(false); }} />
             <div className="hero-glass-card max-w-lg w-full p-6 sm:p-10 relative z-10 scale-in shadow-[0_0_100px_rgba(168,85,247,0.1)]">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center space-x-3">
                      <Shield className="w-6 h-6 text-purple-400" />
                      <h2 className="text-2xl font-black text-white tracking-tight">{showModal ? 'Define New Secret' : 'Modify Encryption'}</h2>
                   </div>
                   <button onClick={() => { setShowModal(false); setShowEditModal(false); }} className="text-white/20 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <form onSubmit={showModal ? handleSubmit : handleUpdateSecret} className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Identity Key</label>
                        <input
                          type="text"
                          value={formData.key}
                          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                          required
                          className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 outline-none font-mono"
                          placeholder="E.g. MASTER_KEY_01"
                        />
                      </div>
                      {showModal && (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Environment</label>
                            <select className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none">
                                {environments.map(e => <option key={e} value={e} className="bg-gray-900">{e.toUpperCase()}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Methods</label>
                            <div className="px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black tracking-widest uppercase">AES_256_GCM</div>
                          </div>
                        </>
                      )}
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Secret Value (To Be Encrypted)</label>
                      <textarea
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        required
                        rows={4}
                        className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 outline-none resize-none font-mono"
                        placeholder="Enter sensitive payload..."
                      />
                   </div>

                   <button type="submit" disabled={submitting} className="btn-purple w-full py-5 font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-500/20 mt-4">
                      {submitting ? 'Encrypting Protocol...' : (showModal ? 'Configure Secret' : 'Deploy Modification')}
                   </button>
                </form>
             </div>
          </div>
        )}

        {/* Value Display Modal */}
        {showValueModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowValueModal(null)} />
             <div className="hero-glass-card max-w-md w-full p-8 relative z-10 scale-in border-cyan-500/30">
                <div className="text-center space-y-6">
                   <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto">
                      <Lock className="w-8 h-8 text-cyan-400" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Decrypted Buffer</h2>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Temporary Memory Access Only</p>
                   </div>

                   <div className="relative group/val">
                      <textarea
                        readOnly
                        value={secretValue}
                        rows={5}
                        className="w-full p-6 rounded-2xl bg-black/60 border border-white/10 text-cyan-400 font-mono text-sm leading-relaxed outline-none"
                      />
                      <button onClick={() => copyToClipboard(secretValue)} className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all border border-white/5">
                         <Copy className="w-4 h-4" />
                      </button>
                   </div>

                   <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-[10px] font-black text-red-400 uppercase tracking-widest">
                      ⚠️ Decrypted data detected. Purge buffer after use.
                   </div>

                   <button onClick={() => setShowValueModal(null)} className="w-full py-4 text-xs font-black uppercase tracking-[0.5em] text-white/20 hover:text-white transition-all">TERMINATE VIEW</button>
                </div>
             </div>
          </div>
        )}

        {/* Bulk Import Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowBulkModal(false)} />
             <div className="hero-glass-card max-w-3xl w-full p-6 sm:p-10 relative z-10 scale-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center space-x-3">
                      <Upload className="w-6 h-6 text-cyan-400" />
                      <h2 className="text-2xl font-black text-white tracking-tight">Bulk Extraction Protocol</h2>
                   </div>
                   <button onClick={() => setShowBulkModal(false)} className="text-white/20 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <div className="space-y-6">
                   <div className="flex space-x-2 p-1.5 rounded-xl bg-black/40 border border-white/5">
                      <button onClick={() => setImportMode('upload')} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${importMode === 'upload' ? 'bg-white/10 text-white' : 'text-white/30'}`}>Load File (.env)</button>
                      <button onClick={() => setImportMode('paste')} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${importMode === 'paste' ? 'bg-white/10 text-white' : 'text-white/30'}`}>Buffer Paste</button>
                   </div>

                   {importMode === 'upload' ? (
                      <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-cyan-500/40 transition-all group/up cursor-pointer relative">
                         <input ref={fileInputRef} type="file" accept=".env,.env.local,.env.example" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                         <FileUp className="w-12 h-12 text-white/10 mx-auto mb-4 group-hover/up:text-cyan-400 transition-colors" />
                         <p className="text-sm font-bold text-white/60">{uploadedFileName || 'Drop .env file here or click to scan'}</p>
                         <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-2">{uploadedFileName ? 'Target Loaded' : 'Awaiting Metadata'}</p>
                      </div>
                   ) : (
                      <textarea
                        value={bulkEnvContent}
                        onChange={(e) => setBulkEnvContent(e.target.value)}
                        rows={10}
                        className="w-full p-6 rounded-2xl bg-black/60 border border-white/10 text-cyan-400 font-mono text-sm leading-relaxed outline-none"
                        placeholder="KEY_01=VALUE_01&#10;KEY_02=VALUE_02"
                      />
                   )}

                   {parsedSecrets.length > 0 && (
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-white/40">Extraction Preview ({parsedSecrets.length} identified)</h4>
                            <div className="h-px flex-1 bg-white/5 mx-4" />
                         </div>
                         <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {parsedSecrets.map((s, i) => (
                               <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                                  <code className="text-[10px] font-bold text-cyan-400 truncate pr-4">{s.key}</code>
                                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                               </div>
                            ))}
                         </div>
                      </div>
                   )}

                   <div className="flex items-center space-x-4 pt-4 border-t border-white/5">
                      <button onClick={() => setShowBulkModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white">Abort</button>
                      <button
                        onClick={parsedSecrets.length > 0 ? handleBulkSubmit : () => handleBulkParse()}
                        disabled={bulkSubmitting || bulkSuccess}
                        className="flex-[2] btn-purple py-4 font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-500/20"
                      >
                        {bulkSubmitting ? 'Injecting Sequences...' : (parsedSecrets.length > 0 ? `Initialize ${parsedSecrets.length} Identities` : 'Parse Metadata')}
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedSecret && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowDeleteModal(false)} />
            <div className="hero-glass-card max-w-md w-full p-6 sm:p-10 relative z-10 scale-in border-red-500/30 shadow-red-500/10">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight mb-4">Critical Erasure</h2>
                <p className="text-white/50 text-sm mb-10 leading-relaxed">
                  You are about to purge the identity <span className="text-white font-mono font-bold">{selectedSecret.key}</span>. This deletion is atomic and irreversible.
                </p>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleDeleteSecret}
                    disabled={submitting}
                    className="w-full py-4 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest text-xs hover:bg-red-400 transition-all"
                  >
                    Confirm Termination
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full py-4 text-white/30 hover:text-white text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Cancel Directive
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
