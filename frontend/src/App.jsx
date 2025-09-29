import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LoadingSpinner from './components/LoadingSpinner';
import { clearError, getCurrentUser } from './redux/authSlice';

// Lazy load pages for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));

// Import dashboard index files
const DirectorDashboard = React.lazy(() => import('./pages/DirectorDashboard'));
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard'));
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const ParentDashboard = React.lazy(() => import('./pages/ParentDashboard'));

function App() {
  const { user, token, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(clearError());
    }
  }, [user, dispatch]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-300"></div>
        
        <div className="text-center relative z-10">
          <div className="glass rounded-3xl p-8 shadow-large">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-slate-600 font-medium text-lg">Loading EduSafe</p>
            <p className="text-slate-400 text-sm">Safety & Education Platform</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Enhanced animated background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-200"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-300"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20"></div>
        </div>
        
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="glass rounded-3xl p-8">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        }>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                !user ? <Login /> : <Navigate to={`/${user.role}-dashboard`} replace />
              }
            />
            <Route
              path="/register"
              element={
                !user ? <Register /> : <Navigate to={`/${user.role}-dashboard`} replace />
              }
            />

            {/* Protected Routes */}
            <Route
              path="/director-dashboard/*"
              element={
                user && user.role === 'director'
                  ? <DirectorDashboard />
                  : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/teacher-dashboard/*"
              element={
                user && user.role === 'teacher'
                  ? <TeacherDashboard />
                  : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/student-dashboard/*"
              element={
                user && user.role === 'student'
                  ? <StudentDashboard />
                  : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/parent-dashboard/*"
              element={
                user && user.role === 'parent'
                  ? <ParentDashboard />
                  : <Navigate to="/login" replace />
              }
            />

            {/* Default Route */}
            <Route
              path="/"
              element={
                user
                  ? <Navigate to={`/${user.role}-dashboard`} replace />
                  : <Navigate to="/login" replace />
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center p-4">
                  <div className="glass rounded-3xl p-8 shadow-large text-center max-w-md">
                    <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl text-white font-bold">404</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
                    <p className="text-slate-600 mb-6">The page you're looking for doesn't exist.</p>
                    <Navigate to="/" replace />
                  </div>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;