import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Building, Database, Edit2, Plus, Trash2, Users, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import api from '../../services/api';

const emptyTemplate = { title: '', desc: '', type: 'discount', defaultBudget: 0 };
const emptyTool = { name: '', slug: '', category: 'Маркетинг', description: '', icon: 'Gift', is_active: true };
const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

const Admin = () => {
  const [templates, setTemplates] = useState([]);
  const [tools, setTools] = useState([]);
  const [summary, setSummary] = useState({ businesses: 0, active_promotions: 0, customers: 0 });
  const [templateForm, setTemplateForm] = useState(emptyTemplate);
  const [toolForm, setToolForm] = useState(emptyTool);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingTool, setEditingTool] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setError('');
    try {
      const [summaryResponse, templateResponse, toolResponse] = await Promise.all([
        api.get('/admin/summary'), api.get('/admin/templates'), api.get('/admin/tools'),
      ]);
      setSummary(unwrap(summaryResponse));
      setTemplates(unwrap(templateResponse) || []);
      setTools(unwrap(toolResponse) || []);
    } catch (requestError) {
      setError(requestError.message || 'Не удалось загрузить данные админ-панели');
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const submitTemplate = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = editingTemplate
        ? await api.put(`/admin/templates/${editingTemplate}`, templateForm)
        : await api.post('/admin/templates', templateForm);
      const saved = unwrap(response);
      setTemplates((current) => editingTemplate ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
      setTemplateForm(emptyTemplate); setEditingTemplate(null);
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };
  const submitTool = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = editingTool
        ? await api.put(`/admin/tools/${editingTool}`, toolForm)
        : await api.post('/admin/tools', toolForm);
      const saved = unwrap(response);
      setTools((current) => editingTool ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
      setToolForm(emptyTool); setEditingTool(null);
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };
  const removeTemplate = async (id) => {
    if (!window.confirm('Деактивировать шаблон?')) return;
    try { await api.delete(`/admin/templates/${id}`); setTemplates((current) => current.filter((item) => item.id !== id)); } catch (e) { setError(e.message); }
  };
  const removeTool = async (id) => {
    if (!window.confirm('Удалить инструмент из каталога?')) return;
    try { await api.delete(`/admin/tools/${id}`); setTools((current) => current.filter((item) => item.id !== id)); } catch (e) { setError(e.message); }
  };
  const startTemplateEdit = (item) => { setEditingTemplate(item.id); setTemplateForm({ title: item.title, desc: item.desc || '', type: item.type, defaultBudget: item.defaultBudget || 0 }); };
  const startToolEdit = (item) => { setEditingTool(item.id); setToolForm({ name: item.name, slug: item.slug, category: item.category, description: item.description || '', icon: item.icon || 'Gift', is_active: item.is_active !== false }); };

  return <div className="mx-auto flex max-w-7xl flex-col gap-6">
    <div><h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><Database className="w-6 text-blue-600" />Панель администратора</h1><p className="mt-1 text-sm text-gray-500">Управление каталогом и шаблонами, сохранёнными в Firebase.</p></div>
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {[[Building, 'Бизнесов', summary.businesses], [Activity, 'Активных акций', summary.active_promotions], [Users, 'Клиентов', summary.customers]].map(([Icon, label, value]) => <Card key={label}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-gray-500">{label}</p><p className="text-3xl font-bold">{value}</p></div><Icon className="w-8 text-blue-600" /></CardContent></Card>)}
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <Card><CardHeader><CardTitle>Шаблоны акций</CardTitle></CardHeader><CardContent className="space-y-3">{templates.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl border p-3"><div><b>{item.title}</b><p className="text-xs text-gray-500">{item.type} · {item.desc}</p></div><div className="flex gap-1"><button onClick={() => startTemplateEdit(item)} className="p-2 text-blue-600"><Edit2 className="w-4" /></button><button onClick={() => removeTemplate(item.id)} className="p-2 text-red-600"><Trash2 className="w-4" /></button></div></div>)}<form onSubmit={submitTemplate} className="grid gap-2 border-t pt-4"><input required placeholder="Название шаблона" value={templateForm.title} onChange={(e) => setTemplateForm({...templateForm, title:e.target.value})} className="rounded border p-2"/><textarea placeholder="Описание" value={templateForm.desc} onChange={(e) => setTemplateForm({...templateForm, desc:e.target.value})} className="rounded border p-2"/><select value={templateForm.type} onChange={(e) => setTemplateForm({...templateForm, type:e.target.value})} className="rounded border p-2"><option value="discount">Скидка</option><option value="stamp">Штамп-карта</option><option value="time_discount">Счастливые часы</option><option value="winback">Возврат клиентов</option></select><Button type="submit" disabled={saving}>{editingTemplate ? 'Сохранить шаблон' : 'Добавить шаблон'}</Button>{editingTemplate && <Button type="button" variant="outline" onClick={() => {setEditingTemplate(null);setTemplateForm(emptyTemplate);}}>Отмена</Button>}</form></CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="w-5"/>Каталог инструментов</CardTitle></CardHeader><CardContent className="space-y-3">{tools.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl border p-3"><div><b>{item.name}</b><p className="text-xs text-gray-500">{item.category} · /{item.slug}</p></div><div className="flex gap-1"><button onClick={() => startToolEdit(item)} className="p-2 text-blue-600"><Edit2 className="w-4" /></button><button onClick={() => removeTool(item.id)} className="p-2 text-red-600"><Trash2 className="w-4" /></button></div></div>)}<form onSubmit={submitTool} className="grid gap-2 border-t pt-4"><input required placeholder="Название инструмента" value={toolForm.name} onChange={(e) => setToolForm({...toolForm, name:e.target.value})} className="rounded border p-2"/><input required placeholder="slug, например referral" value={toolForm.slug} onChange={(e) => setToolForm({...toolForm, slug:e.target.value})} className="rounded border p-2"/><select value={toolForm.category} onChange={(e) => setToolForm({...toolForm, category:e.target.value})} className="rounded border p-2">{['Маркетинг','Продажи','Удержание','Аналитика','Автоматизация'].map((item) => <option key={item}>{item}</option>)}</select><textarea placeholder="Описание" value={toolForm.description} onChange={(e) => setToolForm({...toolForm, description:e.target.value})} className="rounded border p-2"/><label className="text-sm"><input type="checkbox" checked={toolForm.is_active} onChange={(e) => setToolForm({...toolForm,is_active:e.target.checked})} /> Показывать в каталоге</label><Button type="submit" disabled={saving}>{editingTool ? 'Сохранить инструмент' : <><Plus className="w-4"/>Добавить инструмент</>}</Button>{editingTool && <Button type="button" variant="outline" onClick={() => {setEditingTool(null);setToolForm(emptyTool);}}>Отмена</Button>}</form></CardContent></Card>
    </div>
  </div>;
};
export default Admin;
