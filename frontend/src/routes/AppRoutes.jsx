import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

// Pages
import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Login/Login';
import Tools from '../pages/Tools/Tools';
import BusinessToolsPage from '../pages/BusinessTools/BusinessToolsPage';
import Promotions from '../pages/Promotions/Promotions';
import AIAssistant from '../pages/AIAssistant/AIAssistant';
import Customers from '../pages/Customers/Customers';
import CustomerProfile from '../pages/Customers/CustomerProfile';
import Analytics from '../pages/Analytics/Analytics';
import Settings from '../pages/Settings/Settings';
import Admin from '../pages/Admin/Admin';
import GamificationBuilder from '../pages/Gamification/GamificationBuilder';
import Notifications from '../pages/Notifications/Notifications';
import Favorites from '../pages/Favorites/Favorites';
import Landing from '../pages/Landing/Landing';

const NotFound = () => <div className="p-10 text-center text-xl">404 Not Found</div>;
const Placeholder = ({ name }) => <div className="p-10 text-center text-xl">{name} Page (Coming Soon)</div>;

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading auth...</div>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  const location = useLocation();
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Dashboard routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/tools-catalog" element={<PageTransition><Tools /></PageTransition>} />
            <Route path="/business-tools" element={<PageTransition><BusinessToolsPage /></PageTransition>} />
            <Route path="/promotions" element={<PageTransition><Promotions /></PageTransition>} />
            <Route path="/ai-assistant" element={<PageTransition><AIAssistant /></PageTransition>} />
            <Route path="/customers" element={<PageTransition><Customers /></PageTransition>} />
            <Route path="/customers/:id" element={<PageTransition><CustomerProfile /></PageTransition>} />
            <Route path="/gamification" element={<PageTransition><GamificationBuilder /></PageTransition>} />
            <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
            <Route path="/admin" element={<AdminRoute><PageTransition><Admin /></PageTransition></AdminRoute>} />
            <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
            <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
          </Route>

          <Route path="/" element={<Landing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

export default AppRoutes;
