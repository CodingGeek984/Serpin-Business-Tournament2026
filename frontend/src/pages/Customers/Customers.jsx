import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { Search, MessageCircle, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Customers = () => {
  const { customers, isLoading, addCustomer, updateCustomer, deleteCustomer } = useUser();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, regular, sleeping, new, churn
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const emptyCustomer = { name: '', phone: '', email: '', visits_count: 0, total_spent: 0, status: 'new' };
  const [form, setForm] = useState(emptyCustomer);
  const [saving, setSaving] = useState(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const createCustomer = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, visits_count: Number(form.visits_count), total_spent: Number(form.total_spent), tags: editingCustomer?.tags || [] };
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, payload);
      } else {
        const result = await addCustomer(payload);
        if (result && result.data && result.data.id) {
          setRecentlyAddedId(result.data.id);
          window.setTimeout(() => setRecentlyAddedId(null), 3000);
        }
      }
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally { 
      setForm(emptyCustomer);
      setShowForm(false);
      setEditingCustomer(null);
      setSaving(false); 
    }
  };

  const openCreate = () => { setEditingCustomer(null); setForm(emptyCustomer); setShowForm(true); };
  const openEdit = (event, customer) => {
    event.stopPropagation();
    setEditingCustomer(customer);
    setForm({ name: customer.name || '', phone: customer.phone || '', email: customer.email || '', visits_count: customer.visits_count ?? customer.visits ?? 0, total_spent: customer.total_spent ?? customer.totalSpent ?? 0, status: customer.status || 'new' });
    setShowForm(true);
  };
  const removeCustomer = async (event, customer) => {
    event.stopPropagation();
    if (window.confirm(`Удалить клиента «${customer.name}» из базы?`)) await deleteCustomer(customer.id);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      String(c.phone || '').includes(search) ||
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
          <Button className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" />Добавить клиента</Button>
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

      <Card className="overflow-hidden shadow-sm border-0 ring-1 ring-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs border-b border-gray-100">
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
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[var(--color-brand-blue)] border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p>Загрузка клиентов...</p>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 mx-auto text-gray-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="font-medium">Клиенты не найдены</p>
                    <p className="text-xs mt-1 text-gray-400">Попробуйте изменить фильтры или условия поиска</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence initial={false}>
                {filteredCustomers.map(customer => (
                  <motion.tr
                    key={customer.id}
                    layout
                    initial={{ opacity: 0, y: -18, backgroundColor: '#dcfce7' }}
                    animate={{ opacity: 1, y: 0, backgroundColor: recentlyAddedId === customer.id ? '#dcfce7' : 'rgba(255,255,255,0)' }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.35 }}
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 group-hover:text-[var(--color-brand-blue)] transition-colors flex items-center gap-2">{customer.name}{recentlyAddedId === customer.id && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">Добавлен</span>}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(customer.status)}</td>
                    <td className="px-6 py-4 font-medium">{customer.visits}</td>
                    <td className="px-6 py-4 font-medium text-emerald-600">{customer.totalSpent?.toLocaleString() || 0} ₸</td>
                    <td className="px-6 py-4 text-gray-500">{customer.lastVisit || 'Нет данных'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => handleWhatsApp(e, customer)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Написать в WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button onClick={(event) => openEdit(event, customer)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Редактировать клиента"><Pencil className="w-4 h-4" /></button>
                        <button onClick={(event) => removeCustomer(event, customer)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Удалить клиента"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
                }</AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          >
            <motion.form 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onSubmit={createCustomer} 
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100"
            >
              <div className="mb-6 flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">{editingCustomer ? 'Редактировать клиента' : 'Новый клиент'}</h2>
                <button type="button" className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5 transition-colors" onClick={() => { setShowForm(false); setEditingCustomer(null); }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Имя клиента *</label>
                  <input required placeholder="Например: Иван Иванов" value={form.name || ''} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" style={{ color: '#4b5563' }}/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Номер телефона</label>
                  <input placeholder="+7 (___) ___-__-__" value={form.phone || ''} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" style={{ color: '#4b5563' }}/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" placeholder="ivan@example.com" value={form.email || ''} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" style={{ color: '#4b5563' }}/>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Кол-во визитов</label>
                    <input min="0" type="number" value={form.visits_count || ''} onChange={(e) => setForm({...form, visits_count: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" style={{ color: '#4b5563' }}/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Сумма (₸)</label>
                    <input min="0" type="number" value={form.total_spent || ''} onChange={(e) => setForm({...form, total_spent: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" style={{ color: '#4b5563' }}/>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Статус клиента</label>
                  <select value={form.status || 'new'} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" style={{ color: '#4b5563' }}>
                    <option value="new">Новый</option>
                    <option value="regular">Постоянный</option>
                    <option value="sleeping">Уснувший</option>
                    <option value="churn">Отток</option>
                  </select>
                </div>
                
                <Button type="submit" disabled={saving} className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm border-none">
                  {saving ? 'Сохраняем...' : editingCustomer ? 'Сохранить изменения' : 'Добавить клиента'}
                </Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
