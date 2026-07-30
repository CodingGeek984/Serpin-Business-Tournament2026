import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Home, Wrench, Tag, Users, BarChart2, BrainCircuit, Bell, Star, Settings, Database } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args) => twMerge(clsx(args));

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Главная', icon: Home },
  { path: '/tools-catalog', label: 'Каталог решений', icon: Tag },
  { path: '/business-tools', label: 'Бизнес-инструменты', icon: Wrench },
  { path: '/promotions', label: 'Мои Акции', icon: Tag },
  { path: '/gamification', label: 'Геймификация', icon: Star },
  { path: '/customers', label: 'Клиенты', icon: Users },
  { path: '/analytics', label: 'Аналитика', icon: BarChart2 },
  { path: '/ai-assistant', label: 'AI Ассистент', icon: BrainCircuit },
  { path: '/notifications', label: 'Уведомления', icon: Bell },
  { path: '/favorites', label: 'Избранное', icon: Star },
  { path: '/settings', label: 'Настройки', icon: Settings },
  { path: '/admin', label: 'Админ-панель', icon: Database },
];

const Sidebar = () => {
  const { user } = useAuth();
  const items = user?.role === 'admin' ? NAV_ITEMS : NAV_ITEMS.filter((item) => item.path !== '/admin');
  return (
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-64 p-3 hidden md:flex flex-col bg-transparent">
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-2 pb-4">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
              isActive
                ? "bg-blue-50 text-[var(--color-brand-blue)]"
                : "text-[var(--color-text-primary)] hover:bg-[var(--color-hover-bg)]"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5",
              // isActive ? "text-[var(--color-brand-blue)]" : "text-gray-500"
            )} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer link in Sidebar */}
      <div className="mt-auto pt-4 text-xs text-gray-500 px-3">
        Serpin Business &copy; 2026
      </div>
    </aside>
  );
};

export default Sidebar;
