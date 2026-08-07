import React, { useState, useEffect } from 'react';
import { BannerConfig } from '../../types';
import { Settings, Save, CheckCircle2, Globe, MessageSquare, Phone, Mail, Gift, Tag, Check, Clock } from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface SiteSettingsModuleProps {
  bannerConfig: BannerConfig;
  setBannerConfig: React.Dispatch<React.SetStateAction<BannerConfig>>;
}

export const SiteSettingsModule: React.FC<SiteSettingsModuleProps> = ({ bannerConfig, setBannerConfig }) => {
  const [formData, setFormData] = useState<BannerConfig>({
    headline: bannerConfig.headline || '',
    subheadline: bannerConfig.subheadline || '',
    discountBadge: bannerConfig.discountBadge || '',
    primaryCta: bannerConfig.primaryCta || '',
    secondaryCta: bannerConfig.secondaryCta || '',
    bannerImage: bannerConfig.bannerImage || '',
    telegramContact: bannerConfig.telegramContact || 'kasp0000',
    phoneContact: bannerConfig.phoneContact || '۰۹۱۲۳۴۵۶۷۸۹',
    emailContact: bannerConfig.emailContact || 'info@kasp.ir',
  });

  const [maxSpins, setMaxSpins] = useState<number>(3);
  const [discountCodes, setDiscountCodes] = useState<any[]>([]);
  const [prizesConfig, setPrizesConfig] = useState<any[]>([
    { id: 0, shortLabel: '۱۰٪ تخفیف', fullTitle: '۱۰٪ تخفیف ویژه توسعه نرم‌افزار', pct: 10, codePrefix: 'OFF10', color: '#ec4899', textColor: '#ffffff', weight: 20 },
    { id: 1, shortLabel: '۲۰٪ تخفیف', fullTitle: '۲۰٪ تخفیف ویژه سفارش پروژه', pct: 20, codePrefix: 'OFF20', color: '#8b5cf6', textColor: '#ffffff', weight: 20 },
    { id: 2, shortLabel: '۳۰٪ تخفیف', fullTitle: '۳۰٪ تخفیف طلایی طراحی نرم‌افزار', pct: 30, codePrefix: 'OFF30', color: '#3b82f6', textColor: '#ffffff', weight: 15 },
    { id: 3, shortLabel: '۸۰٪ تخفیف', fullTitle: '🔥 ۸۰٪ تخفیف استثنایی ویژه شروع کار', pct: 80, codePrefix: 'OFF80', color: '#f43f5e', textColor: '#ffffff', weight: 5 },
    { id: 4, shortLabel: 'دامنه .ir', fullTitle: '🌐 ۱ سال دامنه .ir رایگان', pct: 100, codePrefix: 'FREE-IR', color: '#06b6d4', textColor: '#ffffff', weight: 15 },
    { id: 5, shortLabel: 'اکانت زوپیت', fullTitle: '🛍️ اکانت فروشگاهی رایگان زوپیت (Zoopit.ir)', pct: 100, codePrefix: 'ZOOPIT', color: '#10b981', textColor: '#ffffff', weight: 10 },
    { id: 6, shortLabel: 'لوگو رایگان', fullTitle: '🎨 طراحی لوگو اختصاصی رایگان', pct: 100, codePrefix: 'FREE-LOGO', color: '#f59e0b', textColor: '#ffffff', weight: 10 },
    { id: 7, shortLabel: 'پشتیبانی', fullTitle: '🛡️ ۲ ماه پشتیبانی و نگهداری رایگان', pct: 100, codePrefix: 'FREE-SUP', color: '#6366f1', textColor: '#ffffff', weight: 5 },
    { id: 8, shortLabel: '۲M نقدی', fullTitle: '💵 ۲,۰۰۰,۰۰۰ تومان جایزه نقدی', pct: 100, codePrefix: 'CASH2M', color: '#eab308', textColor: '#ffffff', weight: 0 }
  ]);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiFetch('/api/wheel-settings')
      .then(r => r.json())
      .then(d => {
        if (d.maxSpins !== undefined) setMaxSpins(d.maxSpins);
        if (Array.isArray(d.prizesConfig) && d.prizesConfig.length > 0) {
          setPrizesConfig(d.prizesConfig);
        }
      })
      .catch(console.error);

    apiFetch('/api/admin/discount-codes')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setDiscountCodes(d);
      })
      .catch(console.error);
  }, []);

  const handleWeightChange = (index: number, newWeight: number) => {
    const updated = [...prizesConfig];
    updated[index].weight = Math.max(0, newWeight);
    setPrizesConfig(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    try {
      await Promise.all([
        apiFetch('/api/admin/banner-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }),
        apiFetch('/api/admin/wheel-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maxSpins, prizesConfig }),
        })
      ]);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch {
      alert('خطا در ذخیره تنظیمات وب‌سایت');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>تنظیمات اصلی و هویت وب‌سایت (Kasp.ir)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          تغییر متون هدر، نشان تخفیف، دکمه‌های فراخوان، اطلاعات تماس و راهبردهای ارتباطی
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>تنظیمات اصلی وب‌سایت با موفقیت بروزرسانی شد.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
        
        {/* Main Banner Texts */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-purple-500" />
            <span>متون اصلی بخش هدر (Hero Section)</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1">
              عنوان اصلی وب‌سایت (Headline)
            </label>
            <input
              type="text"
              required
              value={formData.headline}
              onChange={e => setFormData({ ...formData, headline: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1">
              توضیحات زیر عنوان (Subheadline)
            </label>
            <textarea
              rows={3}
              required
              value={formData.subheadline}
              onChange={e => setFormData({ ...formData, subheadline: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1">
              متن نشان ویژه تخفیف (Discount Badge)
            </label>
            <input
              type="text"
              value={formData.discountBadge}
              onChange={e => setFormData({ ...formData, discountBadge: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1">
              عنوان دکمه اصلی (Primary CTA)
            </label>
            <input
              type="text"
              value={formData.primaryCta}
              onChange={e => setFormData({ ...formData, primaryCta: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1">
              عنوان دکمه ثانویه (Secondary CTA)
            </label>
            <input
              type="text"
              value={formData.secondaryCta}
              onChange={e => setFormData({ ...formData, secondaryCta: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-sky-500" />
            <span>اطلاعات تماس و کانال‌های ارتباطی</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                <span>آیدی پشتیبانی تلگرام</span>
              </label>
              <input
                type="text"
                value={formData.telegramContact || ''}
                onChange={e => setFormData({ ...formData, telegramContact: e.target.value })}
                placeholder="مثال: kasp0000"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>شماره تماس پشتیبانی</span>
              </label>
              <input
                type="text"
                value={formData.phoneContact || ''}
                onChange={e => setFormData({ ...formData, phoneContact: e.target.value })}
                placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-purple-500" />
                <span>ایمیل شرکت</span>
              </label>
              <input
                type="text"
                value={formData.emailContact || ''}
                onChange={e => setFormData({ ...formData, emailContact: e.target.value })}
                placeholder="مثال: info@kasp.ir"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Wheel Settings Section */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="w-4 h-4 text-rose-500" />
            <span>تنظیمات گردونه شانس و کدهای تخفیف</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1">
                تعداد شانس چرخاندن برای هر کاربر (Spins Limit)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={maxSpins}
                onChange={e => setMaxSpins(parseInt(e.target.value, 10) || 1)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-purple-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                تعداد دفعاتی که هر کاربر می‌تواند گردونه را بچرخاند و کد تخفیف دریافت کند.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">کل کدهای تخفیف صادر شده:</span>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{discountCodes.length} کد</p>
              </div>
            </div>
          </div>

          {/* Wheel Prize Weights Management */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">مدیریت احتمال و شانس برنده شدن جوایز (کارت مدیر):</span>
              <span className="text-[11px] text-slate-500">وزن ۰ = شانس صفر (غیرقابل برد)</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {prizesConfig.map((prize, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: prize.color }} />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{prize.shortLabel}</p>
                      <p className="text-[10px] text-slate-400 truncate">{prize.fullTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-slate-500">وزن:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={prize.weight ?? 10}
                      onChange={e => handleWeightChange(idx, parseInt(e.target.value, 10) || 0)}
                      className="w-14 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold font-mono text-center text-purple-600 dark:text-purple-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {discountCodes.length > 0 && (
            <div className="mt-4 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">لیست کدهای تخفیف تولیدشده در گردونه:</span>
              <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                <table className="w-full text-right text-xs">
                  <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                    <tr>
                      <th className="p-2">کد تخفیف</th>
                      <th className="p-2">جایزه</th>
                      <th className="p-2">وضعیت</th>
                      <th className="p-2">تاریخ ایجاد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {discountCodes.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2 font-mono font-bold text-purple-600 dark:text-purple-400 dir-ltr text-right">{c.code}</td>
                        <td className="p-2 font-bold text-slate-800 dark:text-slate-200">{c.prize}</td>
                        <td className="p-2">
                          {c.isUsed === 1 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold border border-rose-500/20">
                              <Check className="w-3 h-3" /> استفاده شده
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                              <Clock className="w-3 h-3" /> فعال (استفاده‌نشده)
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-slate-500 text-[11px]">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('fa-IR') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره تمامی تنظیمات'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
