import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Users, Mail, Phone, BookOpen, BarChart3, Eye, MessageCircle } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classProgress, setClassProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [studentsRes, progressRes] = await Promise.all([
        api.get(`/teachers/${user._id}/students`),
        api.get(`/progress/class`)
      ]);

      setStudents(studentsRes.data || []);
      setClassProgress(progressRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const sendMessageToStudent = async (studentId, studentName) => {
    const message = prompt(`Enter message for ${studentName}:`);
    if (message) {
      try {
        setError(null);
        await api.post('/messages', {
          receiverId: studentId,
          subject: 'Message from Teacher',
          message: message
        });
        alert(`Message sent to ${studentName} successfully!`);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to send message");
      }
    }
  };

  const viewStudentDetails = async (student) => {
    try {
      setError(null);
      // Fetch detailed student information using the new user endpoint
      const response = await api.get(`/users/${student._id}`);
      setSelectedStudent({
        ...student,
        details: response.data
      });
      setShowStudentDetails(true);
    } catch (err) {
      setError("Failed to load student details. Student details feature not fully implemented.");
    }
  };

  const getStudentProgress = (studentId) => {
    const progress = classProgress.find(p => p.student && p.student._id === studentId);
    return progress ? {
      quizScore: progress.progress?.averageScore || 0,
      resourcesCompleted: progress.completedResources || 0,
      attendance: progress.progress?.overall || 0
    } : {
      quizScore: 0,
      resourcesCompleted: 0,
      attendance: 0
    };
  };

  if (loading) {
    return <LoadingSpinner text="Loading students..." />;
  }

  const filteredStudents = students.filter(student => {
    if (activeTab === "all") return true;
    const progress = getStudentProgress(student._id);
    if (activeTab === "active") return progress.attendance > 80;
    if (activeTab === "needsAttention") return progress.quizScore < 60;
    return true;
  });

  const classStats = {
    totalStudents: students.length,
    passingQuizzes: students.filter(s => getStudentProgress(s._id).quizScore >= 60).length,
    avgAttendance: students.length > 0 
      ? Math.round(students.reduce((acc, s) => acc + getStudentProgress(s._id).attendance, 0) / students.length)
      : 0,
    activeLearners: students.filter(s => getStudentProgress(s._id).resourcesCompleted > 5).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Student Management</h2>
          <p className="text-gray-600">Manage and monitor student progress</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-2xl font-bold">{students.length}</p>
        </div>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchStudents} />}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "all", label: "All Students", count: students.length },
            { id: "active", label: "Active", count: students.filter(s => getStudentProgress(s._id).attendance > 80).length },
            { id: "needsAttention", label: "Needs Attention", count: students.filter(s => getStudentProgress(s._id).quizScore < 60).length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => {
          const progress = getStudentProgress(student._id);
          
          return (
            <div key={student._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {student.firstName?.[0]}{student.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg truncate">
                    {student.firstName} {student.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">Grade {student.grade}</p>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <BookOpen className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <span className="text-xs font-medium">Quiz Score</span>
                  <div className={`text-sm font-bold ${
                    progress.quizScore >= 60 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {progress.quizScore}%
                  </div>
                </div>
                <div className="text-center">
                  <BarChart3 className="h-4 w-4 mx-auto mb-1 text-green-600" />
                  <span className="text-xs font-medium">Resources</span>
                  <div className="text-sm font-bold text-gray-800">
                    {progress.resourcesCompleted}
                  </div>
                </div>
                <div className="text-center">
                  <Users className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                  <span className="text-xs font-medium">Progress</span>
                  <div className={`text-sm font-bold ${
                    progress.attendance >= 80 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {progress.attendance}%
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => sendMessageToStudent(student._id, `${student.firstName} ${student.lastName}`)}
                  className="btn btn-outline text-sm flex-1 flex items-center justify-center"
                  title="Send message to student"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </button>
                <button 
                  onClick={() => viewStudentDetails(student)}
                  className="btn btn-primary text-sm flex-1 flex items-center justify-center"
                  title="View student details"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </button>
              </div>
            </div>
          );
        })}
        
        {filteredStudents.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {activeTab === "all" 
                ? "No students assigned to your class" 
                : `No students match the "${activeTab}" filter`
              }
            </p>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Student Details</h3>
                <button
                  onClick={() => setShowStudentDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                    {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h4>
                    <p className="text-gray-600">Grade {selectedStudent.grade}</p>
                    {selectedStudent.details?.email && (
                      <p className="text-sm text-gray-500">{selectedStudent.details.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {getStudentProgress(selectedStudent._id).quizScore}%
                    </div>
                    <div className="text-sm text-gray-600">Quiz Score</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {getStudentProgress(selectedStudent._id).resourcesCompleted}
                    </div>
                    <div className="text-sm text-gray-600">Resources Completed</div>
                  </div>
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => {
                      setShowStudentDetails(false);
                      sendMessageToStudent(selectedStudent._id, `${selectedStudent.firstName} ${selectedStudent.lastName}`);
                    }}
                    className="btn btn-primary w-full"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Summary */}
      {students.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Class Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{classStats.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{classStats.passingQuizzes}</div>
              <div className="text-sm text-gray-600">Passing Quizzes</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{classStats.avgAttendance}%</div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{classStats.activeLearners}</div>
              <div className="text-sm text-gray-600">Active Learners</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;