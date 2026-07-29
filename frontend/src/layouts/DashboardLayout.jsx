import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from '../components/layout/Topbar/Topbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-primary)]">
      <Topbar />
      <div className="flex flex-1 max-w-[1920px] mx-auto w-full">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
