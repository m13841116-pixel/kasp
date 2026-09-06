import React, { useState, useEffect } from 'react';
import { CreditCard, Save, CheckCircle2, ShieldCheck, Server, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export const PaymentSettingsModule: React.FC = () => {
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [provider, setProvider] = useState('zibal');
  const [mode, setMode] = useState('production');
  const [zibalConfig, setZibalConfig] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/payment-settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setOnlineEnabled(data.isOnlineGatewayActive !== false);
          setProvider(data.provider || 'zibal');
          setMode(data.mode || 'production');
          if (data.zibal) {
            setZibalConfig(data.zibal);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const payload = {
      isOnlineGatewayActive: onlineEnabled,
      provider: 'zibal',
      mode
    };

    try {
      const res = await apiFetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {}
  };

  if (loading) return <div className="text-slate-900 dark:text-white p-6">در حال بارگذاری...</div>;

  return (
    <div className="space-y-6 animate-fadeIn dir-rtl">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-emerald-500" />
            <span>تنظیمات درگاه پرداخت زیبال (Zibal)</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            تنها روش پرداخت رسمی و فعال KASP: درگاه آنلاین شاپرک زیبال (بدون کارت‌به‌کارت)
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'ذخیره شد' : 'ذخیره تنظیمات'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm max-w-3xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">وضعیت درگاه آنلاین شاپرک</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={onlineEnabled} 
              onChange={e => setOnlineEnabled(e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">ارائه‌دهنده درگاه</label>
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold flex items-center justify-between">
                <span>زیبال (Zibal Payment Gateway)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">محیط اتصال</label>
              <select
                value={mode}
                onChange={e => setMode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="production">عملیاتی (Production / شاپرک)</option>
                <option value="sandbox">سندباکس (Sandbox / تست)</option>
              </select>
            </div>
          </div>

          {zibalConfig && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">مشخصات فنی و امنیتی ارتباط با زیبال:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span>Merchant ID:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {zibalConfig.isMerchantConfigured ? 'محفوظ در سرور (تنظیم شده)' : 'تنظیم‌نشده'}
                  </span>
                </div>
                <div className="flex justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span>نوع اتصال:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {zibalConfig.isProxyActive ? 'رله با IP ثابت (Proxy Active)' : 'مستقیم (Direct)'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-xs bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span>مسیر بازگشت (Callback):</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 dir-ltr text-left">
                  /api/payment/zibal/callback
                </span>
              </div>
            </div>
          )}

          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed font-medium">
              تمامی پرداخت‌های کاربران برای دریافت گزارش کامل KASP به‌صورت خودکار، سرورساید و با استعلام مستقیم از API رسمی زیبال احراز می‌شوند. کارت‌به‌کارت و فیش دستی کاملاً از سیستم خارج شده است.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
