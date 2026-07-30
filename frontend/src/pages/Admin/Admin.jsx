import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Database, Plus, Edit2, Trash2, Users, Building, Activity } from 'lucide-react';

const Admin = () => {
  const { token } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [summary, setSummary] = useState({ businesses: 0, active_promotions: 0, customers: 0 });
  const [error, setError] = useState('');
  const [newTemplate, setNewTemplate] = useState({ title: '', desc: '', type: 'discount', defaultBudget: 0 });

  const loadData = useCallback(async () => {
    try {
      const [nextSummary, nextTemplates] = await Promise.all([
        api('/admin/summary', { token }),
        api('/admin/templates', { token }),
      ]);
      setSummary(nextSummary.data || nextSummary);
      setTemplates(nextTemplates.data || nextTemplates);
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id) => {
    await api(`/admin/templates/${id}`, { method: 'DELETE', token });
    setTemplates((current) => current.filter((template) => template.id !== id));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (newTemplate.title) {
      const created = await api('/admin/templates', { method: 'POST', token, body: newTemplate });
      setTemplates((current) => [...current, created]);
      setNewTemplate({ title: '', desc: '', type: 'discount', defaultBudget: 0 });
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="text-[var(--color-brand-blue)] w-6 h-6" />
          Панель Администратора Платформы
        </h1>
        <p className="text-sm text-gray-500 mt-1">Управление глобальными шаблонами акций и статистика B2B-клиентов</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[var(--color-brand-blue)] text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm mb-1">Всего бизнесов</p>
                <h3 className="text-3xl font-bold">{summary.businesses}</h3>
              </div>
              <Building className="w-8 h-8 text-blue-200 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Активных акций (Платформа)</p>
                <h3 className="text-3xl font-bold text-gray-900">{summary.active_promotions}</h3>
              </div>
              <Activity className="w-8 h-8 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Конечных пользователей</p>
                <h3 className="text-3xl font-bold text-gray-900">{summary.customers}</h3>
              </div>
              <Users className="w-8 h-8 text-indigo-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Шаблоны акций (Marketplace)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-medium">Название</th>
                    <th className="px-6 py-3 font-medium">Тип механики</th>
                    <th className="px-6 py-3 font-medium text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {templates.map(tpl => (
                    <tr key={tpl.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{tpl.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{tpl.desc}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{tpl.type}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-[var(--color-brand-blue)] transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(tpl.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors ml-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Добавить шаблон</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Название шаблона</label>
                  <input required value={newTemplate.title} onChange={e => setNewTemplate({...newTemplate, title: e.target.value})} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[var(--color-brand-blue)]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Тип механики</label>
                  <select value={newTemplate.type} onChange={e => setNewTemplate({...newTemplate, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[var(--color-brand-blue)]">
                    <option value="discount">discount (Скидка)</option>
                    <option value="stamp">stamp (Штамп-карта)</option>
                    <option value="time_discount">time_discount (Часы)</option>
                    <option value="winback">winback (Возврат)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Описание для бизнесов</label>
                  <textarea rows="3" value={newTemplate.desc} onChange={e => setNewTemplate({...newTemplate, desc: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[var(--color-brand-blue)] resize-none" />
                </div>
                <Button type="submit" className="w-full mt-2 gap-2">
                  <Plus className="w-4 h-4" /> Создать шаблон
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
