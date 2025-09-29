// src/pages/ParentDashboard/StudentProgress.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { BarChart3, BookOpen, FileText, Calendar } from 'lucide-react';
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const StudentProgress = () => {
  const [studentProgress, setStudentProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?._id) {
      fetchStudentProgress();
    }
  }, [user]);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // FIXED: Remove the leading /api since base URL already includes it
      const response = await api.get(`/parents/${user._id}/student-progress`);
      setStudentProgress(response.data);
    } catch (err) {
      console.error('Error fetching student progress:', err);
      setError(err.response?.data?.message || "Failed to load student progress");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading student progress..." />;
  }

  if (error && !studentProgress) {
    return (
      <div className="text-center py-12">
        <ErrorDisplay error={error} onRetry={fetchStudentProgress} />
      </div>
    );
  }

  if (!studentProgress) {
    return (
      <div className="text-center py-12">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Progress Data</h3>
          <p className="text-gray-600">Student progress data will appear here once available.</p>
        </div>
      </div>
    );
  }

  const progressStats = [
    {
      label: "Overall Progress",
      value: studentProgress.progress?.overall || 0,
      color: "blue",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      label: "Quiz Progress",
      value: studentProgress.progress?.quizzes || 0,
      color: "green",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: "Resource Progress",
      value: studentProgress.progress?.resources || 0,
      color: "orange",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "Average Score",
      value: studentProgress.progress?.averageScore || 0,
      color: "purple",
      icon: <BarChart3 className="h-5 w-5" />,
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Student Progress</h2>
          <p className="text-gray-600">
            Tracking progress for {studentProgress.student?.firstName} {studentProgress.student?.lastName}
          </p>
        </div>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchStudentProgress} />}

      {/* Student Info */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {studentProgress.student?.firstName?.[0]}{studentProgress.student?.lastName?.[0]}
          </div>
          <div>
            <h3 className="text-xl font-bold">
              {studentProgress.student?.firstName} {studentProgress.student?.lastName}
            </h3>
            <p className="text-gray-600">Grade {studentProgress.student?.grade}</p>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {progressStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                stat.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {stat.icon}
              </div>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">{stat.label}</h4>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-gray-900">{stat.value}%</p>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    stat.color === 'blue' ? 'bg-blue-600' :
                    stat.color === 'green' ? 'bg-green-600' :
                    stat.color === 'orange' ? 'bg-orange-600' :
                    'bg-purple-600'
                  }`}
                  style={{ width: `${stat.value}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quiz Results */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-lg">Recent Quiz Results</h4>
            <span className="text-sm text-gray-600">
              {studentProgress.quizSubmissions?.length || 0} quizzes
            </span>
          </div>
          
          <div className="space-y-4">
            {studentProgress.quizSubmissions?.map((submission) => {
              const isPassed = submission.score >= (submission.quizId?.passingScore || 60);
              
              return (
                <div key={submission._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-800">{submission.quizId?.title || 'Quiz'}</h5>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isPassed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {isPassed ? "Passed" : "Needs Improvement"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-600">Score</span>
                      <p className={`text-lg font-bold ${
                        isPassed ? "text-green-600" : "text-red-600"
                      }`}>
                        {submission.score}%
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Passing</span>
                      <p className="text-lg font-bold text-gray-800">
                        {submission.quizId?.passingScore || 60}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(submission.completedAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
            
            {(!studentProgress.quizSubmissions || studentProgress.quizSubmissions.length === 0) && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No quiz results available</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Resources */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-lg">Completed Resources</h4>
            <span className="text-sm text-gray-600">
              {studentProgress.resourceCompletions?.length || 0} resources
            </span>
          </div>
          
          <div className="space-y-4">
            {studentProgress.resourceCompletions?.map((completion) => (
              <div key={completion._id} className="border rounded-lg p-4">
                <h5 className="font-semibold mb-2">{completion.resourceId?.title || 'Resource'}</h5>
                <p className="text-sm text-gray-600 mb-2">
                  Type: <span className="capitalize">{completion.resourceId?.type || 'unknown'}</span>
                </p>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{new Date(completion.completedAt).toLocaleDateString()}</span>
                  <span>{completion.timeSpent || 5} min</span>
                </div>
              </div>
            ))}
            
            {(!studentProgress.resourceCompletions || studentProgress.resourceCompletions.length === 0) && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No completed resources</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;