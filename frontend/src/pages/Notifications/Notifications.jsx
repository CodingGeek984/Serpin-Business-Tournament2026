import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Bell, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAll } = useNotification();

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Уведомления</h1>
          <p className="text-sm text-gray-500 mt-1">Входящие события и история оповещений</p>
        </div>
        <div className="flex gap-4">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-sm text-[var(--color-brand-blue)] hover:underline font-medium"
            >
              Прочитать все
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={deleteAll}
              className="text-sm text-red-500 hover:underline font-medium"
            >
              Очистить историю
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">У вас нет уведомлений</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div 
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer group ${
                  notification.is_read 
                    ? 'bg-white border-gray-100' 
                    : 'bg-blue-50/50 border-blue-100 shadow-sm'
                }`}
              >
                <div className="mt-1">
                  {notification.is_read ? (
                    <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm sm:text-base font-medium truncate ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notification.title || 'Уведомление'}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">{notification.message}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
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
                  <Trash2 className="w-4 h-4" />
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
