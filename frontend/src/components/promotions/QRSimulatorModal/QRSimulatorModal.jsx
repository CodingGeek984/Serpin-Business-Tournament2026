import React, { useState } from 'react';
import { X, QrCode, Smartphone, CheckCircle, Gift } from 'lucide-react';
import { useUser } from '../../../context/UserContext';
import { useNotification } from '../../../context/NotificationContext';
import Button from '../../common/Button/Button';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

const QRSimulatorModal = ({ isOpen, onClose, promo }) => {
  const { scanPromoQR } = useUser();
  const { addNotification } = useNotification();
  const [status, setStatus] = useState('idle'); // idle, scanning, success

  const handleScan = () => {
    setStatus('scanning');
    
    // Simulate network delay
    setTimeout(() => {
      scanPromoQR(promo.id);
      setStatus('success');
      addNotification('Сканирование прошло успешно!', 'success');
      
      // Reset after showing success
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 2500);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && promo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-white rounded-3xl overflow-hidden w-full max-w-[340px] shadow-2xl flex flex-col h-[650px] relative z-10"
          >
            {/* Smartphone Notch / Header */}
            <div className="bg-gray-100 h-8 flex justify-center items-center rounded-t-3xl border-b border-gray-200">
              <div className="w-16 h-4 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-10 right-4 p-2 bg-white/80 rounded-full shadow-sm hover:bg-gray-100 transition-all duration-150 active:scale-95 z-10"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Screen Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col p-6 items-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="w-12 h-12 bg-[var(--color-brand-blue)] rounded-xl flex items-center justify-center mb-6 shadow-sm"
              >
                <Smartphone className="w-6 h-6 text-white" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Экран покупателя</h3>
              <p className="text-sm text-center text-gray-500 mb-8">
                Наведите камеру на QR-код для получения {promo.type === 'stamp' ? 'штампа' : 'скидки'} по акции "{promo.title}"
              </p>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 w-full flex flex-col items-center justify-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div 
                      key="success"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <CheckCircle className="w-20 h-20 text-emerald-500 mb-4" />
                      <p className="font-bold text-emerald-600">Отсканировано!</p>
                    </motion.div>
                  ) : status === 'scanning' ? (
                    <motion.div 
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <div className="relative">
                        <QrCode className="w-32 h-32 text-gray-300" />
                        <motion.div 
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 w-full h-1 bg-[var(--color-brand-blue)] opacity-70 blur-[1px]"
                        />
                      </div>
                      <p className="mt-4 text-[var(--color-brand-blue)] font-medium animate-pulse">Обработка...</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <QrCode className="w-32 h-32 text-gray-800" />
                      <p className="mt-4 text-xs text-gray-400 font-mono">{promo.qrData || 'QR-123456789'}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-auto w-full flex flex-col gap-3">
                <Button 
                  className="w-full py-4 text-base shadow-sm"
                  onClick={handleScan}
                  disabled={status !== 'idle'}
                >
                  {status === 'idle' ? 'Эмулировать сканирование' : 'Подождите...'}
                </Button>
                
                {promo.type === 'stamp' && (
                  <div className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Карта лояльности</p>
                    <div className="flex justify-between">
                      {[1,2,3,4,5,6].map(i => (
                        <div 
                          key={i} 
                          className={twMerge(clsx(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-500",
                            status === 'success' && i === 1 
                              ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white scale-110" 
                              : "border-gray-200 text-gray-300 bg-gray-50"
                          ))}
                        >
                          {i === 6 ? <Gift className="w-4 h-4" /> : i}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QRSimulatorModal;
