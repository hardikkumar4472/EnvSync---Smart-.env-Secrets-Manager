import { useEffect, useState, useRef } from 'react';
import { projectAPI, secretAPI } from '../services/api';
import { Plus, Key, Eye, EyeOff, Copy, Search, Filter, Upload, CheckCircle, AlertCircle, FileUp, X, Edit2, Trash2 } from 'lucide-react';

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
  const [importMode, setImportMode] = useState('paste'); // 'paste' or 'upload'
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
      setError(
        error.response?.data?.message || 'Failed to create secret'
      );
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
      setError(
        error.response?.data?.message || 'Failed to update secret'
      );
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
      setError(
        error.response?.data?.message || 'Failed to delete secret'
      );
      setSubmitting(false);
    }
  };

  // Parse .env content into key-value pairs
  const parseEnvContent = (content) => {
    const lines = content.split('\n');
    const secrets = [];
    
    lines.forEach((line, index) => {
      // Remove leading/trailing whitespace
      line = line.trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) {
        return;
      }
      
      // Handle KEY=VALUE format
      const match = line.match(/^([^=#\s]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        if (key) {
          secrets.push({ key, value, lineNumber: index + 1 });
        }
      }
    });
    
    return secrets;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if it's a .env file
    if (!file.name.endsWith('.env') && !file.name.endsWith('.env.local') && !file.name.endsWith('.env.example')) {
      setError('Please upload a .env file');
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
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleBulkParse = (content = null) => {
    const contentToParse = content || bulkEnvContent;
    
    if (!contentToParse.trim()) {
      setError('Please paste .env content or upload a file');
      return;
    }
    
    const parsed = parseEnvContent(contentToParse);
    
    if (parsed.length === 0) {
      setError('No valid key-value pairs found. Make sure your .env file uses KEY=VALUE format.');
      setParsedSecrets([]);
      return;
    }
    
    setParsedSecrets(parsed);
    setError('');
  };

  const handleRemoveFile = () => {
    setUploadedFileName('');
    setBulkEnvContent('');
    setParsedSecrets([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBulkSubmit = async () => {
    if (!selectedProject || parsedSecrets.length === 0) {
      setError('Please select a project and ensure secrets are parsed');
      return;
    }
    
    setBulkSubmitting(true);
    setError('');
    setBulkSuccess(false);
    
    const results = {
      success: [],
      failed: [],
    };
    
    // Create secrets one by one
    for (const secret of parsedSecrets) {
      try {
        await secretAPI.create(
          selectedProject,
          selectedEnv,
          secret.key,
          secret.value
        );
        results.success.push(secret.key);
      } catch (err) {
        results.failed.push({
          key: secret.key,
          error: err.response?.data?.message || 'Failed to create secret',
        });
      }
    }
    
    setBulkSubmitting(false);
    
    if (results.failed.length === 0) {
      setBulkSuccess(true);
      setBulkEnvContent('');
      setParsedSecrets([]);
      setTimeout(() => {
        setShowBulkModal(false);
        setBulkSuccess(false);
        fetchSecrets();
      }, 2000);
    } else {
      setError(
        `Created ${results.success.length} secrets. Failed: ${results.failed.map(f => f.key).join(', ')}`
      );
    }
  };

  const environments = ['dev', 'staging', 'prod'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{color: '#132440'}}>Secrets</h1>
          <p style={{color: '#718096'}}>
            Manage encrypted secrets for your projects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setShowBulkModal(true);
              setImportMode('upload');
            }}
            className="flex items-center space-x-2 text-white px-6 py-3 rounded-lg transition-all shadow-md"
            style={{backgroundColor: '#3B9797'}}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Upload className="w-5 h-5" />
            <span>Upload .env</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 text-white px-6 py-3 rounded-lg transition-all shadow-md gradient-primary"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus className="w-5 h-5" />
            <span>New Secret</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl shadow-md border p-4" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium style={{color: 'var(--color-text-primary)'}} mb-2">
              Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setFormData((prev) => ({ ...prev, projectId: e.target.value }));
              }}
              className="w-full px-4 py-2 border rounded-lg outline-none transition-all"
              style={{borderColor: '#E2E8F0'}}
              onFocus={(e) => e.target.style.borderColor = '#3B9797'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium style={{color: 'var(--color-text-primary)'}} mb-2">
              Environment
            </label>
            <div className="flex space-x-2">
              {environments.map((env) => (
                <button
                  key={env}
                  onClick={() => {
                    setSelectedEnv(env);
                    setFormData((prev) => ({ ...prev, environment: env }));
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition-all capitalize"
                  style={{
                    backgroundColor: selectedEnv === env ? '#3B9797' : 'var(--color-bg-light)',
                    color: selectedEnv === env ? '#FFFFFF' : '#4A5568'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEnv !== env) {
                      e.currentTarget.style.backgroundColor = '#E2E8F0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEnv !== env) {
                      e.currentTarget.style.backgroundColor = '#F8F9FA';
                    }
                  }}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border rounded-lg p-4" style={{backgroundColor: 'rgba(191, 9, 47, 0.1)', borderColor: '#BF092F'}}>
          <p className="text-sm" style={{color: '#BF092F'}}>{error}</p>
        </div>
      )}

      {/* Secrets List */}
      {!selectedProject ? (
        <div className="rounded-xl shadow-sm border p-12 text-center" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
          <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold style={{color: 'var(--color-text-primary)'}} mb-2">
            Select a project
          </h3>
          <p className="style={{color: 'var(--color-text-secondary)'}}">
            Choose a project and environment to view secrets
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#BF092F'}}></div>
        </div>
      ) : secrets.length === 0 ? (
        <div className="rounded-xl shadow-sm border p-12 text-center" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
          <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold style={{color: 'var(--color-text-primary)'}} mb-2">
            No secrets found
          </h3>
          <p className="style={{color: 'var(--color-text-secondary)'}} mb-6">
            Create your first secret for this project and environment
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-white px-6 py-3 rounded-lg transition-all gradient-primary"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Create Secret
          </button>
        </div>
      ) : (
        <div className="rounded-xl shadow-sm border overflow-hidden" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" style={{backgroundColor: 'var(--color-bg-light)', borderColor: 'var(--color-text-light)'}}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Environment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-text-light)'}}>
                {secrets.map((secret) => (
                  <tr key={secret._id} className="transition-colors" style={{backgroundColor: 'var(--color-bg-card)'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-light)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-card)'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono style={{color: 'var(--color-text-primary)'}}">
                        {secret.key}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded capitalize" style={{backgroundColor: 'rgba(59, 151, 151, 0.1)', color: '#3B9797'}}>
                        {secret.environment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(secret.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewValue(secret._id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{color: '#3B9797'}}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 151, 151, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="View secret value"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSecret(secret)}
                          className="p-2 rounded-lg transition-colors"
                          style={{color: '#16476A'}}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(22, 71, 106, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Edit secret"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSecret(secret);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-lg transition-colors"
                          style={{color: '#BF092F'}}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(191, 9, 47, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Delete secret"
                        >
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

      {/* Create Secret Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4" style={{color: '#132440'}}>
              Create New Secret
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium style={{color: 'var(--color-text-primary)'}} mb-2">
                  Project *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium style={{color: 'var(--color-text-primary)'}} mb-2">
                  Environment *
                </label>
                <select
                  value={formData.environment}
                  onChange={(e) =>
                    setFormData({ ...formData, environment: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {environments.map((env) => (
                    <option key={env} value={env}>
                      {env.charAt(0).toUpperCase() + env.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium style={{color: 'var(--color-text-primary)'}} mb-2">
                  Key *
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
                  placeholder="DATABASE_URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium style={{color: 'var(--color-text-primary)'}} mb-2">
                  Value *
                </label>
                <textarea
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
                  placeholder="mongodb://localhost:27017/mydb"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 style={{color: 'var(--color-text-primary)'}} rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 gradient-primary"
                >
                  {submitting ? 'Creating...' : 'Create Secret'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold style={{color: 'var(--color-text-primary)'}} mb-4">
              Bulk Import Secrets from .env File
            </h2>

            <div className="space-y-4">
              {/* Project and Environment Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium style={{color: 'var(--color-text-primary)'}} mb-2">
                    Project *
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium style={{color: 'var(--color-text-primary)'}} mb-2">
                    Environment *
                  </label>
                  <select
                    value={selectedEnv}
                    onChange={(e) => setSelectedEnv(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {environments.map((env) => (
                      <option key={env} value={env}>
                        {env.charAt(0).toUpperCase() + env.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Import Mode Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => {
                    setImportMode('upload');
                    setBulkEnvContent('');
                    setParsedSecrets([]);
                    setError('');
                  }}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    importMode === 'upload'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileUp className="w-4 h-4 inline mr-2" />
                  Upload File
                </button>
                <button
                  onClick={() => {
                    setImportMode('paste');
                    setUploadedFileName('');
                    setParsedSecrets([]);
                    setError('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    importMode === 'paste'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Copy className="w-4 h-4 inline mr-2" />
                  Paste Content
                </button>
              </div>

              {/* File Upload Section */}
              {importMode === 'upload' && (
                <div>
                  <label className="block text-sm font-medium style={{color: 'var(--color-text-primary)'}} mb-2">
                    Upload .env File *
                  </label>
                  {!uploadedFileName ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".env,.env.local,.env.example"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <FileUp className="w-12 h-12 text-gray-400 mb-3" />
                        <span className="text-sm font-medium style={{color: 'var(--color-text-primary)'}} mb-1">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-gray-500">
                          .env, .env.local, or .env.example files only
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileUp className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium style={{color: 'var(--color-text-primary)'}}">
                            {uploadedFileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {parsedSecrets.length > 0
                              ? `${parsedSecrets.length} secrets parsed`
                              : 'File uploaded'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Paste Content Section */}
              {importMode === 'paste' && (
                <div>
                  <label className="block text-sm font-medium style={{color: 'var(--color-text-primary)'}} mb-2">
                    Paste .env Content *
                  </label>
                  <textarea
                    value={bulkEnvContent}
                    onChange={(e) => {
                      setBulkEnvContent(e.target.value);
                      setParsedSecrets([]);
                      setError('');
                    }}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                    placeholder={`DATABASE_URL=mongodb://localhost:27017/mydb
API_KEY=sk-1234567890
JWT_SECRET=your-secret-key
PORT=3000
# Comments are ignored`}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Paste your .env file content. Each line should be in KEY=VALUE format.
                    Comments (lines starting with #) and empty lines will be ignored.
                  </p>
                </div>
              )}

              {/* Parse Button */}
              {(importMode === 'paste' || uploadedFileName) && (
                <button
                  onClick={() => handleBulkParse()}
                  disabled={(!bulkEnvContent.trim() && !uploadedFileName) || !selectedProject}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadedFileName && parsedSecrets.length === 0
                    ? 'Parse Secrets from File'
                    : 'Parse Secrets'}
                </button>
              )}

              {/* Parsed Secrets Preview */}
              {parsedSecrets.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold style={{color: 'var(--color-text-primary)'}}">
                      Preview ({parsedSecrets.length} secrets found)
                    </h3>
                    <span className="text-xs text-gray-500">
                      Review before adding
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {parsedSecrets.map((secret, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <code className="text-sm font-mono style={{color: 'var(--color-text-primary)'}} block truncate">
                            {secret.key}
                          </code>
                          <span className="text-xs text-gray-500">
                            {secret.value.length > 50
                              ? `${secret.value.substring(0, 50)}...`
                              : secret.value}
                          </span>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {bulkSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700">
                    Successfully created {parsedSecrets.length} secrets!
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkEnvContent('');
                    setParsedSecrets([]);
                    setError('');
                    setBulkSuccess(false);
                    setUploadedFileName('');
                    setImportMode('paste');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 style={{color: 'var(--color-text-primary)'}} rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSubmit}
                  disabled={
                    bulkSubmitting ||
                    parsedSecrets.length === 0 ||
                    !selectedProject ||
                    bulkSuccess
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkSubmitting
                    ? `Creating ${parsedSecrets.length} secrets...`
                    : `Add ${parsedSecrets.length} Secrets`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Secret Value Modal */}
      {showValueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold style={{color: 'var(--color-text-primary)'}} mb-4">
              Secret Value
            </h2>

            {loadingValue ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium style={{color: 'var(--color-text-primary)'}} mb-2">
                    Value (Decrypted)
                  </label>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={secretValue}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(secretValue)}
                      className="absolute top-2 right-2 p-2 text-gray-500 hover:style={{color: 'var(--color-text-primary)'}}"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    ⚠️ This secret value is decrypted. Keep it secure and
                    never share it.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowValueModal(null);
                    setSecretValue('');
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Secret Modal */}
      {showEditModal && selectedSecret && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(19, 36, 64, 0.7)'}}>
          <div className="rounded-xl shadow-2xl max-w-md w-full p-6" style={{backgroundColor: 'var(--color-bg-card)'}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{color: '#132440'}}>
                Edit Secret
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSecret(null);
                  setFormData({
                    projectId: selectedProject,
                    environment: selectedEnv,
                    key: '',
                    value: '',
                  });
                  setError('');
                }}
                className="p-1 rounded-lg transition-colors"
                style={{color: '#718096'}}
                onMouseEnter={(e) => e.currentTarget.style.color = '#132440'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#718096'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSecret} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: '#132440'}}>
                  Key *
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg outline-none transition-all font-mono"
                  style={{borderColor: '#E2E8F0'}}
                  onFocus={(e) => e.target.style.borderColor = '#3B9797'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  placeholder="DATABASE_URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{color: '#132440'}}>
                  Value *
                </label>
                <textarea
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg outline-none transition-all font-mono"
                  style={{borderColor: '#E2E8F0'}}
                  onFocus={(e) => e.target.style.borderColor = '#3B9797'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  placeholder="mongodb://localhost:27017/mydb"
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
                    setSelectedSecret(null);
                    setFormData({
                      projectId: selectedProject,
                      environment: selectedEnv,
                      key: '',
                      value: '',
                    });
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
                  {submitting ? 'Updating...' : 'Update Secret'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Secret Modal */}
      {showDeleteModal && selectedSecret && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(19, 36, 64, 0.7)'}}>
          <div className="rounded-xl shadow-2xl max-w-md w-full p-6" style={{backgroundColor: 'var(--color-bg-card)'}}>
            <h2 className="text-2xl font-bold mb-4" style={{color: '#132440'}}>
              Delete Secret
            </h2>
            <p className="mb-6" style={{color: '#4A5568'}}>
              Are you sure you want to delete the secret <strong className="font-mono">{selectedSecret.key}</strong>? 
              This action cannot be undone.
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
                  setSelectedSecret(null);
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
                onClick={handleDeleteSecret}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50"
                style={{backgroundColor: '#BF092F'}}
                onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#9A0726')}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#BF092F'}
              >
                {submitting ? 'Deleting...' : 'Delete Secret'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Secrets;

