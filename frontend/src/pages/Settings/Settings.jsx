import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardContent } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { CreditCard, MessageCircle, Upload, Lock, User, Briefcase, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../../services/api';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara'
];

const Settings = () => {
  const { logout, setUser } = useAuth();
  const { addNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar: ''
  });

  const [businessForm, setBusinessForm] = useState({
    name: '',
    business_type: '',
    description: '',
    address: '',
    phone: '',
    website: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchBusiness();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      const data = res.data || res;
      setProfileForm(prev => ({ ...prev, ...data }));
    } catch (err) {
      addNotification('Ошибка загрузки профиля', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBusiness = async () => {
    try {
      const res = await api.get('/business/profile');
      const data = res.data || res;
      setBusinessForm(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleBusinessChange = (e) => {
    setBusinessForm({ ...businessForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.put('/user/profile', profileForm);
      setUser(res.data || res); // Update Topbar immediately
      addNotification('Данные пользователя сохранены', 'success');
    } catch (err) {
      addNotification(err.message || 'Ошибка обновления', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const saveBusiness = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/business/profile', businessForm);
      addNotification('Данные компании сохранены', 'success');
    } catch (err) {
      addNotification(err.message || 'Ошибка обновления бизнеса', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addNotification('Новые пароли не совпадают', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await api.put('/user/change-password', {
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });
      addNotification('Пароль успешно изменен', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addNotification(err.message || 'Ошибка изменения пароля', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Вы уверены? Это действие навсегда удалит ваш аккаунт и все данные!")) return;
    try {
      await api.delete('/user/account');
      addNotification('Аккаунт удален', 'success');
      logout();
    } catch (err) {
      addNotification(err.message || 'Ошибка удаления', 'error');
    }
  };

  const tabs = [
    { id: 'personal', label: 'Личные данные', icon: <User className="w-4 h-4 mr-2" /> },
    { id: 'business', label: 'Мой бизнес', icon: <Briefcase className="w-4 h-4 mr-2" /> },
    { id: 'security', label: 'Безопасность', icon: <Lock className="w-4 h-4 mr-2" /> },
  ];

  if (isLoading) {
    return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand-blue)]"></div></div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto pb-10">
      
      {/* Sidebar Navigation */}
      <div className="md:w-64 shrink-0">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Профиль</h1>
        <div className="flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={twMerge(clsx(
                "flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                activeTab === tab.id 
                  ? "bg-[var(--color-brand-blue)] text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100"
              ))}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 mt-12 md:mt-0">
        
        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Личные данные</h3>
              <form onSubmit={saveProfile} className="flex flex-col gap-4">
                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Ваш аватар</label>
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={profileForm.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default'} 
                      alt="Current Avatar" 
                      className="w-16 h-16 rounded-full border-2 border-[var(--color-brand-blue)] shadow-sm bg-gray-50"
                    />
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {AVATAR_OPTIONS.map((avatarUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setProfileForm(prev => ({ ...prev, avatar: avatarUrl }))}
                          className={clsx(
                            "w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110",
                            profileForm.avatar === avatarUrl ? "border-[var(--color-brand-blue)] ring-2 ring-blue-100" : "border-transparent hover:border-gray-300"
                          )}
                        >
                          <img src={avatarUrl} alt={`Avatar ${idx}`} className="w-full h-full bg-gray-50" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                  <input type="text" name="full_name" value={profileForm.full_name} onChange={handleProfileChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input type="tel" name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none" />
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button type="submit" disabled={isSaving}>{isSaving ? 'Сохранение...' : 'Сохранить изменения'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Business Tab */}
        {activeTab === 'business' && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Мой бизнес</h3>
              <form onSubmit={saveBusiness} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название бизнеса</label>
                  <input type="text" name="name" value={businessForm.name || ''} onChange={handleBusinessChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Категория / Тип</label>
                    <input type="text" name="business_type" value={businessForm.business_type || ''} onChange={handleBusinessChange} placeholder="Например: Кофейня, Салон красоты" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон компании</label>
                    <input type="tel" name="phone" value={businessForm.phone || ''} onChange={handleBusinessChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Краткое описание</label>
                  <textarea name="description" value={businessForm.description || ''} onChange={handleBusinessChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                  <input type="text" name="address" value={businessForm.address || ''} onChange={handleBusinessChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none" />
                </div>

                <div className="flex justify-end mt-4">
                  <Button type="submit" disabled={isSaving}>{isSaving ? 'Сохранение...' : 'Сохранить изменения'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Смена пароля</h3>
                <form onSubmit={savePassword} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Текущий пароль</label>
                    <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
                    <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required minLength="6" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Подтвердите новый пароль</label>
                    <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required minLength="6" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none" />
                  </div>
                  
                  <div className="flex justify-start mt-2">
                    <Button type="submit" disabled={isSaving || !passwordForm.currentPassword}>{isSaving ? 'Обновление...' : 'Обновить пароль'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-red-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Опасная зона</h3>
                <p className="text-sm text-gray-500 mb-4">После удаления аккаунта пути назад не будет. Пожалуйста, будьте уверены.</p>
                <Button variant="outline" onClick={deleteAccount} className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить аккаунт
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
