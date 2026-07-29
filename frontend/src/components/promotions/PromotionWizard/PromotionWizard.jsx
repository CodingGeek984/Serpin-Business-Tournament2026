import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import { useUser } from '../../../context/UserContext';
import { useNotification } from '../../../context/NotificationContext';
import { Check, ChevronRight, Ticket, Tag, Clock, Send } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const TYPE_ICONS = {
  discount: Tag,
  stamp: Ticket,
  time_discount: Clock,
  winback: Send
};

const PromotionWizard = ({ onComplete, onCancel }) => {
  const { promoTemplates, addPromotion } = useUser();
  const { addNotification } = useNotification();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    typeId: null,
    title: '',
    budget: 0,
    endDate: ''
  });

  const selectedTemplate = promoTemplates.find(t => t.id === formData.typeId);

  const handleNext = () => {
    if (step === 1 && !formData.typeId) return;
    if (step === 2 && !formData.title) return;
    setStep(s => s + 1);
  };

  const handlePrev = () => setStep(s => s - 1);

  const handleCreate = async () => {
    try {
      await addPromotion({
      title: formData.title,
      type: selectedTemplate.type,
      status: 'active',
      views: 0,
      conversions: 0,
      budget: Number(formData.budget) || 0,
      spent: 0,
      endDate: formData.endDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      qrData: `promo_new_${Date.now()}`
      });
      addNotification('Акция создана', 'success');
      onComplete();
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  return (
    <Card className="max-w-3xl mx-auto border-blue-100 shadow-lg">
      <CardHeader className="bg-blue-50/50 flex-col items-start border-b border-blue-100 p-6">
        <CardTitle className="text-xl mb-4">Создание новой акции</CardTitle>
        {/* Progress Bar */}
        <div className="w-full flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-[var(--color-brand-blue)] -z-10 -translate-y-1/2 transition-all duration-300"
            style={{ width: `${(step - 1) * 50}%` }}
          ></div>
          
          {[1, 2, 3].map(i => (
            <div key={i} className={twMerge(clsx(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white transition-colors",
              step >= i ? "bg-[var(--color-brand-blue)] text-white" : "bg-gray-200 text-gray-500"
            ))}>
              {step > i ? <Check className="w-4 h-4" /> : i}
            </div>
          ))}
        </div>
        <div className="w-full flex justify-between text-xs text-gray-500 mt-2 font-medium">
          <span>Шаблон</span>
          <span>Настройка</span>
          <span>Запуск</span>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-4">Выберите механику акции</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promoTemplates.map(tpl => {
                  const Icon = TYPE_ICONS[tpl.type] || Tag;
                  const isSelected = formData.typeId === tpl.id;
                  
                  return (
                    <div 
                      key={tpl.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, typeId: tpl.id, title: tpl.title, budget: tpl.defaultBudget }));
                      }}
                      className={twMerge(clsx(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 hover:shadow-md active:scale-95 duration-150",
                        isSelected 
                          ? "border-[var(--color-brand-blue)] bg-blue-50/30 ring-4 ring-blue-50" 
                          : "border-gray-100 hover:border-gray-200"
                      ))}
                    >
                      <div className={twMerge(clsx(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected ? "bg-[var(--color-brand-blue)] text-white" : "bg-gray-100 text-gray-500"
                      ))}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{tpl.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{tpl.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="max-w-lg mx-auto"
            >
              <h3 className="text-lg font-semibold mb-6">Настройте параметры</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название (видят клиенты)</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent transition-shadow outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Бюджет продвижения (₸)</label>
                    <input 
                      type="number"
                      value={formData.budget}
                      onChange={e => setFormData({...formData, budget: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] transition-shadow outline-none"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Оставьте 0, если акция без платного промо</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Действует до</label>
                    <input 
                      type="date"
                      value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)] transition-shadow outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center py-4"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4"
              >
                <Check className="w-8 h-8" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Всё готово к запуску!</h3>
              <p className="text-gray-500 text-sm text-center max-w-md mb-8">
                Ваша акция <b>"{formData.title}"</b> будет добавлена в систему. QR-код будет сгенерирован автоматически, и клиенты сразу смогут им воспользоваться.
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full max-w-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Тип</span>
                  <span className="text-sm font-medium">{selectedTemplate?.title}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Бюджет</span>
                  <span className="text-sm font-medium">{formData.budget > 0 ? `${formData.budget} ₸` : 'Бесплатно'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Срок</span>
                  <span className="text-sm font-medium">{formData.endDate || 'Не ограничен'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
          <Button variant="ghost" onClick={step === 1 ? onCancel : handlePrev}>
            {step === 1 ? 'Отмена' : 'Назад'}
          </Button>
          
          <Button 
            onClick={step === 3 ? handleCreate : handleNext}
            disabled={step === 1 && !formData.typeId}
            className="min-w-[120px]"
          >
            {step === 3 ? 'Запустить акцию' : (
              <span className="flex items-center">Далее <ChevronRight className="w-4 h-4 ml-1" /></span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromotionWizard;
