import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Toast = ({ message, type, id, onRemove }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={twMerge(clsx(
        "flex items-center gap-3 px-4 py-3 bg-white shadow-lg rounded-xl border mb-3 pointer-events-auto",
        type === 'success' ? "border-emerald-100" : type === 'error' ? "border-red-100" : "border-blue-100"
      ))}
    >
      {getIcon()}
      <p className="text-sm font-medium text-gray-800">{message}</p>
      <button 
        onClick={() => onRemove(id)}
        className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <Toast 
            key={notification.id} 
            id={notification.id}
            message={notification.message} 
            type={notification.type} 
            onRemove={removeNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
