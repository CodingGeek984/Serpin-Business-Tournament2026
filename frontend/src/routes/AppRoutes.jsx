import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

// Pages
import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Login/Login';
import Tools from '../pages/Tools/Tools';
import Promotions from '../pages/Promotions/Promotions';
import AIAssistant from '../pages/AIAssistant/AIAssistant';
import Customers from '../pages/Customers/Customers';
import Analytics from '../pages/Analytics/Analytics';
import Settings from '../pages/Settings/Settings';
import Admin from '../pages/Admin/Admin';

const NotFound = () => <div className="p-10 text-center text-xl">404 Not Found</div>;
const Placeholder = ({ name }) => <div className="p-10 text-center text-xl">{name} Page (Coming Soon)</div>;

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Dashboard routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/notifications" element={<Placeholder name="Notifications" />} />
          <Route path="/favorites" element={<Placeholder name="Favorites" />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
