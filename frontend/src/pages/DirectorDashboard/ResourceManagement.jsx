import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Plus, BookOpen, Trash2, Edit3, Paperclip } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "article",
    content: "",
    tags: "",
    file: null,
  });

  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editResourceData, setEditResourceData] = useState({
    title: "",
    description: "",
    type: "article",
    content: "",
    tags: "",
    file: null,
  });

  const { user } = useSelector((state) => state.auth);
 const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://edusafe-i71e.vercel.app/api';

  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [user]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await api.get("/resources");
      setResources(response.data?.resources || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const getResourceHref = (content) => {
  if (!content) return null;
  const c = content.trim();
  if (c.startsWith("http://") || c.startsWith("https://") || c.startsWith("//")) {
    return c;
  }
  // Use relative path for uploaded files - Vercel will handle the routing
  return c.startsWith("/") ? c : `/${c}`;
};

  const isExternalContent = (content) => {
    if (!content) return false;
    const c = content.trim();
    return c.startsWith("http://") || c.startsWith("https://") || c.startsWith("//");
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      const formData = new FormData();
      formData.append("title", newResource.title);
      formData.append("description", newResource.description);
      formData.append("type", newResource.type);
      if (newResource.content) {
        formData.append("content", newResource.content);
      }
      if (newResource.file) {
        formData.append("file", newResource.file);
      }
      formData.append("tags", newResource.tags || "");

      await api.post("/resources", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowResourceForm(false);
      setNewResource({
        title: "",
        description: "",
        type: "article",
        content: "",
        tags: "",
        file: null,
      });
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create resource");
    }
  };

  const handleEditResourceSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      const formData = new FormData();
      formData.append("title", editResourceData.title);
      formData.append("description", editResourceData.description);
      formData.append("type", editResourceData.type);
      if (editResourceData.content) {
        formData.append("content", editResourceData.content);
      }
      if (editResourceData.file) {
        formData.append("file", editResourceData.file);
      }
      formData.append("tags", editResourceData.tags || "");

      await api.put(`/resources/${editingResourceId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEditingResourceId(null);
      setEditResourceData({
        title: "",
        description: "",
        type: "article",
        content: "",
        tags: "",
        file: null,
      });
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update resource");
    }
  };

  const deleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      setError(null);
      await api.delete(`/resources/${resourceId}`);
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete resource");
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading resources..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Resource Management</h2>
          <p className="text-gray-600">Manage educational resources for all users</p>
        </div>
        <button 
          onClick={() => setShowResourceForm(!showResourceForm)} 
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showResourceForm ? "Cancel" : "Add Resource"}
        </button>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchResources} />}

      {/* Resource Form */}
      {showResourceForm && (
        <form onSubmit={handleResourceSubmit} className="card space-y-4">
          <h3 className="text-lg font-semibold">Add New Resource</h3>
          
          <div>
            <label className="form-label">Title</label>
            <input 
              type="text" 
              value={newResource.title} 
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} 
              className="form-input" 
              placeholder="Enter resource title" 
              required 
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea 
              value={newResource.description} 
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })} 
              className="form-input" 
              rows="3" 
              placeholder="Enter resource description" 
            />
          </div>

          <div>
            <label className="form-label">Type</label>
            <select 
              value={newResource.type} 
              onChange={(e) => setNewResource({ ...newResource, type: e.target.value })} 
              className="form-input"
            >
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="guideline">Guideline</option>
              <option value="file">File Upload</option>
            </select>
          </div>

          <div>
            <label className="form-label">Content URL (optional)</label>
            <input 
              type="url" 
              value={newResource.content} 
              onChange={(e) => setNewResource({ ...newResource, content: e.target.value })} 
              className="form-input" 
              placeholder="https://example.com/resource (leave blank to upload file)" 
            />
            <p className="text-xs text-gray-500 mt-1">If you provide a URL, it will be used as the resource. Otherwise upload a file below.</p>
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <Paperclip className="h-4 w-4" /> Upload File (optional)
            </label>
            <input 
              type="file" 
              accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png,.mp4" 
              onChange={(e) => setNewResource({ ...newResource, file: e.target.files[0] })} 
              className="form-input" 
            />
          </div>

          <div>
            <label className="form-label">Tags</label>
            <input 
              type="text" 
              value={newResource.tags} 
              onChange={(e) => setNewResource({ ...newResource, tags: e.target.value })} 
              className="form-input" 
              placeholder="safety, emergency, guide" 
            />
          </div>

          <button type="submit" className="btn btn-success w-full">Create Resource</button>
        </form>
      )}

      {/* Resources List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6">All Resources ({resources.length})</h3>
        
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              {editingResourceId === resource._id ? (
                <form onSubmit={handleEditResourceSubmit} className="space-y-3 bg-gray-50 p-3 rounded-lg">
                  <input type="text" value={editResourceData.title} onChange={(e) => setEditResourceData({ ...editResourceData, title: e.target.value })} className="form-input" placeholder="Title" required />
                  <textarea value={editResourceData.description} onChange={(e) => setEditResourceData({ ...editResourceData, description: e.target.value })} className="form-input" placeholder="Description" />
                  <select value={editResourceData.type} onChange={(e) => setEditResourceData({ ...editResourceData, type: e.target.value })} className="form-input">
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="guideline">Guideline</option>
                    <option value="file">File Upload</option>
                  </select>
                  <input type="url" value={editResourceData.content} onChange={(e) => setEditResourceData({ ...editResourceData, content: e.target.value })} className="form-input" placeholder="Content URL" />
                  <input type="file" accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png,.mp4" onChange={(e) => setEditResourceData({ ...editResourceData, file: e.target.files[0] })} className="form-input" />
                  <input type="text" value={editResourceData.tags} onChange={(e) => setEditResourceData({ ...editResourceData, tags: e.target.value })} className="form-input" placeholder="Tags" />
                  <div className="flex space-x-2">
                    <button type="submit" className="btn btn-success flex-1">Update</button>
                    <button type="button" onClick={() => setEditingResourceId(null)} className="btn btn-secondary flex-1">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{resource.title}</h4>
                      <p className="text-sm text-gray-600 capitalize">{resource.type}</p>
                      {resource.content && (
                        <a href={getResourceHref(resource.content)} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline block mt-1">
                          {isExternalContent(resource.content) ? "Open Resource" : "Download File"}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => {
                        setEditingResourceId(resource._id);
                        setEditResourceData({
                          title: resource.title || "",
                          description: resource.description || "",
                          type: resource.type || "article",
                          content: resource.content || "",
                          tags: Array.isArray(resource.tags) ? resource.tags.join(",") : (resource.tags || ""),
                          file: null,
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      type="button"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteResource(resource._id)} className="text-red-600 hover:text-red-800" type="button">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {resources.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No resources available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceManagement;