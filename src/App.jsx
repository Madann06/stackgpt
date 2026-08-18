import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserFeaturesProvider } from './context/UserFeaturesContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import Dashboard from './pages/Dashboard';
import CompanyAnalysis from './pages/CompanyAnalysis';
import DashboardLayout from './components/layout/DashboardLayout';

import Markets from './pages/Markets';
import Screener from './pages/Screener';
import Heatmap from './pages/Heatmap';
import TopPerformers from './pages/TopPerformers';
import Sectors from './pages/Sectors';
import IPO from './pages/IPO';
import News from './pages/News';
import Regulations from './pages/Regulations';
import MutualFunds from './pages/MutualFunds';
import AIResearch from './pages/AIResearch';
import Settings from './pages/Settings';
import Wishlist from './pages/Wishlist';
import History from './pages/History';
import Calculator from './pages/Calculator';

function App() {
  return (
    <AuthProvider>
      <UserFeaturesProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          
            {/* Protected Application Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/markets" element={<ProtectedRoute><DashboardLayout><Markets /></DashboardLayout></ProtectedRoute>} />
            <Route path="/screener" element={<ProtectedRoute><DashboardLayout><Screener /></DashboardLayout></ProtectedRoute>} />
            <Route path="/heatmap" element={<ProtectedRoute><DashboardLayout><Heatmap /></DashboardLayout></ProtectedRoute>} />
            <Route path="/performers" element={<ProtectedRoute><DashboardLayout><TopPerformers /></DashboardLayout></ProtectedRoute>} />
            <Route path="/sectors" element={<ProtectedRoute><DashboardLayout><Sectors /></DashboardLayout></ProtectedRoute>} />
            <Route path="/ipo" element={<ProtectedRoute><DashboardLayout><IPO /></DashboardLayout></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute><DashboardLayout><News /></DashboardLayout></ProtectedRoute>} />
            <Route path="/regulations" element={<ProtectedRoute><DashboardLayout><Regulations /></DashboardLayout></ProtectedRoute>} />
            <Route path="/funds" element={<ProtectedRoute><DashboardLayout><MutualFunds /></DashboardLayout></ProtectedRoute>} />
            <Route path="/funds/:fundId" element={<ProtectedRoute><DashboardLayout><MutualFunds /></DashboardLayout></ProtectedRoute>} />
            <Route path="/ai-research" element={<ProtectedRoute><DashboardLayout><AIResearch /></DashboardLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><DashboardLayout><Wishlist /></DashboardLayout></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><DashboardLayout><History /></DashboardLayout></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><DashboardLayout><Calculator /></DashboardLayout></ProtectedRoute>} />
            
            <Route path="/company" element={<ProtectedRoute><DashboardLayout><CompanyAnalysis /></DashboardLayout></ProtectedRoute>} />
            <Route path="/company/:symbol" element={<ProtectedRoute><DashboardLayout><CompanyAnalysis /></DashboardLayout></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </UserFeaturesProvider>
    </AuthProvider>
  );
}

export default App;
