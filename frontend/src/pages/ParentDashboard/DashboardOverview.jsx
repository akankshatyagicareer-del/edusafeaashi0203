import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { BarChart3, Users, BookOpen, FileText, TrendingUp, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";
import { Link } from "react-router-dom";

const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/parents/${user._id}/student-progress`);
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading parent dashboard..." />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="text-center py-12">
        <ErrorDisplay error={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  // Calculate overview stats
  const overallProgress = dashboardData?.progress?.overall || 0;
  const averageScore = dashboardData?.progress?.averageScore || 0;
  const quizzesCompleted = dashboardData?.quizSubmissions?.length || 0;
  const resourcesCompleted = dashboardData?.resourceCompletions?.length || 0;

  const overviewStats = [
    {
      label: "Overall Progress",
      value: overallProgress,
      color: "blue",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      label: "Quiz Average",
      value: averageScore,
      color: "green",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      label: "Quizzes Completed",
      value: quizzesCompleted,
      color: "orange",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: "Resources Completed",
      value: resourcesCompleted,
      color: "purple",
      icon: <BookOpen className="h-5 w-5" />,
    }
  ];

  const recentQuizzes = dashboardData?.quizSubmissions?.slice(0, 3) || [];
  const recentResources = dashboardData?.resourceCompletions?.slice(0, 3) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 animate-slide-up">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Parent Dashboard
          </h2>
          <p className="text-slate-600 text-lg">Welcome back! Here's your child's current progress.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Last Updated</p>
          <p className="text-sm font-medium text-slate-800">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchDashboardData} />}

      {/* Enhanced Student Information */}
      <div className="card group animate-fade-in delay-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg transition-transform duration-300 group-hover:scale-105">
              {dashboardData?.student?.firstName?.[0]}{dashboardData?.student?.lastName?.[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {dashboardData?.student?.firstName} {dashboardData?.student?.lastName}
              </h3>
              <p className="text-slate-600">Grade {dashboardData?.student?.grade}</p>
              <p className="text-sm text-slate-500">
                Student ID: {dashboardData?.student?._id?.slice(-6)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Status</p>
            <p className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">Active</p>
          </div>
        </div>
      </div>

      {/* Enhanced Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <div 
            key={index} 
            className="stat-card group animate-fade-in"
            style={{ animationDelay: `${index * 100 + 200}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-2xl ${
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                stat.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                'bg-purple-100 text-purple-600'
              } transition-transform duration-300 group-hover:scale-110`}>
                {stat.icon}
              </div>
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">{stat.label}</h4>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-slate-900">
                {stat.label.includes('Progress') || stat.label.includes('Average') ? `${stat.value}%` : stat.value}
              </p>
              <div className="w-16 bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    stat.color === 'blue' ? 'bg-blue-600' :
                    stat.color === 'green' ? 'bg-green-600' :
                    stat.color === 'orange' ? 'bg-orange-600' :
                    'bg-purple-600'
                  }`}
                  style={{ width: `${Math.min(stat.value, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quiz Results */}
        <div className="card group animate-fade-in delay-300">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-lg text-slate-800 flex items-center">
              <FileText className="h-5 w-5 text-purple-600 mr-2" />
              Recent Quiz Results
            </h4>
            <Link to="/parent/progress" className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-300">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentQuizzes.map((submission, index) => {
              const isPassed = submission.score >= (submission.quizId?.passingScore || 60);
              
              return (
                <div 
                  key={submission._id} 
                  className="border border-slate-200 rounded-xl p-4 transition-all duration-300 hover:border-slate-300 group/item"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-slate-800 truncate">
                      {submission.quizId?.title || 'Quiz'}
                    </h5>
                    <span className={`px-2 py-1 text-xs rounded-full transition-transform duration-300 group-hover/item:scale-110 ${
                      isPassed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {isPassed ? "Passed" : "Needs Improvement"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Score: {submission.score}%</span>
                    <span className="text-sm text-slate-500">
                      {new Date(submission.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {recentQuizzes.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No quiz results yet</p>
                <p className="text-sm text-slate-400">Quiz results will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Resources Completed */}
        <div className="card group animate-fade-in delay-400">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-lg text-slate-800 flex items-center">
              <BookOpen className="h-5 w-5 text-orange-600 mr-2" />
              Recent Resources Completed
            </h4>
            <Link to="/parent/progress" className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-300">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentResources.map((completion, index) => (
              <div 
                key={completion._id} 
                className="border border-slate-200 rounded-xl p-4 transition-all duration-300 hover:border-slate-300 group/item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h5 className="font-semibold mb-2 truncate text-slate-800">
                  {completion.resourceId?.title || 'Resource'}
                </h5>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span className="capitalize">{completion.resourceId?.type || 'unknown'}</span>
                  <span>{new Date(completion.completedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            
            {recentResources.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No resources completed yet</p>
                <p className="text-sm text-slate-400">Completed resources will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="card group animate-fade-in delay-500">
        <h4 className="font-semibold text-lg text-slate-800 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/parent/progress" 
            className="bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 p-4 rounded-xl text-center transition-all duration-300 group/item"
          >
            <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2 transition-transform duration-300 group-hover/item:scale-110" />
            <span className="font-medium text-blue-700">View Detailed Progress</span>
          </Link>
          
          <Link 
            to="/parent/emergency" 
            className="bg-gradient-to-br from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/50 p-4 rounded-xl text-center transition-all duration-300 group/item"
          >
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2 transition-transform duration-300 group-hover/item:scale-110" />
            <span className="font-medium text-red-700">Emergency Contacts</span>
          </Link>
          
          <button 
            onClick={fetchDashboardData}
            className="bg-gradient-to-br from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-200/50 p-4 rounded-xl text-center transition-all duration-300 group/item"
          >
            <RefreshCw className="h-8 w-8 text-slate-600 mx-auto mb-2 transition-transform duration-300 group-hover/item:scale-110" />
            <span className="font-medium text-slate-700">Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;