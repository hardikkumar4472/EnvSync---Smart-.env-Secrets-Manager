import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { Plus, FolderKanban, Trash2, Calendar, Edit2, X, Shield, Database, ChevronRight, Copy, Terminal, Activity, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';
import { TableSkeleton } from '../components/Skeleton';

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.list();
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await projectAPI.create(formData.name, formData.description);
      setShowModal(false);
      setFormData({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setFormData({ name: project.name, description: project.description || '' });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await projectAPI.update(selectedProject._id, formData.name, formData.description);
      setShowEditModal(false);
      setSelectedProject(null);
      setFormData({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setSubmitting(true);

    try {
      await projectAPI.delete(selectedProject._id);
      setShowDeleteModal(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete project');
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <TableSkeleton rows={3} />;
  }

  return (
    <PageTransition>
      <div className="space-y-10 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_12px_rgba(6,182,212,1)]" />
              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/40">Vault / Storage_Matrix</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter">Secure Projects</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
             {/* Search Bar */}
             <div className="relative group w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Scan projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-white/10"
                />
             </div>
             {isAdmin && (
               <button
                 onClick={() => setShowModal(true)}
                 className="btn-purple px-8 py-4 flex items-center justify-center space-x-3 shadow-xl shadow-purple-500/20 w-full sm:w-auto group relative overflow-hidden"
               >
                 <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                 <span className="font-black uppercase tracking-widest text-xs">Initialize Vault</span>
               </button>
             )}
          </div>
        </div>

        {/* Status Messaging */}
        {error && (
          <div className="hero-glass-card border-red-500/30 p-5 bg-red-500/5 flex items-center space-x-4 animate-shake">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
               <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div>
               <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-0.5">Critical System Error</p>
               <p className="text-sm font-bold text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Content Section */}
        {filteredProjects.length === 0 ? (
          <div className="hero-glass-card py-32 text-center border-dashed border-white/10">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
              <Database className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">No Matrix Nodes Detected</h3>
            <p className="text-white/30 max-w-sm mx-auto mb-10 text-sm font-medium leading-relaxed">
              Your security environment is currently isolated. {isAdmin ? 'Initialize a new project container to begin encryption protocols.' : 'Synchronizing with administrator for vault access...'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="btn-glass px-10 py-4 text-cyan-400 group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-black uppercase tracking-widest">Start Provisioning</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, idx) => (
              <div
                key={project._id}
                className="hero-glass-card p-8 group transition-all duration-500 hover:scale-[1.03] hover:bg-white/[0.08] relative overflow-hidden border-white/5 shadow-2xl shadow-black/50"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.02] rounded-full -mr-16 -mt-16 blur-[60px]" />
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-500">
                    <FolderKanban className="w-8 h-8" />
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2.5 rounded-xl text-white hover:bg-white/10 transition-colors"
                          title="Modify Protocol"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setShowDeleteModal(true);
                          }}
                          className="p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Purge Vault"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 mb-8 relative z-10">
                  <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tighter">{project.name}</h3>
                  <div 
                    onClick={() => {
                      navigator.clipboard.writeText(project._id);
                      alert('VAULT_ID copied to clipboard');
                    }}
                    className="flex items-center space-x-3 cursor-pointer group/id w-fit"
                  >
                    <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                       <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">ID_{idx + 1}</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/20 truncate max-w-[140px] group-hover/id:text-cyan-500 transition-colors">{project._id}</span>
                    <Copy className="w-3 h-3 text-white/10 group-hover/id:text-cyan-400 opacity-0 group-hover/id:opacity-100 transition-all" />
                  </div>
                </div>

                {project.description && (
                  <p className="text-xs text-white/40 line-clamp-3 mb-10 leading-relaxed font-medium">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                  <div className="flex items-center space-x-3 text-white/20">
                    <Terminal className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                       v1.0.4-live
                    </span>
                  </div>
                  <Link 
                    to="/app/secrets" 
                    className="group/link flex items-center space-x-2 text-cyan-400"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Configure</span>
                    <div className="w-6 h-6 rounded-lg bg-cyan-400/10 flex items-center justify-center group-hover/link:bg-cyan-400 group-hover/link:text-black transition-all">
                       <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals - Refined for High-Tech feel */}
        {(showModal || showEditModal) && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => { setShowModal(false); setShowEditModal(false); }} />
            <div className="hero-glass-card max-w-xl w-full p-10 relative z-10 border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter leading-none">
                      {showModal ? 'Configure Vault' : 'Edit Protocol'}
                    </h2>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mt-2">Initialize Security Environment</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowModal(false); setShowEditModal(false); }}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={showModal ? handleSubmit : handleUpdate} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Designation</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none font-bold text-lg"
                    placeholder="E.g. Mainframe-Core"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Metadata Summary</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none resize-none font-medium"
                    placeholder="Define the operational scope of this vault..."
                  />
                </div>

                <div className="flex items-center space-x-6 pt-6">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setShowEditModal(false); }}
                    className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-white/30 hover:text-white transition-all"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] btn-purple py-5 font-black uppercase tracking-[0.2em] text-xs"
                  >
                    {submitting ? 'Encrypting...' : (showModal ? 'Commit Configuration' : 'Update Protocol')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal - High Contrast Warning */}
        {showDeleteModal && selectedProject && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-red-950/20 backdrop-blur-xl" onClick={() => setShowDeleteModal(false)} />
            <div className="hero-glass-card max-w-md w-full p-10 relative z-10 border-red-500/30 animate-in zoom-in-95 shadow-[0_0_100px_rgba(239,68,68,0.1)]">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                  <Trash2 className="w-10 h-10 text-black" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter mb-4">PURGE_VAULT</h2>
                <p className="text-white/50 text-sm mb-12 leading-relaxed font-medium">
                  CAUTION: You are initiating a purge for <span className="text-red-400 font-black">{selectedProject.name}</span>. This will destroy all associated security tokens and data streams.
                </p>

                <div className="flex flex-col space-y-4">
                  <button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="w-full py-5 rounded-2xl bg-red-500 text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-red-400 transition-all shadow-lg shadow-red-500/20"
                  >
                    {submitting ? 'Purging...' : 'Execute Purge'}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full py-5 text-white/30 hover:text-white text-xs font-black uppercase tracking-[0.2em] transition-all"
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

export default Projects;

export default Projects;
