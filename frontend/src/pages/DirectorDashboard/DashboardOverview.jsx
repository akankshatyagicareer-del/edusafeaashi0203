import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Users, BookOpen, AlertTriangle, BarChart3 } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalResources: 0,
    activeAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [resourcesRes, alertsRes, statsRes] = await Promise.all([
        api.get("/resources"),
        api.get("/alerts"),
        api.get("/director/stats"),
      ]);

      const resources = resourcesRes.data?.resources || resourcesRes.data || [];
      const alerts = alertsRes.data?.alerts || alertsRes.data || [];
      
      setStats(
        statsRes.data || {
          totalStudents: 0,
          totalTeachers: 0,
          totalResources: resources.length,
          activeAlerts: alerts.filter(alert => !alert.dismissed).length,
        }
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
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
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send alert");
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard overview..." />;
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: <Users className="h-5 w-5" />,
      color: "blue",
    },
    {
      title: "Teachers",
      value: stats.totalTeachers,
      icon: <Users className="h-5 w-5" />,
      color: "green",
    },
    {
      title: "Resources",
      value: stats.totalResources,
      icon: <BookOpen className="h-5 w-5" />,
      color: "purple",
    },
    {
      title: "Active Alerts",
      value: stats.activeAlerts,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "red",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Director Dashboard Overview
          </h2>
          <p className="text-slate-600 mt-1">Welcome back, {user?.firstName}</p>
        </div>
        <button onClick={sendAlert} className="btn btn-danger flex items-center group animate-fade-in delay-300" type="button">
          <AlertTriangle className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
          Send Alert
        </button>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchDashboardData} />}

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="stat-card group animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-${stat.color}-100 text-${stat.color}-600 transition-transform duration-300 group-hover:scale-110`}>
                {stat.icon}
              </div>
            </div>
            {/* Progress bar for visual enhancement */}
            <div className="mt-3 w-full bg-slate-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full bg-${stat.color}-500 transition-all duration-1000`}
                style={{ width: `${Math.min((stat.value / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card group animate-fade-in delay-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-primary-600 mr-2" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = "/director-dashboard/resources"}
              className="w-full btn btn-primary flex items-center justify-center group/item transition-all duration-300"
            >
              <BookOpen className="h-4 w-4 mr-2 transition-transform group-hover/item:scale-110" />
              Manage Resources
            </button>
            <button 
              onClick={() => window.location.href = "/director-dashboard/alerts"}
              className="w-full btn btn-secondary flex items-center justify-center group/item transition-all duration-300"
            >
              <AlertTriangle className="h-4 w-4 mr-2 transition-transform group-hover/item:scale-110" />
              View Alert System
            </button>
            <button 
              onClick={() => window.location.href = "/director-dashboard/reports"}
              className="w-full btn btn-success flex items-center justify-center group/item transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4 mr-2 transition-transform group-hover/item:scale-110" />
              View Analytics
            </button>
          </div>
        </div>

        <div className="card group animate-fade-in delay-300">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            System Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50/50">
              <span className="text-slate-600">Resources</span>
              <span className={`badge ${stats.totalResources > 0 ? 'badge-success' : 'badge-warning'}`}>
                {stats.totalResources > 0 ? 'Available' : 'None'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50/50">
              <span className="text-slate-600">Active Alerts</span>
              <span className={`badge ${stats.activeAlerts > 0 ? 'badge-error' : 'badge-success'}`}>
                {stats.activeAlerts} active
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50/50">
              <span className="text-slate-600">System Health</span>
              <span className="badge badge-success">Optimal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Additional Info Section */}
      <div className="card animate-fade-in delay-400">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="font-semibold text-blue-700">User Management</p>
            <p className="text-sm text-blue-600">Manage all platform users</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-green-700">Content Library</p>
            <p className="text-sm text-green-600">Educational resources</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50">
            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="font-semibold text-purple-700">Analytics</p>
            <p className="text-sm text-purple-600">Performance insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;