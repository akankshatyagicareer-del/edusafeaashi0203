// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, registerTenant, clearError } from '../redux/authSlice.jsx';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.jsx';

const Register = () => {
  const [formType, setFormType] = useState('user');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    tenantId: '',
    grade: '',
    schoolName: '',
    studentId: '',
  });

  const [tenants, setTenants] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  // Handle successful registration navigation
  useEffect(() => {
    if (user && registrationSuccess) {
      console.log('Registration successful, navigating to dashboard...');
      const roleToPath = {
        director: '/director-dashboard',
        teacher: '/teacher-dashboard',
        student: '/student-dashboard',
        parent: '/parent-dashboard'
      };
      
      const timer = setTimeout(() => {
        navigate(roleToPath[user.role] || '/');
        setRegistrationSuccess(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, registrationSuccess, navigate]);

  // Fetch tenants for dropdown
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await api.get('/tenants/schools/list');
        setTenants(response.data.data || []);
      } catch (error) {
        console.error('Error fetching schools:', error);
        setTenants([]);
      }
    };
    
    fetchTenants();
  }, []);

  // Fetch REAL students from database when tenant is selected and role is parent
  useEffect(() => {
    const fetchStudents = async () => {
      if (formData.tenantId && formData.role === 'parent') {
        setLoadingStudents(true);
        try {
          console.log('Fetching students for tenant:', formData.tenantId);
          const response = await api.get(`/students?tenantId=${formData.tenantId}`);
          
          if (response.data.success) {
            setStudents(response.data.data || []);
            console.log(`Found ${response.data.count} students`);
          } else {
            console.error('Error in students response:', response.data.message);
            setStudents([]);
          }
        } catch (error) {
          console.error('Error fetching students:', error);
          setStudents([]);
        } finally {
          setLoadingStudents(false);
        }
      } else {
        setStudents([]);
        setFormData(prev => ({ ...prev, studentId: '' }));
      }
    };

    fetchStudents();
  }, [formData.tenantId, formData.role]);

  // Reset form when switching types
  useEffect(() => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      tenantId: '',
      grade: '',
      schoolName: '',
      studentId: '',
    });
    setStudents([]);
    dispatch(clearError());
  }, [formType, dispatch]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Reset studentId when role or tenant changes
    if (name === 'role' && value !== 'parent') {
      setFormData(prev => ({ ...prev, studentId: '' }));
    }
    if (name === 'tenantId') {
      setFormData(prev => ({ ...prev, studentId: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setRegistrationSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    // Validation for parent role
    if (formData.role === 'parent') {
      if (!formData.studentId) {
        alert('Please select a student to link with this parent account');
        return;
      }
      
      if (students.length === 0) {
        alert('No students found in the selected school. Please contact the school administrator.');
        return;
      }
    }

    try {
      if (formType === 'tenant') {
        // Tenant registration (New School)
        const tenantData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: 'director',
          schoolName: formData.schoolName,
          grade: formData.grade || ''
        };
        console.log('Sending tenant registration:', tenantData);
        const result = await dispatch(registerTenant(tenantData)).unwrap();
        
        if (result.success) {
          console.log('✅ Tenant registration successful');
          setRegistrationSuccess(true);
        }
      } else {
        // User registration (Join Existing School)
        if (!formData.tenantId) {
          alert('Please select a school');
          return;
        }

        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          tenantId: formData.tenantId,
          grade: formData.role === 'student' ? formData.grade : undefined,
          studentId: formData.role === 'parent' ? formData.studentId : undefined
        };
        
        console.log('Sending user registration:', userData);
        const result = await dispatch(register(userData)).unwrap();
        
        if (result.success) {
          console.log('✅ User registration successful');
          setRegistrationSuccess(true);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register for EduSafe</h2>

        {/* Switcher */}
        <div className="mb-6 flex">
          <button
            type="button"
            onClick={() => setFormType('user')}
            className={`w-1/2 py-2 ${
              formType === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Join Existing School
          </button>
          <button
            type="button"
            onClick={() => setFormType('tenant')}
            className={`w-1/2 py-2 ${
              formType === 'tenant' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Register New School
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {typeof error === 'string' ? error : 'Registration failed. Please try again.'}
          </div>
        )}

        {registrationSuccess && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            Registration successful! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Common user fields */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
              minLength="6"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {formType === 'user' ? (
            <>
              {/* Role Selection */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              {/* Tenant selection */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Select School/Institute</label>
                <select
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">-- Select School --</option>
                  {tenants.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade for students */}
              {formData.role === 'student' && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Grade/Class</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                    placeholder="e.g., 10th Grade"
                  />
                </div>
              )}

              {/* Student selection for parents */}
              {formData.role === 'parent' && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Select Student {loadingStudents && '(Loading...)'}
                  </label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                    disabled={loadingStudents}
                  >
                    <option value="">-- Select Student --</option>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.firstName} {student.lastName} 
                          {student.grade ? ` - ${student.grade}` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {loadingStudents ? 'Loading students...' : 'No students found in this school'}
                      </option>
                    )}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {students.length > 0 
                      ? `Select the student you are a parent of (${students.length} students found)`
                      : 'No students registered in this school yet. Students must register first.'
                    }
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Tenant registration fields */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">School/Institute Name</label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                  placeholder="Enter your school name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Your Role</label>
                <select
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                  disabled
                >
                  <option value="director">School Director/Administrator</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  You will be registered as the school director
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;