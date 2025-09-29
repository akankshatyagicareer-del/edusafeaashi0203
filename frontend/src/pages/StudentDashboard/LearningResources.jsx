import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../utils/api';
import { BookOpen, CheckCircle } from 'lucide-react';
import FileViewer from '../../components/FileViewer';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

const LearningResources = () => {
  const [resources, setResources] = useState([]);
  const [completedResources, setCompletedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [resourcesRes, completionsRes] = await Promise.all([
        api.get('/resources'),
        api.get('/resources/completions')
      ]);

      setResources(resourcesRes.data?.resources || resourcesRes.data || []);
      setCompletedResources(completionsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const markResourceComplete = async (resourceId) => {
    try {
      setError(null);
      await api.post(`/resources/${resourceId}/complete`, { timeSpent: 300 });
      await fetchData(); // Refresh to update completion status
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark resource as complete');
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

  const isResourceCompleted = (resourceId) => {
    return completedResources.some(cr => {
      const rid = cr?.resourceId?._id || cr?.resourceId;
      return String(rid) === String(resourceId);
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading learning resources..." />;
  }

  const completedCount = resources.filter(resource => isResourceCompleted(resource._id)).length;
  const progressPercentage = resources.length > 0 ? Math.round((completedCount / resources.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Learning Resources</h2>
          <p className="text-gray-600">Access educational materials and track your progress</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Progress</p>
          <p className="text-2xl font-bold">{progressPercentage}%</p>
          <p className="text-xs text-gray-500">{completedCount}/{resources.length} completed</p>
        </div>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchData} />}

      {/* Progress Bar */}
      {resources.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Course Progress</span>
            <span className="text-sm text-gray-600">{completedCount}/{resources.length} resources</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => {
          const isCompleted = isResourceCompleted(resource._id);
          const resourceLink = getResourceHref(resource.content);

          return (
            <div
              key={resource._id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                {isCompleted && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </span>
                )}
              </div>

              <h4 className="font-semibold text-lg mb-2">{resource.title}</h4>
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="capitalize">{resource.type}</span>
                <span>{resource.duration || '5'} min</span>
              </div>

              <div className="flex flex-col space-y-2">
                {resourceLink ? (
                  <>
                    <FileViewer fileUrl={resourceLink} title={resource.title} />
                    
                    <div className="flex space-x-2">
                      <a
                        href={resourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary text-sm flex-1 text-center"
                      >
                        Open in New Tab
                      </a>
                      {!isCompleted && (
                        <button
                          onClick={() => markResourceComplete(resource._id)}
                          className="btn btn-success text-sm flex items-center justify-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-400 mb-2">No resource available</p>
                    {!isCompleted && (
                      <button
                        onClick={() => markResourceComplete(resource._id)}
                        className="btn btn-success text-sm"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {resource.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {resources.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No learning resources available</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for new materials</p>
          </div>
        )}
      </div>

      {/* Completion Stats */}
      {resources.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Your Learning Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{resources.length}</div>
              <div className="text-sm text-gray-600">Total Resources</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{resources.length - completedCount}</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{progressPercentage}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningResources;