import { createSlice } from '@reduxjs/toolkit';

// Safe localStorage access for SSR
const getStorageItem = (key) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setStorageItem = (key, value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeStorageItem = (key) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: getStorageItem('token') || null,
    isAuthenticated: !!getStorageItem('token'),
    loading: false,
    error: null
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      setStorageItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      removeStorageItem('token');
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { loginSuccess, logout, clearError } = authSlice.actions;
export default authSlice.reducer;