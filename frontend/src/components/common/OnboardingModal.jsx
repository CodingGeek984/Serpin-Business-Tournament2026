import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CarFront, Check, Coffee, Scissors, Shirt } from 'lucide-react';
import api from '../../services/api';
import Button from './Button/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import toast from 'react-hot-toast';

const businessTypes = [
  { id: 'coffee_shop', icon: Coffee, title: 'Кофейня', description: 'Кафе, кофейня или пекарня' },
  { id: 'beauty_salon', icon: Scissors, title: 'Салон красоты', description: 'Салон, барбершоп, студия' },
  { id: 'retail', icon: Shirt, title: 'Магазин одежды', description: 'Розничный магазин' },
  { id: 'auto_service', icon: CarFront, title: 'Услуги / Сервис', description: 'Автосервис и другие услуги' },
];

const goals = [
  { id: 'new_customers', title: 'Привлечь новых клиентов' },
  { id: 'loyalty', title: 'Повысить повторные продажи' },
  { id: 'increase_average_check', title: 'Увеличить средний чек' },
];

const sizes = [
  { id: 'single_location', title: '1 точка' },
  { id: 'two_to_five_locations', title: '2–5 точек' },
  { id: 'chain', title: 'Сеть' },
];

const OnboardingModal = ({ isOpen, onClose, onCompleted }) => {
  const { business, updateBusiness } = useAuth();
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState('');
  const [primaryGoals, setPrimaryGoals] = useState([]);
  const [businessSize, setBusinessSize] = useState('single_location');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setBusinessType(business?.business_type || '');
    setPrimaryGoals(business?.primary_goals || []);
    setBusinessSize(business?.business_size || 'single_location');
  }, [isOpen, business]);

  const toggleGoal = (goal) => setPrimaryGoals((current) => (
    current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]
  ));

  const complete = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/onboarding', {
        business_type: businessType,
        primary_goals: primaryGoals,
        business_size: businessSize,
      });
      const updated = response.data?.data || response.data || response;
      updateBusiness(updated);
      window.dispatchEvent(new Event('recommendations:refresh'));
      
      toast.success('Настройка завершена — ваш план роста готов!');
      
      onCompleted?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Не удалось сохранить настройки');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  const canContinue = step === 1 ? Boolean(businessType) : primaryGoals.length > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-7 text-white">
            <p className="text-sm font-medium text-blue-100">Шаг {step} из 3</p>
            <h2 className="mt-1 text-2xl font-bold">{step === 1 ? 'Расскажите о бизнесе' : step === 2 ? 'Выберите цель роста' : 'Почти готово!'}</h2>
            <p className="mt-2 text-sm text-blue-100">Это поможет подобрать инструменты и готовые акции именно для вас.</p>
          </div>
          <div className="p-7">
            {step === 1 && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{businessTypes.map(({ id, icon: Icon, title, description }) => <button key={id} type="button" onClick={() => setBusinessType(id)} className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${businessType === id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}><Icon className="h-7 w-7 text-blue-600" /><span><b className="block text-slate-900">{title}</b><small className="text-slate-500">{description}</small></span>{businessType === id && <Check className="ml-auto h-5 w-5 text-blue-600" />}</button>)}</div>}
            {step === 2 && <div className="space-y-3">{goals.map((goal) => <button key={goal.id} type="button" onClick={() => toggleGoal(goal.id)} className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left font-medium transition ${primaryGoals.includes(goal.id) ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-100 text-slate-700 hover:border-blue-200'}`}>{goal.title}{primaryGoals.includes(goal.id) && <Check className="h-5 w-5 text-blue-600" />}</button>)}<p className="text-xs text-slate-500">Можно выбрать несколько целей.</p></div>}
            {step === 3 && <div><p className="mb-4 text-slate-700">Сколько у вас точек? Мы учтём масштаб бизнеса в плане роста.</p><div className="grid grid-cols-3 gap-3">{sizes.map((size) => <button key={size.id} type="button" onClick={() => setBusinessSize(size.id)} className={`rounded-xl border-2 px-2 py-4 font-semibold transition ${businessSize === size.id ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-100 text-slate-700'}`}>{size.title}</button>)}</div></div>}
            <div className="mt-7 flex gap-3">
              {step > 1 && <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>Назад</Button>}
              {step < 3 ? <Button className="flex-1" disabled={!canContinue} onClick={() => setStep(step + 1)}>Продолжить</Button> : <Button className="flex-1" disabled={isLoading} onClick={complete}>{isLoading ? 'Сохраняем...' : 'Завершить настройку и получить план роста'}</Button>}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingModal;
