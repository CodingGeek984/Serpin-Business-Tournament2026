import React from 'react';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardContent } from '../../components/common/Card/Card';
import { Settings as SettingsIcon, CreditCard, MessageCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Settings = () => {
  const { userProfile, toggleIntegration } = useUser();
  const { addNotification } = useNotification();

  const handleToggle = (key, name) => {
    toggleIntegration(key);
    const isEnabled = !userProfile.integrations[key];
    addNotification(`Интеграция ${name} ${isEnabled ? 'подключена' : 'отключена'}`, isEnabled ? 'success' : 'info');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Настройки</h1>
        <p className="text-sm text-gray-500 mt-1">Управление профилем и внешними интеграциями</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-2">Профиль бизнеса</h3>
          <p className="text-sm text-gray-500">Основная информация о вашем заведении, которая отображается клиентам.</p>
        </div>
        <Card className="md:col-span-2">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img src={userProfile.avatar} alt="Logo" className="w-16 h-16 rounded-full border border-gray-200" />
              <div>
                <button className="text-sm font-medium text-[var(--color-brand-blue)] hover:underline">Изменить логотип</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название бизнеса</label>
                <input type="text" value={userProfile.name} readOnly className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={userProfile.email} readOnly className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 outline-none" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <hr className="border-gray-200" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-2">Интеграции</h3>
          <p className="text-sm text-gray-500">Подключение внешних сервисов для автоматизации.</p>
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
          
          {/* Kaspi Integration */}
          <Card className={twMerge(clsx("transition-colors", userProfile.integrations.kaspi ? "border-emerald-500 ring-1 ring-emerald-500" : ""))}>
            <CardContent className="p-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    Kaspi Pay (Demo)
                    {userProfile.integrations.kaspi && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Активно</span>}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">Автоматическое начисление бонусов и штампов при оплате клиентом через Kaspi QR.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" checked={userProfile.integrations.kaspi} onChange={() => handleToggle('kaspi', 'Kaspi Pay')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </CardContent>
          </Card>

          {/* WhatsApp Integration */}
          <Card className={twMerge(clsx("transition-colors", userProfile.integrations.whatsapp ? "border-emerald-500 ring-1 ring-emerald-500" : ""))}>
            <CardContent className="p-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    WhatsApp Business API (Demo)
                    {userProfile.integrations.whatsapp && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Активно</span>}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">Автоматическая рассылка "уснувшим" клиентам и рассылка цифровых чеков.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" checked={userProfile.integrations.whatsapp} onChange={() => handleToggle('whatsapp', 'WhatsApp Business API')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Settings;
