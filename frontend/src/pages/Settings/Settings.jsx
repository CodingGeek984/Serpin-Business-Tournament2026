import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardContent } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { CreditCard, MessageCircle, Upload, Lock } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Settings = () => {
  const { userProfile, toggleIntegration } = useUser();
  const { addNotification } = useNotification();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    currency: 'KZT',
    timezone: 'Asia/Almaty'
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleToggle = (key, name) => {
    toggleIntegration(key);
    const isEnabled = !userProfile.integrations[key];
    addNotification(`Интеграция ${name} ${isEnabled ? 'подключена' : 'отключена'}`, isEnabled ? 'success' : 'info');
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError('');
  };

  const saveProfile = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    // Simulate API call
    setTimeout(() => {
      setIsSavingProfile(false);
      addNotification('Профиль бизнеса успешно обновлен', 'success');
    }, 800);
  };

  const savePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsSavingPassword(true);
    // Simulate API call
    setTimeout(() => {
      setIsSavingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addNotification('Пароль успешно изменен', 'success');
    }, 800);
  };

  const handleLogoUpload = () => {
    // In a real app, this would trigger an <input type="file" />
    addNotification('Функция загрузки логотипа (Демо)', 'info');
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Настройки</h1>
        <p className="text-sm text-gray-500 mt-1">Управление профилем, безопасностью и интеграциями</p>
      </div>

      {/* Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-2">Профиль бизнеса</h3>
          <p className="text-sm text-gray-500">Основная информация о вашем заведении, валюта и часовой пояс.</p>
        </div>
        <Card className="md:col-span-2">
          <CardContent className="p-6 flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img src={userProfile?.avatar || 'https://via.placeholder.com/150'} alt="Logo" className="w-20 h-20 rounded-full border border-gray-200 object-cover" />
                <button
                  onClick={handleLogoUpload}
                  className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 text-[var(--color-brand-blue)]"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Логотип компании</h4>
                <p className="text-xs text-gray-500 mt-1 mb-2">Рекомендуемый размер: 512x512px. Форматы: JPG, PNG.</p>
                <Button variant="outline" size="sm" onClick={handleLogoUpload}>Изменить логотип</Button>
              </div>
            </div>

            <form onSubmit={saveProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название бизнеса</label>
                  <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email для уведомлений</label>
                  <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none transition-shadow" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                  <select name="currency" value={profileForm.currency} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none transition-shadow bg-white">
                    <option value="KZT">Тенге (₸)</option>
                    <option value="RUB">Рубль (₽)</option>
                    <option value="USD">Доллар ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Часовой пояс</label>
                  <select name="timezone" value={profileForm.timezone} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none transition-shadow bg-white">
                    <option value="Asia/Almaty">Asia/Almaty (UTC+5)</option>
                    <option value="Asia/Astana">Asia/Astana (UTC+5)</option>
                    <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <hr className="border-gray-100" />

      {/* Security Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            Безопасность
          </h3>
          <p className="text-sm text-gray-500">Обновите пароль для защиты вашего аккаунта.</p>
        </div>
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <form onSubmit={savePassword} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Текущий пароль</label>
                <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} required className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
                <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Подтвердите новый пароль</label>
                <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none transition-shadow" />
              </div>

              {passwordError && (
                <p className="text-sm text-red-500 font-medium">{passwordError}</p>
              )}

              <div className="flex justify-start mt-2">
                <Button type="submit" disabled={isSavingPassword || !passwordForm.currentPassword}>
                  {isSavingPassword ? 'Обновление...' : 'Обновить пароль'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <hr className="border-gray-100" />

      {/* Integrations Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-2">Интеграции</h3>
          <p className="text-sm text-gray-500">Подключение внешних сервисов для автоматизации.</p>
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">

          {/* Kaspi Integration */}
          <Card className={twMerge(clsx("transition-colors", userProfile?.integrations?.kaspi ? "border-emerald-500 ring-1 ring-emerald-500" : ""))}>
            <CardContent className="p-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    Kaspi Pay (Demo)
                    {userProfile?.integrations?.kaspi && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Активно</span>}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">Автоматическое начисление бонусов и штампов при оплате клиентом через Kaspi QR.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" checked={userProfile?.integrations?.kaspi || false} onChange={() => handleToggle('kaspi', 'Kaspi Pay')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </CardContent>
          </Card>

          {/* WhatsApp Integration */}
          <Card className={twMerge(clsx("transition-colors", userProfile?.integrations?.whatsapp ? "border-emerald-500 ring-1 ring-emerald-500" : ""))}>
            <CardContent className="p-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    WhatsApp Business API (Demo)
                    {userProfile?.integrations?.whatsapp && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Активно</span>}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">Автоматическая рассылка "уснувшим" клиентам и рассылка цифровых чеков.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" checked={userProfile?.integrations?.whatsapp || false} onChange={() => handleToggle('whatsapp', 'WhatsApp Business API')} />
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
