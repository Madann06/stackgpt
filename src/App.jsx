import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CompanyAnalysis from './pages/CompanyAnalysis';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard Layout Routes */}
          <Route path="/dashboard" element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          } />
          
          <Route path="/company" element={
            <DashboardLayout>
              <CompanyAnalysis />
            </DashboardLayout>
          } />
          
          <Route path="/company/:symbol" element={
            <DashboardLayout>
              <CompanyAnalysis />
            </DashboardLayout>
          } />
          
          {/* Catch-all */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
