import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../context/NotificationContext';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotification();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Format date nicely
  const formatDate = (isoString) => {
    if (!isoString) return 'Только что';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + 
           date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  const getIconColor = (type) => {
    switch(type) {
      case 'success': return 'text-green-500 bg-green-100';
      case 'warning': return 'text-yellow-500 bg-yellow-100';
      case 'error': return 'text-red-500 bg-red-100';
      default: return 'text-blue-500 bg-blue-100';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="p-2 rounded-full bg-[var(--color-bg-primary)] hover:bg-[var(--color-hover-bg)] transition-colors relative block"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-800">Уведомления</h3>
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {unreadCount} новых
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 flex flex-col items-center">
                  <Bell className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm">Нет новых уведомлений</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.slice(0, 5).map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 transition-colors hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className={`text-sm font-medium text-gray-900 truncate pr-2 ${!notification.is_read ? 'font-semibold' : ''}`}>
                              {notification.title || 'Уведомление'}
                            </p>
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex gap-2 mt-2">
                            {!notification.is_read && (
                              <button 
                                onClick={(e) => { e.preventDefault(); markAsRead(notification.id); }}
                                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
                              >
                                <Check className="h-3 w-3" /> Прочитано
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.preventDefault(); deleteNotification(notification.id); }}
                              className="text-xs flex items-center gap-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-3 w-3" /> Удалить
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Link 
              to="/notifications" 
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-3 border-t border-gray-100 text-sm text-blue-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Смотреть все уведомления
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
