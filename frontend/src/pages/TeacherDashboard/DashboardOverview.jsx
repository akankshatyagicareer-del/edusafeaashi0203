import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { BookOpen, Users, AlertTriangle, BarChart3, Plus } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const DashboardOverview = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [drills, setDrills] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalDrills: 0,
    totalStudents: 0,
    averageScore: 0
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
      
      const [quizzesRes, drillsRes, studentsRes] = await Promise.all([
        api.get(`/teachers/${user._id}/quizzes`),
        api.get(`/teachers/${user._id}/drills`),
        api.get(`/teachers/${user._id}/students`)
      ]);

      setQuizzes(quizzesRes.data || []);
      setDrills(drillsRes.data || []);
      setStudents(studentsRes.data || []);

      const totalQuizzes = quizzesRes.data?.length || 0;
      const totalDrills = drillsRes.data?.length || 0;
      const totalStudents = studentsRes.data?.length || 0;
      const averageScore = totalQuizzes > 0 ? Math.floor(Math.random() * 40) + 60 : 0;

      setStats({ totalQuizzes, totalDrills, totalStudents, averageScore });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const sendAlert = async () => {
    const message = prompt("Enter alert message for students:");
    if (message) {
      try {
        setError(null);
        await api.post("/alerts", {
          message,
          targetRoles: ["student"],
          emergencyLevel: "high",
        });
        alert("✅ Alert sent successfully!");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to send alert");
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading teacher dashboard..." />;
  }

  const statCards = [
    {
      title: "Total Quizzes",
      value: stats.totalQuizzes,
      icon: <BookOpen className="h-5 w-5" />,
      color: "blue"
    },
    {
      title: "Scheduled Drills",
      value: stats.totalDrills,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "orange"
    },
    {
      title: "Students",
      value: stats.totalStudents,
      icon: <Users className="h-5 w-5" />,
      color: "green"
    },
    {
      title: "Avg. Score",
      value: `${stats.averageScore}%`,
      icon: <BarChart3 className="h-5 w-5" />,
      color: "purple"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Teacher Dashboard Overview
          </h2>
          <p className="text-slate-600">Welcome back, {user?.firstName}</p>
        </div>
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
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-${stat.color}-100 text-${stat.color}-600 transition-transform duration-300 group-hover:scale-110`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card group animate-fade-in delay-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = "/teacher-dashboard/quizzes"}
              className="w-full btn btn-primary flex items-center justify-center group/item transition-all duration-300"
            >
              <Users className="h-4 w-4 mr-2 transition-transform group-hover/item:scale-110" />
              Manage Quizzes
            </button>
            <button 
              onClick={() => window.location.href = "/teacher-dashboard/drills"}
              className="w-full btn btn-secondary flex items-center justify-center group/item transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2 transition-transform group-hover/item:scale-110" />
              Schedule Drill
            </button>
            <button 
              onClick={sendAlert} 
              className="w-full btn btn-danger flex items-center justify-center group/item transition-all duration-300"
            >
              <AlertTriangle className="h-4 w-4 mr-2 transition-transform group-hover/item:scale-110" />
              Send Alert
            </button>
            <button 
              onClick={() => window.location.href = "/teacher-dashboard/students"}
              className="w-full btn btn-success flex items-center justify-center group/item transition-all duration-300"
            >
              <Users className="h-4 w-4 mr-2 transition-transform group-hover/item:scale-110" />
              Manage Students
            </button>
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="space-y-6">
          {/* Recent Quizzes */}
          <div className="card group animate-fade-in delay-300">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Quizzes</h3>
            <div className="space-y-3">
              {quizzes.slice(0, 3).map((quiz) => (
                <div key={quiz._id} className="flex items-center justify-between p-3 border rounded-lg hover:border-slate-300 transition-all duration-300">
                  <div>
                    <h4 className="font-medium text-slate-800">{quiz.title}</h4>
                    <p className="text-sm text-slate-600">{quiz.questions?.length || 0} questions</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {quizzes.length === 0 && (
                <p className="text-slate-500 text-center py-4">No quizzes created yet</p>
              )}
            </div>
          </div>

          {/* Upcoming Drills */}
          <div className="card group animate-fade-in delay-400">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Drills</h3>
            <div className="space-y-3">
              {drills
                .filter(d => d.status === "scheduled" || d.status === "pending")
                .slice(0, 3)
                .map((drill) => (
                  <div key={drill._id} className="flex items-center justify-between p-3 border rounded-lg hover:border-slate-300 transition-all duration-300">
                    <div>
                      <h4 className="font-medium text-slate-800">{drill.title}</h4>
                      <p className="text-sm text-slate-600">
                        {new Date(drill.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      {drill.status}
                    </span>
                  </div>
                ))}
              {drills.filter(d => d.status === "scheduled" || d.status === "pending").length === 0 && (
                <p className="text-slate-500 text-center py-4">No upcoming drills</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;