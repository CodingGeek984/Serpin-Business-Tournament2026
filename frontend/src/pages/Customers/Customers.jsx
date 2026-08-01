import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { Search, MessageCircle, Plus, X } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Customers = () => {
  const { customers, isLoading, addCustomer } = useUser();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, regular, sleeping, new, churn
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', visits_count: 0, total_spent: 0, status: 'new' });
  const [saving, setSaving] = useState(false);

  const createCustomer = async (event) => {
    event.preventDefault(); setSaving(true);
    try { await addCustomer({ ...form, visits_count: Number(form.visits_count), total_spent: Number(form.total_spent), tags: [] }); setForm({ name: '', phone: '', email: '', visits_count: 0, total_spent: 0, status: 'new' }); setShowForm(false); } finally { setSaving(false); }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleWhatsApp = (e, customer) => {
    e.stopPropagation();
    addNotification(`Сообщение отправлено ${customer.name} через WhatsApp API (Demo)`, 'success');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'regular': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">Постоянный</span>;
      case 'sleeping': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">Уснувший</span>;
      case 'new': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">Новый</span>;
      case 'churn': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">Отток</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
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
              placeholder="Поиск по имени, телефону или email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none w-72"
            />
          </div>
          <Button variant="outline" className="gap-2">
            Экспорт
          </Button>
          <Button className="gap-2" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />Клиент</Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'Все клиенты' },
          { id: 'regular', label: 'Постоянные' },
          { id: 'new', label: 'Новые' },
          { id: 'sleeping', label: 'Уснувшие' },
          { id: 'churn', label: 'Отток' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={twMerge(clsx(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
              filter === tab.id
                ? "bg-[var(--color-brand-blue)] text-white shadow-sm"
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
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-gray-500 mt-1">{selectedCustomer.phone}</p>
                  
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Статус</span>
                      {getStatusBadge(selectedCustomer.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Визиты</span>
                      <span className="font-medium">{selectedCustomer.visits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Потрачено</span>
                      <span className="font-medium text-emerald-600">{selectedCustomer.totalSpent?.toLocaleString() || 0} ₸</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Последний визит</span>
                      <span className="font-medium">{selectedCustomer.lastVisit || 'Нет данных'}</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center gap-2"
                      onClick={(e) => handleWhatsApp(selectedCustomer)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Написать
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={createCustomer} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">Новый клиент</h2><button type="button" onClick={() => setShowForm(false)}><X /></button></div><div className="grid gap-3"><input required placeholder="Имя клиента" value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} className="rounded-lg border p-3"/><input placeholder="Телефон" value={form.phone} onChange={(e) => setForm({...form,phone:e.target.value})} className="rounded-lg border p-3"/><input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} className="rounded-lg border p-3"/><div className="grid grid-cols-2 gap-3"><input min="0" type="number" placeholder="Визитов" value={form.visits_count} onChange={(e) => setForm({...form,visits_count:e.target.value})} className="rounded-lg border p-3"/><input min="0" type="number" placeholder="Потрачено, ₸" value={form.total_spent} onChange={(e) => setForm({...form,total_spent:e.target.value})} className="rounded-lg border p-3"/></div><select value={form.status} onChange={(e) => setForm({...form,status:e.target.value})} className="rounded-lg border p-3"><option value="new">Новый</option><option value="regular">Постоянный</option><option value="sleeping">Уснувший</option><option value="churn">Отток</option></select><Button type="submit" disabled={saving}>{saving ? 'Сохраняем...' : 'Добавить клиента'}</Button></div></form></div>}
    </div>
  );
};

export default Customers;
