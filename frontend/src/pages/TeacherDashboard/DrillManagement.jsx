import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Plus, AlertTriangle, Clock, X, Save, Play, CheckCircle } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const DrillManagement = () => {
  const [drills, setDrills] = useState([]);
  const [students, setStudents] = useState([]);
  const [showDrillForm, setShowDrillForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newDrill, setNewDrill] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    participants: [],
  });

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
      
      const [drillsRes, studentsRes] = await Promise.all([
        api.get(`/teachers/${user._id}/drills`),
        api.get(`/teachers/${user._id}/students`)
      ]);

      setDrills(drillsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDrillSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await api.post(`/drills`, newDrill);
      setShowDrillForm(false);
      setNewDrill({
        title: "",
        description: "",
        scheduledDate: "",
        participants: [],
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule drill");
    }
  };

  const updateDrillStatus = async (drillId, status) => {
    try {
      setError(null);
      await api.put(`/drills/${drillId}/status`, { status });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update drill status");
    }
  };

  const toggleParticipant = (studentId) => {
    setNewDrill({
      ...newDrill,
      participants: newDrill.participants.includes(studentId)
        ? newDrill.participants.filter((id) => id !== studentId)
        : [...newDrill.participants, studentId],
    });
  };

  const deleteDrill = async (drillId) => {
    if (!window.confirm("Are you sure you want to delete this drill?")) return;
    try {
      setError(null);
      await api.delete(`/drills/${drillId}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete drill");
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading drills..." />;
  }

  // FIXED: Use correct status values
  const pendingDrills = drills.filter(d => d.status === "PENDING");
  const completedDrills = drills.filter(d => d.status === "COMPLETED");

  // Helper function to get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case "PENDING":
        return { class: "bg-yellow-100 text-yellow-800", text: "Pending" };
      case "COMPLETED":
        return { class: "bg-green-100 text-green-800", text: "Completed" };
      default:
        return { class: "bg-gray-100 text-gray-800", text: status };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Drill Management</h2>
          <p className="text-gray-600">Schedule and manage safety drills</p>
        </div>
        <button 
          onClick={() => setShowDrillForm(true)} 
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Drill
        </button>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchData} />}

      {/* Drill Form Modal */}
      {showDrillForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Schedule New Drill</h3>
                <button
                  onClick={() => setShowDrillForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleDrillSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Drill Title</label>
                  <input
                    type="text"
                    value={newDrill.title}
                    onChange={(e) => setNewDrill({ ...newDrill, title: e.target.value })}
                    className="form-input"
                    placeholder="Enter drill title"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={newDrill.description}
                    onChange={(e) => setNewDrill({ ...newDrill, description: e.target.value })}
                    className="form-input"
                    rows="3"
                    placeholder="Enter drill description"
                  />
                </div>

                <div>
                  <label className="form-label">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newDrill.scheduledDate}
                    onChange={(e) => setNewDrill({ ...newDrill, scheduledDate: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label mb-3 block">Participants</label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                    {students.map((student) => (
                      <label key={student._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={newDrill.participants.includes(student._id)}
                          onChange={() => toggleParticipant(student._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>
                          {student.firstName} {student.lastName} ({student.grade})
                        </span>
                      </label>
                    ))}
                    {students.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No students available</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDrillForm(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Schedule Drill
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pending Drills */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6">Pending Drills ({pendingDrills.length})</h3>
        
        <div className="space-y-4">
          {pendingDrills.map((drill) => {
            const statusInfo = getStatusInfo(drill.status);
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
                  <span className={`px-3 py-1 text-sm rounded-full ${statusInfo.class}`}>
                    {statusInfo.text}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(drill.scheduledDate).toLocaleString()}
                  </div>
                  <span>{drill.participants?.length || 0} participants</span>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => updateDrillStatus(drill._id, "COMPLETED")}
                    className="btn btn-success text-sm flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Complete
                  </button>
                  <button 
                    onClick={() => deleteDrill(drill._id)}
                    className="btn btn-danger text-sm"
                  >
                    Cancel Drill
                  </button>
                </div>
              </div>
            );
          })}
          
          {pendingDrills.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending drills scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Drills */}
      {completedDrills.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Completed Drills ({completedDrills.length})</h3>
          
          <div className="space-y-3">
            {completedDrills.map((drill) => {
              const statusInfo = getStatusInfo(drill.status);
              return (
                <div key={drill._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{drill.title}</h4>
                      <p className="text-sm text-gray-600">
                        Completed: {new Date(drill.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrillManagement;