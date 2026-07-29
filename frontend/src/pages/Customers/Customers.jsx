import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardContent } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { Search, Filter, MessageCircle, Gift, Phone } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Customers = () => {
  const { customers } = useUser();
  const { addNotification } = useNotification();
  const [filter, setFilter] = useState('all'); // all, regular, sleeping, new
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = customers.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const handleWhatsApp = (customer) => {
    addNotification(`Сообщение отправлено ${customer.name} через WhatsApp API (Demo)`, 'success');
  };

  const handleGift = (customer) => {
    addNotification(`Подарочный бонус начислен ${customer.name}`, 'success');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'regular': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">Постоянный</span>;
      case 'sleeping': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">Уснувший</span>;
      case 'new': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">Новый</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">База клиентов</h1>
          <p className="text-sm text-gray-500 mt-1">Управляйте лояльностью и возвращайте ушедших</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Поиск по имени или телефону..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none w-64"
            />
          </div>
          <Button variant="outline" className="gap-2">
            Экспорт
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'all', label: 'Все клиенты' },
          { id: 'regular', label: 'Постоянные' },
          { id: 'new', label: 'Новые' },
          { id: 'sleeping', label: 'Уснувшие (>30 дней)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={twMerge(clsx(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              filter === tab.id 
                ? "bg-[var(--color-brand-blue)] text-white" 
                : "text-gray-600 hover:bg-gray-100"
            ))}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={twMerge(clsx("xl:col-span-2", selectedCustomer ? "hidden xl:block" : "col-span-full"))}>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">Клиент</th>
                    <th className="px-6 py-4 font-medium">Статус</th>
                    <th className="px-6 py-4 font-medium">Визиты</th>
                    <th className="px-6 py-4 font-medium">Потрачено</th>
                    <th className="px-6 py-4 font-medium">Последний визит</th>
                    <th className="px-6 py-4 font-medium text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* eslint-disable-next-line react/prop-types */}
                  {/* In a real project isLoading should be destructured from useUser() */}
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                           <Search className="w-6 h-6" />
                        </div>
                        <p>Клиенты не найдены</p>
                        <p className="text-xs mt-1">Попробуйте изменить фильтры или добавить нового клиента.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(customer => (
                      <tr 
                        key={customer.id} 
                        onClick={() => setSelectedCustomer(customer)}
                        className={twMerge(clsx(
                          "hover:bg-blue-50/50 transition-colors cursor-pointer",
                          selectedCustomer?.id === customer.id && "bg-blue-50"
                        ))}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.phone}</div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(customer.status)}</td>
                        <td className="px-6 py-4">{customer.visits}</td>
                        <td className="px-6 py-4 font-medium">{customer.totalSpent.toLocaleString()} ₸</td>
                        <td className="px-6 py-4">{customer.lastVisit || 'Нет данных'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleWhatsApp(customer); }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Написать в WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Customer Profile Sidebar */}
        {selectedCustomer && (
          <div className="xl:col-span-1">
            <Card className="sticky top-20 border-[var(--color-brand-blue)] ring-1 ring-blue-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-gradient-to-tr from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-[var(--color-brand-blue)] font-bold text-xl">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="xl:hidden text-gray-400 hover:text-gray-600"
                  >
                    Закрыть
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm mb-4">
                  <Phone className="w-4 h-4" />
                  {selectedCustomer.phone}
                </div>
                
                <div className="mb-6">{getStatusBadge(selectedCustomer.status)}</div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Всего визитов</p>
                    <p className="text-lg font-bold">{selectedCustomer.visits}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Сумма покупок</p>
                    <p className="text-lg font-bold text-emerald-600">{selectedCustomer.totalSpent.toLocaleString()} ₸</p>
                  </div>
                </div>

                <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm font-semibold mb-3">Накопленные штампы</p>
                  <div className="flex gap-1 justify-between">
                    {[1,2,3,4,5,6].map(i => (
                      <div 
                        key={i}
                        className={twMerge(clsx(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                          i <= selectedCustomer.stamps 
                            ? "bg-[var(--color-brand-blue)] border-[var(--color-brand-blue)] text-white" 
                            : "border-gray-200 bg-white text-gray-300"
                        ))}
                      >
                        {i === 6 ? <Gift className="w-4 h-4" /> : i}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">Осталось {6 - selectedCustomer.stamps} покупок до подарка</p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    className="w-full bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 gap-2"
                    onClick={() => handleWhatsApp(selectedCustomer)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Написать в WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 text-[var(--color-brand-blue)] border-[var(--color-brand-blue)] hover:bg-blue-50"
                    onClick={() => handleGift(selectedCustomer)}
                  >
                    <Gift className="w-4 h-4" />
                    Подарить бонус
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
