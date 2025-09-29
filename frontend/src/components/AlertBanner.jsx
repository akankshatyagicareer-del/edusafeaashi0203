import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../utils/api";
import { AlertTriangle, X, Bell } from "lucide-react";

const AlertBanner = () => {
  const [alerts, setAlerts] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const response = await api.get("/alerts");
      const alertData = Array.isArray(response.data)
        ? response.data
        : response.data?.alerts || [];

      const recentAlerts = alertData.filter((alert) => {
        const alertDate = new Date(alert.createdAt);
        const diffHours = (Date.now() - alertDate.getTime()) / (1000 * 60 * 60);
        return diffHours <= 24;
      });

      setAlerts(recentAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setAlerts([]);
    }
  };

  const dismissAlert = async (id) => {
    try {
      await api.put(`/alerts/${id}/dismiss`, { dismissed: true });
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error dismissing alert:", error);
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => (
        <div
          key={alert._id}
          className="relative bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-4 shadow-lg animate-slide-up"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">
                  Emergency Alert
                </h4>
                <p className="text-white/90 text-sm">{alert.message}</p>
                <p className="text-white/70 text-xs mt-1">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissAlert(alert._id)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Animated pulse effect */}
          <div className="absolute top-0 left-0 w-full h-full rounded-2xl bg-white/10 animate-pulse -z-10"></div>
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;