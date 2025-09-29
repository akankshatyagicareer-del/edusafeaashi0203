import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { BarChart3, Users, BookOpen, AlertTriangle, Download, Calendar, TrendingUp, Target } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const AnalyticsReports = () => {
  const [analytics, setAnalytics] = useState({
    userActivity: [],
    resourceUsage: [],
    quizPerformance: [],
    systemMetrics: {}
  });
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/director/analytics?timeRange=${timeRange}`);
      setAnalytics(response.data);

    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.response?.data?.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type) => {
    try {
      setError(null);
      // Simple CSV export implementation
      if (type === "users") {
        exportToCSV(analytics.userActivity, 'user_activity');
      } else if (type === "resources") {
        exportToCSV(analytics.resourceUsage, 'resource_usage');
      } else if (type === "quizzes") {
        exportToCSV(analytics.quizPerformance, 'quiz_performance');
      } else {
        // Full report - combine all data
        const fullReport = {
          systemMetrics: analytics.systemMetrics,
          userActivity: analytics.userActivity,
          resourceUsage: analytics.resourceUsage,
          quizPerformance: analytics.quizPerformance
        };
        exportToCSV(fullReport, 'full_analytics_report');
      }
    } catch (err) {
      setError("Failed to export report");
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || Object.keys(data).length === 0) {
      alert('No data available to export');
      return;
    }

    let csvContent = '';
    
    if (Array.isArray(data)) {
      // Array data
      if (data.length === 0) {
        alert('No data available to export');
        return;
      }
      
      const headers = Object.keys(data[0]).join(',');
      csvContent = headers + '\n';
      
      data.forEach(row => {
        const values = Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',');
        csvContent += values + '\n';
      });
    } else {
      // Object data (full report)
      Object.keys(data).forEach(section => {
        csvContent += `\n=== ${section.toUpperCase()} ===\n`;
        if (Array.isArray(data[section]) && data[section].length > 0) {
          const headers = Object.keys(data[section][0]).join(',');
          csvContent += headers + '\n';
          data[section].forEach(row => {
            const values = Object.values(row).map(value => 
              typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            ).join(',');
            csvContent += values + '\n';
          });
        } else if (typeof data[section] === 'object') {
          const headers = Object.keys(data[section]).join(',');
          const values = Object.values(data[section]).join(',');
          csvContent += headers + '\n' + values + '\n';
        }
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return <LoadingSpinner text="Loading analytics data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Analytics & Reports</h2>
          <p className="text-gray-600">Real-time system performance and user activity insights</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-input"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
          </select>
          <button 
            onClick={() => exportReport("full")}
            className="btn btn-primary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Full Report
          </button>
        </div>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchAnalytics} />}

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Students",
            value: analytics.systemMetrics.totalUsers || 0,
            icon: <Users className="h-5 w-5" />,
            color: "blue",
            description: "Registered students"
          },
          {
            title: "Active Students",
            value: analytics.systemMetrics.activeUsers || 0,
            icon: <TrendingUp className="h-5 w-5" />,
            color: "green",
            description: "Recently active students"
          },
          {
            title: "Resources",
            value: analytics.systemMetrics.totalResources || 0,
            icon: <BookOpen className="h-5 w-5" />,
            color: "purple",
            description: "Learning materials"
          },
          {
            title: "Avg Quiz Score",
            value: `${analytics.systemMetrics.avgQuizScore || 0}%`,
            icon: <Target className="h-5 w-5" />,
            color: "orange",
            description: "Average performance"
          },
        ].map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{metric.value}</p>
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              </div>
              <div className={`p-3 rounded-full bg-${metric.color}-100`}>
                <div className={`text-${metric.color}-600`}>
                  {metric.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {analytics.systemMetrics.engagementRate || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Student participation</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Completions</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {analytics.systemMetrics.totalCompletions || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Resources completed by students</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Target className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {analytics.systemMetrics.activeAlerts || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">System notifications</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* User Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Student Activity ({timeRange})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analytics.userActivity && analytics.userActivity.length > 0 ? (
              analytics.userActivity.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{day.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-700">{day.activeUsers} active students</span>
                    {day.newRegistrations > 0 && (
                      <span className="block text-xs text-green-600">+{day.newRegistrations} new students</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No student activity data available</p>
            )}
          </div>
        </div>

        {/* Resource Usage */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
            Top Resources
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analytics.resourceUsage && analytics.resourceUsage.length > 0 ? (
              analytics.resourceUsage.map((resource, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{resource.name}</p>
                    <p className="text-xs text-gray-500">{resource.views} views</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-700">{resource.completions} student completions</span>
                    <span className="block text-xs text-green-600">
                      {resource.completionRate}% completion rate
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No resource data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Performance */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-orange-600" />
          Quiz Performance
        </h3>
        <div className="space-y-4">
          {analytics.quizPerformance && analytics.quizPerformance.length > 0 ? (
            analytics.quizPerformance.map((quiz, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{quiz.category}</h4>
                  <p className="text-sm text-gray-600">{quiz.participants} student participants • {quiz.totalQuestions} questions</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">{quiz.averageScore}%</span>
                  <p className="text-xs text-gray-500">Average Score</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No quiz performance data available</p>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => exportReport("users")}
            className="btn btn-outline flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Student Activity
          </button>
          <button 
            onClick={() => exportReport("resources")}
            className="btn btn-outline flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Resource Usage
          </button>
          <button 
            onClick={() => exportReport("quizzes")}
            className="btn btn-outline flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Quiz Performance
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReports;