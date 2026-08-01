import React from 'react';
import { Search, Bell, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { Link } from 'react-router-dom';

import NotificationBell from './NotificationBell';

const Topbar = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-[#161224]/90 backdrop-blur-xl px-4 shadow-sm border-b border-[#bb9af7]/20">
      {/* Left section: Logo and Search */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="text-xl font-bold text-[var(--color-brand-blue)]">Serpin</div>
        <div className="hidden md:flex items-center bg-[var(--color-bg-primary)] rounded-full px-3 py-1.5 w-full max-w-sm">
          <Search className="h-4 w-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Поиск..." 
            className="bg-transparent border-none outline-none ml-2 text-sm w-full"
          />
        </div>
      </div>

      {/* Middle section: Navigation Icons (FB style) */}
      <div className="hidden md:flex items-center justify-center gap-2 w-1/3">
        {/* We can add center tabs here later if needed */}
      </div>

      {/* Right section: Actions and Profile */}
      <div className="flex items-center justify-end gap-2 w-1/3">
        <button className="p-2 rounded-full bg-[var(--color-bg-primary)] hover:bg-[var(--color-hover-bg)] transition-colors relative">
          <MessageCircle className="h-5 w-5 text-gray-700" />
        </button>
        <NotificationBell />
        <Link to="/settings" className="ml-2 flex items-center gap-2 cursor-pointer p-1 pr-3 rounded-full hover:bg-[var(--color-bg-primary)] transition-colors">
          <img 
            src={user?.avatar || 'https://i.pravatar.cc/150'} 
            alt="Profile" 
            className="h-8 w-8 rounded-full border border-gray-200"
          />
          <span className="text-sm font-medium hidden lg:block">{user?.name || user?.full_name || 'Профиль'}</span>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
