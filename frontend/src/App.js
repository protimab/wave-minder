import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// authentication
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';

// dashboard
import Dashboard from './components/dashboard/Dashboard';

// sightings
import SightingsList from './components/sightings/SightingsList';
import SightingForm from './components/sightings/SightingForm';

// beach reports
import BeachReportsList from './components/reports/BeachReportsList';
import BeachReportForm from './components/reports/BeachReportForm';

// conversations actions
import ActionsList from './components/conservation/ActionsList';
import ActionForm from './components/conservation/ActionForm';

//ocean 
import OceanDataDashboard from './components/ocean/OceanDataDashboard';

//analytics 
import AnalyticsDashboard from 'components/analytics/AnalyticsDashboard';

import './App.css';

// protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// public route component -> redirect if authenticated
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
      {/* public routes */}
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

      {/* protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* marine Sightings */}
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

      {/* beach reports */}
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

      {/* conservation actions */}
      <Route 
        path="/actions" 
        element={
          <ProtectedRoute>
            <ActionsList />
          </ProtectedRoute>
        } 
      />

      {/* ocean DB */}
      <Route 
        path="/ocean-data" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-8">
              <div className="max-w-7xl mx-auto">
                <OceanDataDashboard 
                  latitude={32.8509} 
                  longitude={-117.2713} 
                  locationName="La Jolla Cove" 
                />
              </div>
            </div>
          </ProtectedRoute>
        } 
      />

      {/* analytics */}
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8">
                  Community Analytics
                </h1>
                <AnalyticsDashboard />
              </div>
            </div>
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

      {/* default */}
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