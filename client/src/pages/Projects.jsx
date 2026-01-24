import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { Plus, FolderKanban, Trash2, Calendar, Edit2, X, Shield, Database, ChevronRight, Copy } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-cyan-500 animate-spin shadow-lg shadow-cyan-500/20" />
        <p className="text-cyan-500 font-mono text-xs uppercase tracking-[0.3em] font-black animate-pulse">Scanning Repositories...</p>
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
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Vault / Storage</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">Secure Projects</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-purple px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center space-x-3 shadow-lg shadow-purple-500/20 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold tracking-tight text-sm sm:text-base">Initialize Vault</span>
          </button>
        </div>

        {/* Status Messaging */}
        {error && (
          <div className="hero-glass-card border-red-500/30 p-4 bg-red-500/5 flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-sm font-bold text-red-200">{error}</p>
          </div>
        )}

        {/* Content Section */}
        {projects.length === 0 ? (
          <div className="hero-glass-card py-24 text-center border-dashed border-white/10">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Database className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Projects Detected</h3>
            <p className="text-white/40 max-w-sm mx-auto mb-8 text-sm">
              Your security vault is empty. Initialize a new project container to begin managing application secrets.
            </p>
            <button
               onClick={() => setShowModal(true)}
               className="btn-glass px-8 py-3 text-cyan-400 group"
            >
              <div className="flex items-center space-x-2">
                <span>Start Initialization</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project._id}
                className="hero-glass-card p-6 sm:p-8 group transition-all hover:translate-y-[-4px] hover:bg-white/10 relative"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all">
                    <FolderKanban className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div className="flex items-center space-x-1 opacity-20 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                      title="Edit Protocol"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Terminate Vault"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors">{project.name}</h3>
                  <div 
                    onClick={() => {
                      navigator.clipboard.writeText(project._id);
                      alert('VAULT_ID copied to clipboard');
                    }}
                    className="flex items-center space-x-2 cursor-pointer group/id"
                  >
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest font-black group-hover/id:text-white/60">VAULT_ID:</span>
                    <span className="text-[10px] font-mono text-white/20 truncate">{project._id}</span>
                    <Copy className="w-3 h-3 text-white/10 group-hover/id:text-cyan-400" />
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-white/50 line-clamp-2 mb-8 leading-relaxed">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center space-x-2 text-white/30">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link 
                    to="/app/secrets" 
                    className="text-cyan-500 hover:text-cyan-400 transition-colors text-xs font-black uppercase tracking-widest flex items-center space-x-1"
                  >
                    <span>Manage</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals - Simplified & Themed */}
        {(showModal || showEditModal) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setShowModal(false); setShowEditModal(false); }} />
            <div className="hero-glass-card max-w-lg w-full p-6 sm:p-10 relative z-10 scale-in border-cyan-500/30">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {showModal ? 'Configure New Vault' : 'Modify Repository'}
                  </h2>
                </div>
                <button 
                  onClick={() => { setShowModal(false); setShowEditModal(false); }}
                  className="text-white/30 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={showModal ? handleSubmit : handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Vault Designation</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none"
                    placeholder="E.g. Production Mainframe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Protocol Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/10 transition-all outline-none resize-none"
                    placeholder="Define the scope of this security container..."
                  />
                </div>

                <div className="flex items-center space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setShowEditModal(false); }}
                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] btn-purple py-4 font-bold tracking-tight"
                  >
                    {submitting ? 'Processing...' : (showModal ? 'Initialize Vault' : 'Update Protocol')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowDeleteModal(false)} />
            <div className="hero-glass-card max-w-md w-full p-6 sm:p-10 relative z-10 scale-in border-red-500/30 shadow-red-500/10">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight mb-4">Critical Warning</h2>
                <p className="text-white/50 text-sm mb-10 leading-relaxed">
                  You are about to terminate the <span className="text-white font-bold">{selectedProject.name}</span> vault. This action will purge all metadata and is irreversible.
                </p>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="w-full py-4 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest text-xs hover:bg-red-400 transition-all"
                  >
                    Confirm Termination
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full py-4 text-white/30 hover:text-white text-xs font-black uppercase tracking-widest transition-all"
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

export default Projects;
