import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../../utils/api';
import { Clock, CheckCircle, XCircle, ArrowLeft, Award, Play, Pause } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null); // CHANGED: Start as null instead of 0
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NEW: GIF animation state
  const [isGifPlaying, setIsGifPlaying] = useState(true);
  // NEW: Track if quiz has started
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  // CHANGED: Simplified timer effect - only start when quizStarted is true
  useEffect(() => {
    let timer;
    
    if (quizStarted && timeLeft > 0 && !submissionResult) {
      timer = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStarted, timeLeft, submissionResult]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/quizzes/${quizId}`);
      setQuiz(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Function to start the quiz - FIXED timer initialization
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setError(null);
    // Initialize timer with the actual quiz time limit
    setTimeLeft(quiz.timeLimit * 60);
  };

  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = { questionIndex, selectedAnswer };
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsGifPlaying(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setIsGifPlaying(true);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      const timeTaken = quiz.timeLimit * 60 - timeLeft;
      const response = await api.post(`/quizzes/${quizId}/submit`, {
        answers,
        timeTaken
      });
      setSubmissionResult(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestionMedia = () => {
    const question = quiz.questions[currentQuestion];
    if (!question?.media || question.media.type === 'none') return null;
    
    return {
      type: question.media.type,
      url: question.media.url,
      resourceId: question.media.resourceId
    };
  };

  const currentMedia = quiz ? getCurrentQuestionMedia() : null;

  if (loading) {
    return <LoadingSpinner text="Loading quiz..." />;
  }

  if (error && !quizStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="card">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Quiz</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/student-dashboard/quizzes')}
              className="btn btn-primary"
            >
              Back to Quizzes
            </button>
            <button
              onClick={fetchQuiz}
              className="btn btn-outline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="card">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Quiz Not Found</h2>
          <p className="text-gray-600 mb-6">The requested quiz could not be loaded.</p>
          <button
            onClick={() => navigate('/student-dashboard/quizzes')}
            className="btn btn-primary"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="card text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Award className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-gray-600 mb-6">{quiz.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600 mx-auto mb-1" />
              <div className="font-semibold">{quiz.timeLimit} min</div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-gray-600 mx-auto mb-1" />
              <div className="font-semibold">{quiz.passingScore || 60}%</div>
              <div className="text-sm text-gray-600">Passing Score</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="h-6 w-6 text-gray-600 mx-auto mb-1 font-bold">?</div>
              <div className="font-semibold">{quiz.questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="h-6 w-6 text-gray-600 mx-auto mb-1 font-bold">⚡</div>
              <div className="font-semibold">Interactive</div>
              <div className="text-sm text-gray-600">GIF Content</div>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="btn btn-primary w-full py-3 text-lg"
          >
            Start Quiz
          </button>

          <button
            onClick={() => navigate('/student-dashboard/quizzes')}
            className="btn btn-outline w-full mt-3"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (submissionResult) {
    const isPassed = submissionResult.score >= (quiz.passingScore || 60);
    const correctAnswers = submissionResult.answers.filter(a => a.isCorrect).length;
    
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            isPassed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isPassed ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold mt-4">Quiz Submitted!</h2>
          <p className="text-gray-600 mt-2">
            {isPassed ? 'Congratulations! You passed the quiz.' : 'Keep practicing! You can try again.'}
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{submissionResult.score}%</div>
              <div className="text-sm text-gray-600">Your Score</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{correctAnswers}/{quiz.questions.length}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(submissionResult.timeTaken / 60)}:{(submissionResult.timeTaken % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => navigate('/student-dashboard/quizzes')}
              className="btn btn-primary"
            >
              Back to Quizzes
            </button>
            {!isPassed && (
              <button
                onClick={() => {
                  setQuizStarted(false);
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setTimeLeft(null);
                  setSubmissionResult(null);
                  setError(null);
                }}
                className="btn btn-outline"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const isAnswered = answers[currentQuestion] !== undefined;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setQuizStarted(false)}
          className="btn btn-outline flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit Quiz
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4 mr-1" />
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="card mb-6">
        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Time Limit: {quiz.timeLimit} minutes</span>
          <span>Passing Score: {quiz.passingScore || 60}%</span>
          <span>Questions: {quiz.questions.length}</span>
          {quiz.category && quiz.category !== 'general' && (
            <span className="capitalize">Disaster: {quiz.category}</span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 text-sm mt-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {currentMedia && currentMedia.type === 'gif' && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Interactive Content</h3>
            <button
              onClick={() => setIsGifPlaying(!isGifPlaying)}
              className="btn btn-outline text-sm flex items-center"
            >
              {isGifPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isGifPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
            <img 
              src={currentMedia.url} 
              alt="Quiz question visual aid"
              className="max-w-full max-h-64 object-contain rounded"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            This GIF helps illustrate the disaster scenario for this question
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          {currentQ.question}
        </h3>
        
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion, index)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                answers[currentQuestion]?.selectedAnswer === index
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                  answers[currentQuestion]?.selectedAnswer === index
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300'
                }`}>
                  {answers[currentQuestion]?.selectedAnswer === index && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                {option}
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {isLastQuestion ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={!isAnswered || isSubmitting}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={!isAnswered}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Question
            </button>
          )}
        </div>
      </div>

      {/* Question Navigation Dots */}
      <div className="flex justify-center space-x-2 mt-6">
        {quiz.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentQuestion(index);
              setIsGifPlaying(true);
            }}
            className={`w-3 h-3 rounded-full ${
              index === currentQuestion
                ? 'bg-blue-600'
                : answers[index]
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
            title={`Question ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TakeQuiz;