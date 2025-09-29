import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Plus, BookOpen, X, Save, Trash2, BarChart3, Users, Award, Clock, Image, Video } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    questions: [{ 
      question: "", 
      options: ["", "", "", ""], 
      correctAnswer: 0,
      media: { type: "none", url: "" } // NEW: Added media field
    }],
    timeLimit: 30,
    passingScore: 60,
    category: "general", // NEW: Added disaster category
    xpReward: 100 // NEW: Added XP reward
  });

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      fetchQuizzes();
    }
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teachers/${user._id}/quizzes`);
      setQuizzes(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const viewQuizResults = async (quiz) => {
    try {
      setResultsLoading(true);
      setError(null);
      setSelectedQuiz(quiz);
      
      const [submissionsRes, leaderboardRes] = await Promise.all([
        api.get(`/quizzes/submissions/${quiz._id}`),
        api.get(`/quizzes/leaderboard/${quiz._id}`)
      ]);

      setQuizSubmissions(submissionsRes.data || []);
      setLeaderboard(leaderboardRes.data || []);
      setShowResults(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load quiz results");
    } finally {
      setResultsLoading(false);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await api.post(`/quizzes`, newQuiz);
      setShowQuizForm(false);
      setNewQuiz({
        title: "",
        description: "",
        questions: [{ 
          question: "", 
          options: ["", "", "", ""], 
          correctAnswer: 0,
          media: { type: "none", url: "" }
        }],
        timeLimit: 30,
        passingScore: 60,
        category: "general",
        xpReward: 100
      });
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz");
    }
  };

  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, { 
        question: "", 
        options: ["", "", "", ""], 
        correctAnswer: 0,
        media: { type: "none", url: "" }
      }],
    });
  };

  const removeQuestion = (index) => {
    setNewQuiz({
      ...newQuiz,
      questions: newQuiz.questions.filter((_, i) => i !== index),
    });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...newQuiz.questions];
    updated[index][field] = value;
    setNewQuiz({ ...newQuiz, questions: updated });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...newQuiz.questions];
    updated[qIndex].options[oIndex] = value;
    setNewQuiz({ ...newQuiz, questions: updated });
  };

  // NEW: Update question media
  const updateQuestionMedia = (qIndex, mediaField, value) => {
    const updated = [...newQuiz.questions];
    updated[qIndex].media = {
      ...updated[qIndex].media,
      [mediaField]: value
    };
    setNewQuiz({ ...newQuiz, questions: updated });
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      setError(null);
      await api.delete(`/quizzes/${quizId}`);
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete quiz");
    }
  };

  const calculateStats = () => {
    if (quizSubmissions.length === 0) {
      return {
        averageScore: 0,
        passingRate: 0,
        totalSubmissions: 0,
        bestScore: 0
      };
    }

    const totalScore = quizSubmissions.reduce((sum, sub) => sum + sub.score, 0);
    const averageScore = Math.round(totalScore / quizSubmissions.length);
    const passingSubmissions = quizSubmissions.filter(sub => sub.score >= (selectedQuiz.passingScore || 60));
    const passingRate = Math.round((passingSubmissions.length / quizSubmissions.length) * 100);
    const bestScore = Math.max(...quizSubmissions.map(sub => sub.score));

    return {
      averageScore,
      passingRate,
      totalSubmissions: quizSubmissions.length,
      bestScore
    };
  };

  // NEW: Get media icon based on type
  const getMediaIcon = (type) => {
    switch (type) {
      case 'gif': return <Image className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return null;
    }
  };

  // NEW: Disaster categories for dropdown
  const disasterCategories = [
    { value: "general", label: "General Safety" },
    { value: "earthquake", label: "Earthquake" },
    { value: "flood", label: "Flood" },
    { value: "fire", label: "Fire" },
    { value: "tornado", label: "Tornado" },
    { value: "tsunami", label: "Tsunami" }
  ];

  if (loading) {
    return <LoadingSpinner text="Loading quizzes..." />;
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Quiz Management</h2>
          <p className="text-gray-600">Create and manage gamified quizzes for students</p>
        </div>
        <button 
          onClick={() => setShowQuizForm(true)} 
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Quiz
        </button>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchQuizzes} />}

      {/* Quiz Form Modal */}
      {showQuizForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Create New Quiz</h3>
                <button
                  onClick={() => setShowQuizForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleQuizSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Quiz Title</label>
                  <input
                    type="text"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                    className="form-input"
                    placeholder="Enter quiz title"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={newQuiz.description}
                    onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                    className="form-input"
                    rows="3"
                    placeholder="Enter quiz description"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={newQuiz.timeLimit}
                      onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: parseInt(e.target.value) })}
                      className="form-input"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Passing Score (%)</label>
                    <input
                      type="number"
                      value={newQuiz.passingScore}
                      onChange={(e) => setNewQuiz({ ...newQuiz, passingScore: parseInt(e.target.value) })}
                      className="form-input"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">XP Reward</label>
                    <input
                      type="number"
                      value={newQuiz.xpReward}
                      onChange={(e) => setNewQuiz({ ...newQuiz, xpReward: parseInt(e.target.value) })}
                      className="form-input"
                      min="0"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Disaster Category</label>
                  <select
                    value={newQuiz.category}
                    onChange={(e) => setNewQuiz({ ...newQuiz, category: e.target.value })}
                    className="form-input"
                  >
                    {disasterCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="form-label">Questions</label>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="btn btn-outline text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {newQuiz.questions.map((q, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Question {i + 1}</h4>
                          {newQuiz.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(i)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Question Text</label>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => updateQuestion(i, "question", e.target.value)}
                            className="form-input"
                            placeholder="Enter question"
                            required
                          />
                        </div>

                        {/* NEW: Media Section */}
                        <div className="mb-3">
                          <label className="form-label">Question Media (Optional)</label>
                          <div className="space-y-2">
                            <select
                              value={q.media.type}
                              onChange={(e) => updateQuestionMedia(i, "type", e.target.value)}
                              className="form-input"
                            >
                              <option value="none">No Media</option>
                              <option value="gif">GIF Animation</option>
                              <option value="image">Static Image</option>
                              <option value="video">Video</option>
                            </select>
                            
                            {(q.media.type === 'gif' || q.media.type === 'image' || q.media.type === 'video') && (
                              <input
                                type="url"
                                value={q.media.url}
                                onChange={(e) => updateQuestionMedia(i, "url", e.target.value)}
                                className="form-input"
                                placeholder={`Enter ${q.media.type} URL (e.g., https://example.com/media.gif)`}
                              />
                            )}
                            
                            {q.media.url && q.media.type !== 'none' && (
                              <div className="text-xs text-blue-600 flex items-center">
                                {getMediaIcon(q.media.type)}
                                <span className="ml-1">Media URL added</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="form-label">Options</label>
                          {q.options.map((opt, j) => (
                            <input
                              key={j}
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(i, j, e.target.value)}
                              className="form-input"
                              placeholder={`Option ${j + 1}`}
                              required
                            />
                          ))}
                        </div>

                        <div className="mt-3">
                          <label className="form-label">Correct Answer</label>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => updateQuestion(i, "correctAnswer", parseInt(e.target.value))}
                            className="form-input"
                            required
                          >
                            {q.options.map((_, j) => (
                              <option key={j} value={j}>
                                Option {j + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowQuizForm(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Create Quiz
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Results Modal */}
      {showResults && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Quiz Results: {selectedQuiz.title}</h3>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {resultsLoading ? (
                <LoadingSpinner text="Loading results..." />
              ) : (
                <div className="space-y-6">
                  {/* Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</div>
                      <div className="text-sm text-gray-600">Total Submissions</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{stats.passingRate}%</div>
                      <div className="text-sm text-gray-600">Passing Rate</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.bestScore}%</div>
                      <div className="text-sm text-gray-600">Best Score</div>
                    </div>
                  </div>

                  {/* Leaderboard */}
                  {leaderboard.length > 0 && (
                    <div className="card">
                      <h4 className="text-lg font-semibold mb-4 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-yellow-600" />
                        Leaderboard
                      </h4>
                      <div className="space-y-2">
                        {leaderboard.slice(0, 5).map((student, index) => (
                          <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0 ? 'bg-yellow-500' : 
                                index === 1 ? 'bg-gray-400' : 
                                index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                              }`}>
                                {index + 1}
                              </div>
                              <span>{student.firstName} {student.lastName}</span>
                            </div>
                            <div className="text-lg font-bold">{student.bestScore}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submissions List */}
                  <div className="card">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Student Submissions ({quizSubmissions.length})
                    </h4>
                    <div className="space-y-3">
                      {quizSubmissions.map((submission) => (
                        <div key={submission._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {submission.studentId?.firstName} {submission.studentId?.lastName}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              submission.score >= (selectedQuiz.passingScore || 60) 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {submission.score}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Submitted: {new Date(submission.completedAt).toLocaleDateString()}</span>
                            <span>Time Taken: {Math.floor(submission.timeTaken / 60)}:{(submission.timeTaken % 60).toString().padStart(2, '0')}</span>
                          </div>
                        </div>
                      ))}
                      
                      {quizSubmissions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p>No submissions yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6">Your Quizzes ({quizzes.length})</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => {
            const questionsWithMedia = quiz.questions?.filter(q => q.media && q.media.type !== 'none').length || 0;
            
            return (
              <div key={quiz._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg">{quiz.title}</h4>
                  {quiz.category && quiz.category !== 'general' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                      {quiz.category}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span>{quiz.questions?.length || 0} questions</span>
                      {questionsWithMedia > 0 && (
                        <span className="flex items-center text-blue-600">
                          <Image className="h-3 w-3 mr-1" />
                          {questionsWithMedia} with media
                        </span>
                      )}
                    </div>
                    <span>{quiz.timeLimit} mins • {quiz.xpReward || 100} XP</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="btn btn-outline text-xs flex-1">Edit</button>
                  <button 
                    onClick={() => viewQuizResults(quiz)}
                    className="btn btn-primary text-xs flex-1"
                  >
                    View Results
                  </button>
                  <button 
                    onClick={() => deleteQuiz(quiz._id)}
                    className="btn btn-danger text-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {quizzes.length === 0 && (
            <div className="col-span-full text-center py-8">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No quizzes created yet</p>
              <button 
                onClick={() => setShowQuizForm(true)}
                className="btn btn-primary mt-2"
              >
                Create Your First Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizManagement;