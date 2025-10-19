import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Auth components
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';

// Dashboard
import Dashboard from './components/dashboard/Dashboard';

// Sightings
import SightingsList from './components/sightings/SightingsList';
import SightingForm from './components/sightings/SightingForm';

// Beach Reports
import BeachReportsList from './components/reports/BeachReportsList';
import BeachReportForm from './components/reports/BeachReportForm';

// Conservation Actions
import ActionsList from './components/conservation/ActionsList';
import ActionForm from './components/conservation/ActionForm';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component -> redirect if authenticated
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <SignupForm />
          </PublicRoute>
        } 
      />

      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Marine Sightings */}
      <Route 
        path="/sightings" 
        element={
          <ProtectedRoute>
            <SightingsList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/sightings/new" 
        element={
          <ProtectedRoute>
            <SightingForm />
          </ProtectedRoute>
        } 
      />

      {/* Beach Reports */}
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <BeachReportsList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports/new" 
        element={
          <ProtectedRoute>
            <BeachReportForm />
          </ProtectedRoute>
        } 
      />

      {/* Conservation Actions */}
      <Route 
        path="/actions" 
        element={
          <ProtectedRoute>
            <ActionsList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/actions/new" 
        element={
          <ProtectedRoute>
            <ActionForm />
          </ProtectedRoute>
        } 
      />

      {/* Default */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;