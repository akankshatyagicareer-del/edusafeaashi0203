import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { BookOpen, Clock, Award, Play } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [quizzesRes, submissionsRes] = await Promise.all([
        api.get('/quizzes'),
        api.get(`/students/${user._id}/quiz-submissions`)
      ]);

      setQuizzes(quizzesRes.data || []);
      setQuizSubmissions(submissionsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const takeQuiz = (quizId) => {
    // Navigate to the quiz taking interface
    navigate(`/student-dashboard/quizzes/${quizId}/take`);
  };

  const getQuizSubmission = (quizId) => {
    return quizSubmissions.find(sub => sub.quizId === quizId || sub.quizId?._id === quizId);
  };

  const getScoreColor = (score, passingScore = 60) => {
    if (score >= passingScore) return 'text-green-600';
    if (score >= passingScore - 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <LoadingSpinner text="Loading quizzes..." />;
  }

  const availableQuizzes = quizzes.filter(quiz => !getQuizSubmission(quiz._id));
  const completedQuizzes = quizzes.filter(quiz => getQuizSubmission(quiz._id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Quizzes & Tests</h2>
          <p className="text-gray-600">Test your knowledge and track your progress</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Average Score</p>
          <p className="text-2xl font-bold">
            {completedQuizzes.length > 0 
              ? Math.round(completedQuizzes.reduce((acc, quiz) => {
                  const submission = getQuizSubmission(quiz._id);
                  return acc + (submission?.score || 0);
                }, 0) / completedQuizzes.length) 
              : 0
            }%
          </p>
        </div>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchData} />}

      {/* Available Quizzes */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6">Available Quizzes ({availableQuizzes.length})</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableQuizzes.map((quiz) => (
            <div key={quiz._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  New
                </span>
              </div>

              <h4 className="font-semibold text-lg mb-2">{quiz.title}</h4>
              <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {quiz.timeLimit} mins
                </div>
                <span>{quiz.questions?.length || 0} questions</span>
              </div>

              <button
                onClick={() => takeQuiz(quiz._id)}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Quiz
              </button>
            </div>
          ))}
          
          {availableQuizzes.length === 0 && (
            <div className="col-span-full text-center py-8">
              <Award className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500">No new quizzes available</p>
              <p className="text-sm text-gray-400">Great job! You've completed all available quizzes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Quizzes */}
      {completedQuizzes.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Quiz Results ({completedQuizzes.length})</h3>
          
          <div className="space-y-4">
            {completedQuizzes.map((quiz) => {
              const submission = getQuizSubmission(quiz._id);
              const isPassed = submission?.score >= (quiz.passingScore || 60);
              
              return (
                <div key={quiz._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg">{quiz.title}</h4>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isPassed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-600">Your Score</span>
                      <p className={`text-lg font-bold ${getScoreColor(submission?.score, quiz.passingScore)}`}>
                        {submission?.score}%
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Passing Score</span>
                      <p className="text-lg font-bold text-gray-800">{quiz.passingScore || 60}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Completed</span>
                      <p className="text-sm text-gray-800">
                        {new Date(submission?.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="btn btn-outline text-sm flex-1">Review Answers</button>
                    <button 
                      onClick={() => takeQuiz(quiz._id)}
                      className="btn btn-primary text-sm flex-1"
                    >
                      Retake Quiz
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Summary */}
      {completedQuizzes.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{completedQuizzes.length}</div>
              <div className="text-sm text-gray-600">Quizzes Taken</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {completedQuizzes.filter(quiz => {
                  const submission = getQuizSubmission(quiz._id);
                  return submission?.score >= (quiz.passingScore || 60);
                }).length}
              </div>
              <div className="text-sm text-gray-600">Quizzes Passed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(completedQuizzes.reduce((acc, quiz) => {
                  const submission = getQuizSubmission(quiz._id);
                  return acc + (submission?.score || 0);
                }, 0) / completedQuizzes.length)}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.max(...completedQuizzes.map(quiz => {
                  const submission = getQuizSubmission(quiz._id);
                  return submission?.score || 0;
                }))}%
              </div>
              <div className="text-sm text-gray-600">Best Score</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quizzes;