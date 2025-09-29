// src/redux/store.jsx
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.jsx';
import userReducer from './userSlice.jsx';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
});
