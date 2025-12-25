import { useEffect, useState } from 'react';
import { projectAPI } from '../services/api';
import { Plus, FolderKanban, Trash2, Calendar, FileText, Edit2, X } from 'lucide-react';

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
      setError(
        error.response?.data?.message || 'Failed to create project'
      );
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
      setError(
        error.response?.data?.message || 'Failed to update project'
      );
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
      setError(
        error.response?.data?.message || 'Failed to delete project'
      );
      setSubmitting(false);
    }
  };

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
          <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--color-text-primary)'}}>Projects</h1>
          <p style={{color: 'var(--color-text-light)'}}>
            Manage your application projects and their secrets
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 text-white px-6 py-3 rounded-lg transition-all shadow-md gradient-primary"
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border rounded-lg p-4" style={{backgroundColor: 'rgba(191, 9, 47, 0.1)', borderColor: '#BF092F'}}>
          <p className="text-sm" style={{color: '#BF092F'}}>{error}</p>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="rounded-xl shadow-md border p-12 text-center" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
          <FolderKanban className="w-16 h-16 mx-auto mb-4" style={{color: 'var(--color-text-light)'}} />
          <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>
            No projects yet
          </h3>
          <p className="mb-6" style={{color: 'var(--color-text-light)'}}>
            Create your first project to start managing secrets
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-white px-6 py-3 rounded-lg transition-all gradient-primary"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="rounded-xl shadow-md border p-6 transition-all hover:shadow-lg"
              style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgba(22, 71, 106, 0.1)'}}>
                    <FolderKanban className="w-6 h-6" style={{color: '#16476A'}} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate" style={{color: 'var(--color-text-primary)'}}>
                      {project.name}
                    </h3>
                    <p className="text-xs font-mono mt-1 truncate" style={{color: 'var(--color-text-light)'}}>
                      {project._id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 rounded-lg transition-colors"
                    style={{color: '#3B9797'}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 151, 151, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Edit project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 rounded-lg transition-colors"
                    style={{color: '#BF092F'}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(191, 9, 47, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="text-sm mb-4 line-clamp-2" style={{color: 'var(--color-text-secondary)'}}>
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t" style={{borderColor: '#E2E8F0'}}>
                <div className="flex items-center space-x-1 text-xs" style={{color: 'var(--color-text-light)'}}>
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(project._id);
                    alert('Project ID copied to clipboard!');
                  }}
                  className="text-sm font-medium transition-colors"
                  style={{color: '#3B9797'}}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#16476A'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#3B9797'}
                >
                  Copy ID
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(19, 36, 64, 0.7)'}}>
          <div className="rounded-xl shadow-2xl max-w-md w-full p-6" style={{backgroundColor: 'var(--color-bg-card)'}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{color: 'var(--color-text-primary)'}}>
                Create New Project
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ name: '', description: '' });
                  setError('');
                }}
                className="p-1 rounded-lg transition-colors"
                style={{color: 'var(--color-text-light)'}}
                onMouseEnter={(e) => e.currentTarget.style.color = '#132440'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#718096'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                  style={{color: 'var(--color-text-primary)'}}
                >
                  Project Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg outline-none transition-all"
                  style={{borderColor: '#E2E8F0'}}
                  onFocus={(e) => e.target.style.borderColor = '#3B9797'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  placeholder="My Application"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-2"
                  style={{color: 'var(--color-text-primary)'}}
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg outline-none transition-all"
                  style={{borderColor: '#E2E8F0'}}
                  onFocus={(e) => e.target.style.borderColor = '#3B9797'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  placeholder="Project description..."
                />
              </div>

              {error && (
                <div className="border rounded-lg p-3" style={{backgroundColor: 'rgba(191, 9, 47, 0.1)', borderColor: '#BF092F'}}>
                  <p className="text-sm" style={{color: '#BF092F'}}>{error}</p>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', description: '' });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg transition-colors"
                  style={{borderColor: '#E2E8F0', color: '#4A5568'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 gradient-primary"
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(19, 36, 64, 0.7)'}}>
          <div className="rounded-xl shadow-2xl max-w-md w-full p-6" style={{backgroundColor: 'var(--color-bg-card)'}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{color: 'var(--color-text-primary)'}}>
                Edit Project
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProject(null);
                  setFormData({ name: '', description: '' });
                  setError('');
                }}
                className="p-1 rounded-lg transition-colors"
                style={{color: 'var(--color-text-light)'}}
                onMouseEnter={(e) => e.currentTarget.style.color = '#132440'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#718096'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium mb-2"
                  style={{color: 'var(--color-text-primary)'}}
                >
                  Project Name *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg outline-none transition-all"
                  style={{borderColor: '#E2E8F0'}}
                  onFocus={(e) => e.target.style.borderColor = '#3B9797'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  placeholder="My Application"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium mb-2"
                  style={{color: 'var(--color-text-primary)'}}
                >
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg outline-none transition-all"
                  style={{borderColor: '#E2E8F0'}}
                  onFocus={(e) => e.target.style.borderColor = '#3B9797'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  placeholder="Project description..."
                />
              </div>

              {error && (
                <div className="border rounded-lg p-3" style={{backgroundColor: 'rgba(191, 9, 47, 0.1)', borderColor: '#BF092F'}}>
                  <p className="text-sm" style={{color: '#BF092F'}}>{error}</p>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProject(null);
                    setFormData({ name: '', description: '' });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg transition-colors"
                  style={{borderColor: '#E2E8F0', color: '#4A5568'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 gradient-primary"
                >
                  {submitting ? 'Updating...' : 'Update Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(19, 36, 64, 0.7)'}}>
          <div className="rounded-xl shadow-2xl max-w-md w-full p-6" style={{backgroundColor: 'var(--color-bg-card)'}}>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--color-text-primary)'}}>
              Delete Project
            </h2>
            <p className="mb-6" style={{color: 'var(--color-text-secondary)'}}>
              Are you sure you want to delete <strong>{selectedProject.name}</strong>? 
              This action cannot be undone. The project can only be deleted if it has no secrets.
            </p>

            {error && (
              <div className="border rounded-lg p-3 mb-4" style={{backgroundColor: 'rgba(191, 9, 47, 0.1)', borderColor: '#BF092F'}}>
                <p className="text-sm" style={{color: '#BF092F'}}>{error}</p>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProject(null);
                  setError('');
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 border rounded-lg transition-colors"
                style={{borderColor: '#E2E8F0', color: '#4A5568'}}
                onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50"
                style={{backgroundColor: '#BF092F'}}
                onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#9A0726')}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#BF092F'}
              >
                {submitting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
