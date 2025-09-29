import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { AlertTriangle, Clock, X } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const AlertSystem = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/alerts");
      setAlerts(response.data?.alerts || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const sendAlert = async () => {
    const message = prompt("Enter alert message for all users:");
    if (!message) return;
    try {
      setError(null);
      await api.post("/alerts", {
        message,
        targetRoles: ["teacher", "student", "parent"],
        emergencyLevel: "high",
      });
      alert("🚨 Alert sent successfully!");
      fetchAlerts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send alert");
    }
  };

  const dismissAlert = async (alertId) => {
    try {
      setError(null);
      await api.put(`/alerts/${alertId}/dismiss`);
      fetchAlerts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dismiss alert");
    }
  };

  const dismissAllAlerts = async () => {
    if (!window.confirm("Are you sure you want to dismiss all alerts?")) return;
    try {
      setError(null);
      const activeAlerts = alerts.filter(alert => !alert.dismissed);
      await Promise.all(activeAlerts.map(alert => api.put(`/alerts/${alert._id}/dismiss`)));
      fetchAlerts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dismiss alerts");
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading alerts..." />;
  }

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const dismissedAlerts = alerts.filter(alert => alert.dismissed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Alert System</h2>
          <p className="text-gray-600">Manage emergency alerts and notifications</p>
        </div>
        <div className="flex space-x-3">
          {activeAlerts.length > 0 && (
            <button 
              onClick={dismissAllAlerts}
              className="btn btn-secondary flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Dismiss All
            </button>
          )}
          <button 
            onClick={sendAlert}
            className="btn btn-danger flex items-center"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Send New Alert
          </button>
        </div>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchAlerts} />}

      {/* Active Alerts */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Active Alerts ({activeAlerts.length})</h3>
          {activeAlerts.length > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
              Urgent Attention Required
            </span>
          )}
        </div>

        <div className="space-y-4">
          {activeAlerts.map((alert) => (
            <div key={alert._id} className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800">Emergency Alert</h4>
                    <p className="text-red-700">{alert.message}</p>
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(alert.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                        Target: {alert.targetRoles?.join(", ") || "All users"}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => dismissAlert(alert._id)} 
                  className="text-red-600 hover:text-red-800 text-sm flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Dismiss
                </button>
              </div>
            </div>
          ))}

          {activeAlerts.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-16 w-16 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500">No active alerts. System is running smoothly.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dismissed Alerts */}
      {dismissedAlerts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Dismissed Alerts ({dismissedAlerts.length})</h3>
          <div className="space-y-3">
            {dismissedAlerts.map((alert) => (
              <div key={alert._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-700">Alert (Dismissed)</h4>
                      <p className="text-gray-600">{alert.message}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Dismissed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;