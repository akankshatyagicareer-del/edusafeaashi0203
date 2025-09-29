import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { BookOpen, Award, Clock, AlertTriangle, MessageCircle, TrendingUp } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const DashboardOverview = () => {
  const [progress, setProgress] = useState({
    progress: {},
    quizSubmissions: [],
    resourceCompletions: []
  });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [alerts, setAlerts] = useState([]);
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

      const [progressRes, messagesRes, alertsRes] = await Promise.all([
        api.get(`/progress/student/${user._id}`),
        api.get("/messages/unread-count"),
        api.get("/alerts")
      ]);

      setProgress(progressRes.data || {
        progress: { overall: 0, quizzes: 0, resources: 0, averageScore: 0 },
        quizSubmissions: [],
        resourceCompletions: []
      });

      setUnreadMessages(messagesRes.data?.unreadCount || 0);

      const alertsData = alertsRes.data?.alerts || alertsRes.data || [];
      setAlerts(alertsData.filter(alert => !alert.dismissed));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading student dashboard..." />
      </div>
    );
  }

  const statCards = [
    {
      title: "Overall Progress",
      value: `${progress.progress.overall || 0}%`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "blue"
    },
    {
      title: "Average Score",
      value: `${progress.progress.averageScore || 0}%`,
      icon: <Award className="h-5 w-5" />,
      color: "green"
    },
    {
      title: "Quizzes Completed",
      value: progress.quizSubmissions?.length || 0,
      icon: <BookOpen className="h-5 w-5" />,
      color: "purple"
    },
    {
      title: "Resources Completed",
      value: progress.resourceCompletions?.length || 0,
      icon: <BookOpen className="h-5 w-5" />,
      color: "orange"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 animate-slide-up">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Student Dashboard
          </h2>
          <p className="text-slate-600 text-lg">Welcome back, {user?.firstName}! Ready to learn?</p>
        </div>
        {unreadMessages > 0 && (
          <button 
            onClick={() => window.location.href = "/student-dashboard/messages"}
            className="btn btn-primary flex items-center group relative animate-fade-in delay-300"
          >
            <MessageCircle className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
            Messages
            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse-soft">
              {unreadMessages}
            </span>
          </button>
        )}
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
                style={{ width: `${Math.min(parseInt(stat.value), 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Quick Actions & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card group animate-fade-in delay-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 text-primary-600 mr-2" />
            Learning Center
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = "/student-dashboard/resources"}
              className="w-full btn btn-primary flex items-center justify-center group/item transition-all duration-300"
            >
              <BookOpen className="h-4 w-4 mr-2 transition-transform group-hover/item:scale-110" />
              Study Resources
            </button>
            <button 
              onClick={() => window.location.href = "/student-dashboard/quizzes"}
              className="w-full btn btn-success flex items-center justify-center group/item transition-all duration-300"
            >
              <Award className="h-4 w-4 mr-2 transition-transform group-hover/item:scale-110" />
              Take Quizzes
            </button>
            <button 
              onClick={() => window.location.href = "/student-dashboard/drills"}
              className="w-full btn btn-secondary flex items-center justify-center group/item transition-all duration-300"
            >
              <Clock className="h-4 w-4 mr-2 transition-transform group-hover/item:scale-110" />
              Safety Drills
            </button>
            <button 
              onClick={() => window.location.href = "/student-dashboard/messages"}
              className="w-full btn btn-info flex items-center justify-center group/item transition-all duration-300"
            >
              <MessageCircle className="h-4 w-4 mr-2 transition-transform group-hover/item:scale-110" />
              Messages {unreadMessages > 0 && `(${unreadMessages})`}
            </button>
          </div>
        </div>

        {/* Enhanced Progress Summary */}
        <div className="card group animate-fade-in delay-300">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            Progress Summary
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                <span className="text-sm font-medium text-blue-600">{progress.progress.overall || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${progress.progress.overall || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Quiz Progress</span>
                <span className="text-sm font-medium text-green-600">{progress.progress.quizzes || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${progress.progress.quizzes || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Resource Progress</span>
                <span className="text-sm font-medium text-purple-600">{progress.progress.resources || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${progress.progress.resources || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quiz Results */}
        <div className="card group animate-fade-in delay-400">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Award className="h-5 w-5 text-purple-600 mr-2" />
            Recent Quiz Results
          </h3>
          <div className="space-y-3">
            {progress.quizSubmissions?.slice(0, 3).map((submission, index) => (
              <div 
                key={submission._id} 
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-all duration-300 group/item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 truncate">
                    {submission.quizId?.title || "Quiz"}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {new Date(submission.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-lg font-bold transition-transform duration-300 group-hover/item:scale-110 ${
                  submission.score >= 80 ? "text-green-600" : 
                  submission.score >= 60 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {submission.score}%
                </span>
              </div>
            ))}
            {(!progress.quizSubmissions || progress.quizSubmissions.length === 0) && (
              <div className="text-center py-8 text-slate-500">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No quiz results yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Resources */}
        <div className="card group animate-fade-in delay-500">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 text-orange-600 mr-2" />
            Recently Completed
          </h3>
          <div className="space-y-3">
            {progress.resourceCompletions?.slice(0, 3).map((completion, index) => (
              <div 
                key={completion._id} 
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-all duration-300 group/item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 truncate">
                    {completion.resourceId?.title || "Resource"}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {new Date(completion.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full transition-transform duration-300 group-hover/item:scale-110">
                  Completed
                </span>
              </div>
            ))}
            {(!progress.resourceCompletions || progress.resourceCompletions.length === 0) && (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No resources completed yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Active Alerts */}
      {alerts.length > 0 && (
        <div className="card border-red-200 bg-gradient-to-r from-red-50 to-orange-50 group animate-fade-in delay-600">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-red-800">
            <AlertTriangle className="h-5 w-5 mr-2 animate-pulse-soft" />
            Important Alerts ({alerts.length})
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 2).map((alert, index) => (
              <div 
                key={alert._id} 
                className="p-3 bg-white/50 rounded-lg border border-red-100 transition-all duration-300 hover:border-red-200"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <p className="text-red-700 font-medium">{alert.message}</p>
                <p className="text-xs text-red-600 mt-1">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;