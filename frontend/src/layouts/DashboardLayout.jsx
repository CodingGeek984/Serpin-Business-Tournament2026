import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from '../components/layout/Topbar/Topbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import OnboardingModal from '../components/common/OnboardingModal';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { business } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Missing flag is treated as incomplete for profiles created before onboarding.
    if (business && business.is_onboarding_completed !== true) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [business]);

  useEffect(() => {
    const openOnboarding = () => setShowOnboarding(true);
    window.addEventListener('onboarding:open', openOnboarding);
    return () => window.removeEventListener('onboarding:open', openOnboarding);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-primary)]">
      <Topbar />
      <div className="flex flex-1 max-w-[1920px] mx-auto w-full relative">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden min-w-0">
          <Outlet />
        </main>
      </div>
      
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </div>
  );
};

export default DashboardLayout;
