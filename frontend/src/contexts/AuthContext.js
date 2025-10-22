import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const extractErrorMessage = (err) => {
    // handle different error response formats
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail;
      // detail is an array of validation errors
      if (Array.isArray(detail)) {
        return detail;
      }
      // detail is a string
      if (typeof detail === 'string') {
        return detail;
      }
      // detail is an object
      return detail.msg || JSON.stringify(detail);
    }
    return err.message || 'An error occurred';
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.data.access_token);
      const userResponse = await authAPI.getCurrentUser();
      setUser(userResponse.data);
      return { success: true };
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      await authAPI.signup(userData);
      // auto login after signup
      return await login(userData.email, userData.password);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};