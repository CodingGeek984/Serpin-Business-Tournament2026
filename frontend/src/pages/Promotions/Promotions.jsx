import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import PromotionCard from '../../components/promotions/PromotionCard/PromotionCard';
import Button from '../../components/common/Button/Button';
import { Plus, Filter, QrCode } from 'lucide-react';
import PromotionWizard from '../../components/promotions/PromotionWizard/PromotionWizard';
import QRSimulatorModal from '../../components/promotions/QRSimulatorModal/QRSimulatorModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Promotions = () => {
  const { promotions } = useUser();
  const [showWizard, setShowWizard] = useState(false);
  const [qrModalData, setQrModalData] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, paused
  const [showFilters, setShowFilters] = useState(false);

  const filteredPromotions = promotions.filter(p => {
    if (filter === 'active') return p.status === 'active';
    if (filter === 'paused') return p.status === 'paused';
    return true;
  });

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Мои Акции</h1>
          <p className="text-sm text-gray-500 mt-1">Управляйте маркетинговыми кампаниями и спецпредложениями</p>
        </div>
        {!showWizard && (
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4" />
              Фильтры
            </Button>
            <Button className="gap-2 shadow-sm" onClick={() => setShowWizard(true)}>
              <Plus className="w-4 h-4" />
              Создать акцию
            </Button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showFilters && !showWizard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 overflow-hidden"
          >
            {[
              { id: 'all', label: 'Все' },
              { id: 'active', label: 'Активные' },
              { id: 'paused', label: 'Остановленные' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === tab.id ? "bg-white shadow-sm text-gray-900 border border-gray-200" : "text-gray-500 hover:bg-gray-100"}`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showWizard ? (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <PromotionWizard
              onComplete={() => setShowWizard(false)}
              onCancel={() => setShowWizard(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-2"
          >
            {filteredPromotions.map(promo => (
              <motion.div key={promo.id} variants={itemVariants} layout className="relative group">
                <PromotionCard promotion={promo} />

                {/* Quick action to test QR */}
                {promo.status === 'active' && (
                  <div className="absolute top-4 right-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setQrModalData(promo)}
                      className="bg-[var(--color-bg-primary)] p-2 rounded-full hover:bg-[var(--color-brand-blue)] hover:text-white text-[var(--color-brand-blue)] transition-all duration-200 active:scale-90 shadow-sm border border-blue-100"
                      title="Тестировать как клиент"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}

            {filteredPromotions.length === 0 && (
              <motion.div variants={itemVariants} className="col-span-full py-12 text-center text-gray-500">
                {filter === 'all' ? 'У вас пока нет ни одной акции.' : 'Нет акций с выбранным статусом.'}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <QRSimulatorModal
        isOpen={!!qrModalData}
        onClose={() => setQrModalData(null)}
        promo={qrModalData}
      />
    </motion.div>
  );
};

export default Promotions;
