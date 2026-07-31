import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Settings, Play, BarChart, ChevronRight, Activity } from 'lucide-react';
import Button from '../common/Button/Button';
import { useNavigate } from 'react-router-dom';

const BusinessToolWizard = ({ onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    title: 'Летняя распродажа',
    discount_type: 'percent',
    discount_value: 15,
    base_customers_per_month: 200,
    avg_check: 3000
  });

  const [simulation, setSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const runSimulation = async () => {
      setIsSimulating(true);
      try {
        const res = await api.post('/business-tools/simulate', {
          tool_type: 'promotion',
          config: config
        });
        setSimulation(res.data.data || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSimulating(false);
      }
    };
    
    const timeoutId = setTimeout(() => runSimulation(), 500);
    return () => clearTimeout(timeoutId);
  }, [config.discount_value, config.base_customers_per_month, config.avg_check]);

  const handleLaunch = async () => {
    try {
      await api.post('/business-tools/launch', {
        tool_type: 'promotion',
        config: config
      });
      import('react-hot-toast').then(({ default: toast }) => {
        toast.success('Инструмент успешно запущен!', { duration: 3000 });
      });
      if (onComplete) {
        onComplete();
      } else {
        navigate('/business-tools');
      }
    } catch (err) {
      alert('Ошибка при запуске инструмента');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
      {/* Left side */}
      <div className="flex flex-col gap-6 border-r border-gray-100 pr-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Мастер запуска: Акция</h2>
          <p className="text-sm text-gray-500">Шаг {step} из 2</p>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <label className="block text-sm font-medium text-gray-700">Название акции</label>
            <input 
              type="text" 
              value={config.title}
              onChange={e => setConfig({...config, title: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
            />
            
            <label className="block text-sm font-medium text-gray-700 mt-2">Тип скидки</label>
            <select 
              value={config.discount_type}
              onChange={e => setConfig({...config, discount_type: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] bg-white"
            >
              <option value="percent">Процент (%)</option>
              <option value="fixed">Фиксированная сумма (₸)</option>
              <option value="bonus">Начисление бонусов</option>
            </select>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Размер скидки: <span className="text-blue-600 font-bold">{config.discount_value}%</span>
            </label>
            <input 
              type="range" 
              min="0" max="50" step="1"
              value={config.discount_value}
              onChange={e => setConfig({...config, discount_value: parseInt(e.target.value)})}
              className="w-full accent-[var(--color-brand-blue)]"
            />

            <label className="block text-sm font-medium text-gray-700 mt-4">Средний чек (₸)</label>
            <input 
              type="number" 
              value={config.avg_check}
              onChange={e => setConfig({...config, avg_check: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
            />
          </div>
        )}

        <div className="mt-auto pt-6 flex justify-between">
          <Button 
            variant="outline"
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
          >
            Назад
          </Button>
          
          {step < 2 ? (
            <Button onClick={() => setStep(s => s + 1)}>
              Далее <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleLaunch} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Play className="w-4 h-4 mr-2" /> Запустить акцию
            </Button>
          )}
        </div>
      </div>

      {/* Right side - Simulator */}
      <div className="flex flex-col bg-gray-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-[var(--color-brand-blue)]" />
          <h3 className="font-bold text-gray-900">Прогноз эффективности (Симулятор)</h3>
        </div>

        {isSimulating ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand-blue)]"></div>
          </div>
        ) : simulation ? (
          <div className="flex flex-col gap-6 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Новые клиенты</p>
                <p className="text-2xl font-black text-green-600">{simulation.expected_new_customers_growth}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Повторные визиты</p>
                <p className="text-2xl font-black text-[var(--color-brand-blue)]">~{simulation.expected_returning_visits}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-xl text-white shadow-md mt-auto">
              <p className="text-sm text-gray-300 mb-1">Прогнозируемая выручка</p>
              <p className="text-3xl font-black">₸ {simulation.projected_revenue.toLocaleString()}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-400">Оценка конверсии:</span>
                <span className="font-bold text-emerald-400">{simulation.conversion_rate_estimate}</span>
              </div>
            </div>
            
            <p className="text-xs text-center text-gray-400 mt-2">
              *Прогноз основан на средних показателях вашего бизнеса и эвристической модели
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BusinessToolWizard;
