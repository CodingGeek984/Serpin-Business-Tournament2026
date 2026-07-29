import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { useNotification } from '../../context/NotificationContext';
import { Smartphone, Check, Coffee, Gift, Percent, Star, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const iconOptions = [
  { id: 'coffee', icon: Coffee, label: 'Кофе' },
  { id: 'star', icon: Star, label: 'Звезда' },
  { id: 'gift', icon: Gift, label: 'Подарок' },
  { id: 'percent', icon: Percent, label: 'Скидка' },
];

const GamificationBuilder = () => {
  const { addNotification } = useNotification();
  const [config, setConfig] = useState({
    name: '10-й кофе в подарок',
    stampCount: 6,
    icon: 'coffee',
    rewardDescription: 'Бесплатный капучино или американо',
    color: '#0ea5e9' // brand blue
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addNotification('Программа лояльности успешно сохранена', 'success');
    }, 1000);
  };

  const SelectedIcon = iconOptions.find(i => i.id === config.icon)?.icon || Coffee;

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Штамп-карты</h1>
        <p className="text-sm text-gray-500 mt-1">Настройте визуальный вид и правила вашей программы лояльности</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Builder Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="border-0 shadow-sm ring-1 ring-gray-100">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Edit3 className="w-5 h-5 text-gray-400" />
                Настройка внешнего вида
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название программы</label>
                <input 
                  type="text" 
                  value={config.name} 
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none transition-all"
                  placeholder="Например: 10-й кофе в подарок"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Количество штампов для подарка</label>
                <div className="flex gap-2">
                  {[5, 6, 8, 10, 12].map(num => (
                    <button
                      key={num}
                      onClick={() => setConfig({...config, stampCount: num})}
                      className={twMerge(clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all",
                        config.stampCount === num 
                          ? "bg-[var(--color-brand-blue)] text-white shadow-md scale-105" 
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      ))}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Иконка штампа</label>
                <div className="flex gap-3">
                  {iconOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setConfig({...config, icon: option.id})}
                        className={twMerge(clsx(
                          "w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                          config.icon === option.id
                            ? "bg-blue-50 border-2 border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]"
                            : "bg-white border-2 border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50"
                        ))}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание подарка (для клиента)</label>
                <textarea 
                  value={config.rewardDescription} 
                  onChange={(e) => setConfig({...config, rewardDescription: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none transition-all resize-none h-24"
                  placeholder="Что получит клиент, когда соберет все штампы?"
                />
              </div>
              
              <div className="pt-4 flex justify-end border-t border-gray-100">
                <Button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5">
                  {isSaving ? 'Сохранение...' : 'Опубликовать'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Live Preview (Smartphone mockup) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[340px] h-[680px] bg-gray-900 rounded-[2.5rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden ring-1 ring-gray-200/50">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 z-20 rounded-b-xl w-32 mx-auto"></div>
            
            {/* Screen Content */}
            <div className="w-full h-full bg-gray-50 flex flex-col relative z-10 pt-10">
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center font-bold text-gray-900">
                    Л
                  </div>
                  <div className="text-sm font-medium text-gray-500">Ваш Бизнес</div>
                </div>

                <motion.div 
                  layout
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
                >
                  <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">{config.name}</h3>
                  <p className="text-sm text-gray-500 mb-6">{config.rewardDescription}</p>

                  {/* Stamp Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <AnimatePresence mode="popLayout">
                      {Array.from({ length: config.stampCount }).map((_, i) => (
                        <motion.div
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                          key={i}
                          className={twMerge(clsx(
                            "aspect-square rounded-full border-2 flex items-center justify-center transition-all",
                            i < 3 // Show 3 collected stamps for preview
                              ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white"
                              : i === config.stampCount - 1
                                ? "border-dashed border-gray-300 bg-gray-50 text-gray-300"
                                : "border-gray-200 bg-white text-gray-200"
                          ))}
                        >
                          {i === config.stampCount - 1 ? (
                            <Gift className="w-6 h-6" />
                          ) : (
                            <SelectedIcon className="w-6 h-6" />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="mt-6 bg-blue-50/50 rounded-xl p-3 text-sm text-[var(--color-brand-blue)] font-medium">
                    Осталось {config.stampCount - 3} покупок до подарка
                  </div>
                </motion.div>

                {/* QR Code trigger mockup */}
                <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Показать QR-код</div>
                      <div className="text-xs text-gray-500">Для начисления штампа</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Nav Mockup */}
              <div className="mt-auto bg-white border-t border-gray-100 flex justify-around p-4 pb-6">
                 <div className="w-6 h-6 rounded bg-gray-200"></div>
                 <div className="w-6 h-6 rounded bg-[var(--color-brand-blue)]"></div>
                 <div className="w-6 h-6 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationBuilder;
