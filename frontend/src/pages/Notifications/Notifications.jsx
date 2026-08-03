import React, { useState, useMemo } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Bell, CheckCircle2, Clock, Trash2, Zap, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'all', label: 'Все', icon: Bell },
  { id: 'smart', label: 'Умные', icon: Zap },
  { id: 'alerts', label: 'Оповещения', icon: AlertTriangle },
  { id: 'system', label: 'Системные', icon: Info }
];

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAll } = useNotification();
  const [activeTab, setActiveTab] = useState('all');

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'error':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (activeTab === 'alerts') {
      filtered = filtered.filter(n => n.type === 'error' || n.type === 'warning');
    } else if (activeTab === 'system') {
      filtered = filtered.filter(n => n.type !== 'error' && n.type !== 'warning');
    } else if (activeTab === 'smart') {
      // Smart sort: Unread first, then Errors > Success > Others
      filtered.sort((a, b) => {
        if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
        const weight = { error: 3, warning: 2, success: 1, info: 0 };
        return (weight[b.type] || 0) - (weight[a.type] || 0);
      });
    }

    return filtered;
  }, [notifications, activeTab]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Центр уведомлений</h1>
          <p className="text-sm text-gray-500 mt-1">Входящие события, умная сортировка и история</p>
        </div>
        <div className="flex gap-4 items-center">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-sm text-[var(--color-brand-blue)] hover:underline font-medium transition-colors"
            >
              Прочитать все ({unreadCount})
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={deleteAll}
              className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              Очистить историю
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl mb-6 overflow-x-auto hide-scrollbar">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-white text-[var(--color-brand-blue)] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--color-brand-blue)]' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {filteredNotifications.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Нет уведомлений</h3>
          <p className="text-gray-500">
            {activeTab === 'all' 
              ? 'У вас пока нет новых уведомлений.' 
              : 'В этой категории пусто.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notification) => (
              <motion.div 
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                transition={{ duration: 0.2 }}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group hover:shadow-md ${
                  notification.is_read 
                    ? 'bg-white border-gray-100' 
                    : 'bg-blue-50/40 border-blue-200 shadow-sm'
                }`}
              >
                <div className="mt-1 flex-shrink-0">
                  {notification.is_read ? (
                    getIconForType(notification.type)
                  ) : (
                    <div className="relative">
                      {getIconForType(notification.type)}
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-sm sm:text-base font-semibold truncate ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notification.title || 'Уведомление'}
                    </h4>
                    <span className="text-[10px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                      {notification.type || 'info'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 line-clamp-2 ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {notification.created_at ? new Date(notification.created_at).toLocaleString('ru-RU', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    }) : 'Только что'}
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDelete(e, notification.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Удалить уведомление"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Notifications;

