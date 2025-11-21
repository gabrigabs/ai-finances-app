
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import DetailedExpenses from './pages/DetailedExpenses';
import AiCopilot from './pages/AiCopilot';
import Groups from './pages/Groups';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import { FinancialProvider } from './context/FinancialContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <FinancialProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="expenses" element={<DetailedExpenses />} />
            <Route path="ai" element={<AiCopilot />} />
            <Route path="groups" element={<Groups />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </HashRouter>
    </FinancialProvider>
  );
};

export default App;
