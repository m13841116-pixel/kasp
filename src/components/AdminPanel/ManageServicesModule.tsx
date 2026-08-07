import React, { useState } from 'react';
import { ServiceItem } from '../../types';
import { Plus, Trash2, Edit, Save, X, Wrench, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface ManageServicesModuleProps {
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
}

export const ManageServicesModule: React.FC<ManageServicesModuleProps> = ({ services, setServices }) => {
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<ServiceItem>>({
    title: '',
    description: '',
    icon: 'Bot',
    badge: '',
    features: [''],
    estimatedDelivery: '۷ الی ۱۴ روز',
    orderNum: 1,
    isActive: true,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    try {
      if (editingService) {
        const res = await apiFetch(`/api/admin/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const updated = await res.json();
          setServices(services.map(s => s.id === updated.id ? updated : s));
          setEditingService(null);
        }
      } else {
        const res = await apiFetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const created = await res.json();
          setServices([...services, created]);
          setIsAdding(false);
        }
      }
    } catch {
      alert('خطا در ذخیره سرویس');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این سرویس اطمینان دارید؟')) return;
    try {
      const res = await apiFetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setServices(services.filter(s => s.id !== id));
      }
    } catch {
      alert('خطا در حذف سرویس');
    }
  };

  const startEdit = (service: ServiceItem) => {
    setEditingService(service);
    setFormData(service);
    setIsAdding(false);
  };

  const startAdd = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      icon: 'Bot',
      badge: '',
      features: ['قابلیت اول', 'قابلیت دوم'],
      estimatedDelivery: '۷ الی ۱۴ روز',
      orderNum: services.length + 1,
      isActive: true,
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>مدیریت سرویس‌ها و تخصص‌های کاسپ</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ویرایش، افزودن یا فعال/غیرفعال کردن سرویس‌های نمایش داده شده در صفحه اصلی
          </p>
        </div>
        <button
          onClick={startAdd}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن سرویس جدید</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingService) && (
        <form onSubmit={handleSave} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-300 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {editingService ? 'ویرایش سرویس' : 'افزودن سرویس جدید'}
            </h3>
            <button type="button" onClick={() => { setIsAdding(false); setEditingService(null); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان سرویس *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">برچسب (Badge)</label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={e => setFormData({ ...formData, badge: e.target.value })}
                placeholder="مثال: پرتقاضاترین یا ۹۰٪ تخفیف"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">توضیحات کامل سرویس *</label>
            <textarea
              rows={2}
              required
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">آیکون</label>
              <select
                value={formData.icon || 'Bot'}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              >
                <option value="Bot">ربات / ایجنت (Bot)</option>
                <option value="Code2">برنامه‌نویسی (Code2)</option>
                <option value="Zap">اتوماسیون (Zap)</option>
                <option value="Layout">وب‌اپلیکیشن (Layout)</option>
                <option value="Smartphone">موبایل (Smartphone)</option>
                <option value="Cpu">معماری هوش مصنوعی (Cpu)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تخمین زمان تحویل</label>
              <input
                type="text"
                value={formData.estimatedDelivery || ''}
                onChange={e => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                placeholder="مثال: ۷ الی ۱۴ روز"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isActiveService"
                checked={formData.isActive ?? true}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded accent-purple-600"
              />
              <label htmlFor="isActiveService" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                فعال در وب‌سایت
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره سرویس</span>
            </button>
          </div>
        </form>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(s => (
          <div key={s.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-slate-900 dark:text-white">{s.title}</span>
                {s.badge && <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">{s.badge}</span>}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-3">{s.description}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-bold">زمان تحویل: {s.estimatedDelivery}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
