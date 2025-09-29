import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../utils/api';
import { AlertTriangle, Clock, CheckCircle, Play, Calendar } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

const SafetyDrills = () => {
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      fetchDrills();
    }
  }, [user]);

  const fetchDrills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/drills');
      setDrills(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load drills');
    } finally {
      setLoading(false);
    }
  };

  const participateInDrill = async (drillId) => {
    try {
      setError(null);
      // This would mark the student's participation in the drill
      await api.post(`/drills/${drillId}/participate`, { studentId: user._id });
      alert('✅ Participation recorded! Stay safe!');
      fetchDrills(); // Refresh to update status
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record participation');
    }
  };

  const getDrillStatus = (drill) => {
    const now = new Date();
    const scheduledDate = new Date(drill.scheduledDate);
    
    if (drill.status === 'completed') return 'completed';
    if (drill.status === 'in-progress') return 'in-progress';
    if (now > scheduledDate) return 'missed';
    if (now >= new Date(scheduledDate.getTime() - 30 * 60000)) return 'starting-soon'; // 30 minutes before
    return 'scheduled';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'starting-soon': return 'bg-orange-100 text-orange-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'starting-soon': return 'Starting Soon';
      case 'missed': return 'Missed';
      default: return 'Scheduled';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading safety drills..." />;
  }

  const upcomingDrills = drills.filter(drill => 
    ['scheduled', 'starting-soon', 'in-progress'].includes(getDrillStatus(drill))
  );
  const pastDrills = drills.filter(drill => 
    ['completed', 'missed'].includes(getDrillStatus(drill))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Safety Drills</h2>
          <p className="text-gray-600">Participate in emergency preparedness drills</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Drill Participation</p>
          <p className="text-2xl font-bold">
            {drills.filter(d => getDrillStatus(d) === 'completed').length}/{drills.length}
          </p>
        </div>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchDrills} />}

      {/* Safety Instructions */}
      <div className="card bg-yellow-50 border-yellow-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">Safety Instructions</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Follow your teacher's instructions during drills</li>
              <li>• Stay calm and move quickly to designated safe areas</li>
              <li>• Silence your devices and remain quiet during the drill</li>
              <li>• Wait for the "all clear" signal before returning to normal activities</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upcoming Drills */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6">Upcoming Drills ({upcomingDrills.length})</h3>
        
        <div className="space-y-4">
          {upcomingDrills.map((drill) => {
            const status = getDrillStatus(drill);
            const isParticipant = drill.participants?.includes(user._id);
            
            return (
              <div key={drill._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{drill.title}</h4>
                      <p className="text-gray-600">{drill.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(drill.scheduledDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(drill.scheduledDate).toLocaleTimeString([], { 
                      hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {drill.participants?.length || 0} participants registered
                  </span>
                  
                  {status === 'in-progress' && !isParticipant && (
                    <button
                      onClick={() => participateInDrill(drill._id)}
                      className="btn btn-primary flex items-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Join Drill
                    </button>
                  )}
                  
                  {status === 'in-progress' && isParticipant && (
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Participating
                    </span>
                  )}
                  
                  {status === 'starting-soon' && (
                    <span className="text-orange-600 text-sm font-medium">
                      Starting in 30 minutes
                    </span>
                  )}
                  
                  {status === 'scheduled' && (
                    <span className="text-gray-600 text-sm">
                      {Math.ceil((new Date(drill.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24))} days away
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
          {upcomingDrills.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming drills scheduled</p>
              <p className="text-sm text-gray-400">Check back later for new safety drills.</p>
            </div>
          )}
        </div>
      </div>

      {/* Past Drills */}
      {pastDrills.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Drill History ({pastDrills.length})</h3>
          
          <div className="space-y-3">
            {pastDrills.map((drill) => {
              const status = getDrillStatus(drill);
              const isParticipant = drill.participants?.includes(user._id);
              
              return (
                <div key={drill._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{drill.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {new Date(drill.scheduledDate).toLocaleDateString()} • 
                      {new Date(drill.scheduledDate).toLocaleTimeString([], { 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                    <span className={isParticipant ? 'text-green-600' : 'text-red-600'}>
                      {isParticipant ? 'Participated' : 'Not Participated'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Participation Stats */}
      {drills.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Drill Participation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{drills.length}</div>
              <div className="text-sm text-gray-600">Total Drills</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {drills.filter(d => d.participants?.includes(user._id)).length}
              </div>
              <div className="text-sm text-gray-600">Participated</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((drills.filter(d => d.participants?.includes(user._id)).length / drills.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Participation Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyDrills;