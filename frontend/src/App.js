import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import SkillAnalysis from './pages/SkillAnalysis';
import Mentor from './pages/Mentor';
import Jobs from './pages/Jobs';
import MyApplications from './pages/MyApplications';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCareers from './pages/AdminCareers';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminCoursesPage from './pages/AdminCoursesPage';
import AdminCompanies from './pages/AdminCompanies';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyJobs from './pages/CompanyJobs';
import CompanyCandidates from './pages/CompanyCandidates';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Company Route Component
const CompanyRoute = ({ children }) => {
  const { isAuthenticated, isCompany, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/company/login" replace />;
  }
  
  if (!isCompany) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isCompany, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    if (isCompany) return <Navigate to="/company/dashboard" replace />;
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><Register /></PublicRoute>
      } />
      <Route path="/company/login" element={
        <PublicRoute><Navigate to="/login" replace /></PublicRoute>
      } />
      
      {/* Protected Routes (Students) */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      <Route path="/recommendations" element={
        <ProtectedRoute><Recommendations /></ProtectedRoute>
      } />
      <Route path="/skills" element={
        <ProtectedRoute><SkillAnalysis /></ProtectedRoute>
      } />
      <Route path="/mentor" element={
        <ProtectedRoute><Mentor /></ProtectedRoute>
      } />
      <Route path="/jobs" element={
        <ProtectedRoute><Jobs /></ProtectedRoute>
      } />
      <Route path="/my-applications" element={
        <ProtectedRoute><MyApplications /></ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute><AdminUsers /></AdminRoute>
      } />
      <Route path="/admin/careers" element={
        <AdminRoute><AdminCareers /></AdminRoute>
      } />
      <Route path="/admin/analytics" element={
        <AdminRoute><AdminAnalytics /></AdminRoute>
      } />
      <Route path="/admin/courses" element={
        <AdminRoute><AdminCoursesPage /></AdminRoute>
      } />
      <Route path="/admin/companies" element={
        <AdminRoute><AdminCompanies /></AdminRoute>
      } />

      {/* Company Routes */}
      <Route path="/company/dashboard" element={
        <CompanyRoute><CompanyDashboard /></CompanyRoute>
      } />
      <Route path="/company/jobs" element={
        <CompanyRoute><CompanyJobs /></CompanyRoute>
      } />
      <Route path="/company/candidates" element={
        <CompanyRoute><CompanyCandidates /></CompanyRoute>
      } />

      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
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
