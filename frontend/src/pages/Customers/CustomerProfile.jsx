import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { ArrowLeft, User, Phone, Mail, Calendar, Clock, ShoppingBag, Gift, ArrowUpRight } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState('history');
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    if (!isLoading) {
      // Find customer by ID. 
      // Note: id might be a string from URL, customer.id might be number or string.
      const found = customers.find(c => String(c.id) === String(id));
      setCustomer(found);
    }
  }, [id, customers, isLoading]);

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center text-gray-500">Загрузка данных клиента...</div>;
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Клиент не найден</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/customers')}>Вернуться к списку</Button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'regular': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">Постоянный</span>;
      case 'sleeping': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">Уснувший</span>;
      case 'new': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Новый</span>;
      default: return null;
    }
  };

  // Mock data for history since our API doesn't return full transaction history yet
  const history = [
    { id: 1, date: 'Сегодня, 14:30', amount: 3500, type: 'Покупка', points: '+35' },
    { id: 2, date: '12 Октября, 18:15', amount: 5200, type: 'Покупка', points: '+52' },
    { id: 3, date: '05 Октября, 09:40', amount: 1200, type: 'Покупка', points: '+12' },
  ];

  const promos = [
    { id: 1, name: '6-й кофе в подарок', date: '12 Октября', saved: 1500 },
    { id: 2, name: 'Скидка на десерт 20%', date: '25 Сентября', saved: 450 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/customers')}
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Профиль клиента
            {getStatusBadge(customer.status)}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Personal Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-100">
            <div className="bg-gradient-to-br from-[var(--color-brand-blue)] to-blue-600 h-24"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 bg-white p-1 rounded-2xl shadow-sm absolute -top-10">
                <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center text-[var(--color-brand-blue)] font-bold text-2xl">
                  {customer.name.charAt(0)}
                </div>
              </div>
              
              <div className="mt-14">
                <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Клиент с {customer.joinDate || '2023 года'}</p>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {customer.phone}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {customer.email || 'Нет email'}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Button className="w-full">Написать сообщение</Button>
              </div>
            </div>
          </Card>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
             <Card className="border-0 shadow-sm ring-1 ring-gray-100 p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">LTV</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{customer.totalSpent?.toLocaleString() || 0} ₸</div>
             </Card>
             <Card className="border-0 shadow-sm ring-1 ring-gray-100 p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Gift className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Баллы</span>
                </div>
                <div className="text-xl font-bold text-[var(--color-brand-blue)]">{customer.stamps || 0} шт</div>
             </Card>
          </div>
        </div>

        {/* Right Content - History & Promos */}
        <div className="lg:col-span-2">
          <Card className="h-full border-0 shadow-sm ring-1 ring-gray-100 flex flex-col">
            <div className="flex border-b border-gray-100 p-2 gap-2">
              <button
                onClick={() => setActiveTab('history')}
                className={twMerge(clsx(
                  "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === 'history' 
                    ? "bg-[var(--color-brand-blue)] text-white shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50"
                ))}
              >
                История покупок
              </button>
              <button
                onClick={() => setActiveTab('promos')}
                className={twMerge(clsx(
                  "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === 'promos' 
                    ? "bg-[var(--color-brand-blue)] text-white shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50"
                ))}
              >
                Использованные акции
              </button>
            </div>

            <CardContent className="flex-1 p-0">
              <AnimatePresence mode="wait">
                {activeTab === 'history' ? (
                  <motion.div 
                    key="history"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 flex flex-col gap-4"
                  >
                    {history.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{item.type}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" /> {item.date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{item.amount.toLocaleString()} ₸</div>
                          <div className="text-xs text-emerald-600 font-medium">{item.points} баллов</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="promos"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 flex flex-col gap-4"
                  >
                     {promos.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <Gift className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" /> Использовано: {item.date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Сэкономлено</div>
                          <div className="font-bold text-emerald-600">{item.saved.toLocaleString()} ₸</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerProfile;
