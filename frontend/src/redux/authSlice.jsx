// src/redux/authSlice.jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../utils/api.jsx';

// =================== Async Thunks ===================

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      console.log('✅ Login response:', data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('📤 Sending user registration:', userData);
      const { data } = await api.post('/auth/register', userData);
      console.log('✅ User registration response:', data);
      return data;
    } catch (error) {
      console.error('❌ User registration error:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

// Register tenant
export const registerTenant = createAsyncThunk(
  'auth/registerTenant',
  async (tenantData, { rejectWithValue }) => {
    try {
      console.log('📤 Sending tenant registration:', tenantData);
      const { data } = await api.post('/tenants/register', tenantData);
      console.log('✅ Tenant registration response:', data);
      return data;
    } catch (error) {
      console.error('❌ Tenant registration error:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: 'Tenant registration failed' });
    }
  }
);

// Get Current User (for reload persistence)
export const getCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user' });
    }
  }
);

// =================== Helpers ===================
const loadUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// =================== Slice ===================
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadUserFromStorage(),
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data?.user || action.payload.user || action.payload;
        state.token = action.payload.data?.token || action.payload.token;
        
        // Only store if we have actual data
        if (state.token) {
          localStorage.setItem('token', state.token);
        }
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      })

      // Register user
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle different response formats
        state.user = action.payload.data?.user || action.payload.user || action.payload;
        state.token = action.payload.data?.token || action.payload.token;
        
        // Only store if we have actual data
        if (state.token) {
          localStorage.setItem('token', state.token);
        }
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
      })

      // Register tenant - FIXED NAVIGATION ISSUE
      .addCase(registerTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerTenant.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Handle different response formats safely
        const responseData = action.payload.data || action.payload;
        
        if (responseData && responseData.user) {
          state.user = responseData.user;
          state.token = responseData.user.token || responseData.token;
          
          // Only store if we have valid user data
          if (state.user) {
            localStorage.setItem('user', JSON.stringify(state.user));
          }
          if (state.token) {
            localStorage.setItem('token', state.token);
          }
        } else {
          // If no user data in response, don't update state to prevent navigation
          console.warn('No user data in registration response');
        }
        
        state.error = null;
      })
      .addCase(registerTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Tenant registration failed';
      })

      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data?.user || action.payload.user || action.payload;
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        state.error = action.payload?.message || 'Failed to fetch user';
      });
  },
});

// =================== Exports ===================
export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;