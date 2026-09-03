import React, { useState, useEffect } from 'react';
import { CreditCard, Save, CheckCircle2, ShieldAlert, Server, HandCoins } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export const PaymentSettingsModule: React.FC = () => {
  const [onlineEnabled, setOnlineEnabled] = useState(false);
  const [manualEnabled, setManualEnabled] = useState(true);
  const [provider, setProvider] = useState('zarinpal');
  const [mode, setMode] = useState('sandbox');
  const [apiKey, setApiKey] = useState('');
  
  const [bankName, setBankName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [iban, setIban] = useState('');

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/payment-settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setOnlineEnabled(data.isOnlineGatewayActive || false);
          setProvider(data.provider || 'zarinpal');
          setMode(data.mode || 'sandbox');
          setApiKey(data.apiKey || '');
          setBankName(data.bankName || 'بانک سامان');
          setCardNumber(data.cardNumber || '');
          setAccountName(data.accountHolder || '');
          setIban(data.iban || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const payload = {
      bankName,
      cardNumber,
      accountHolder: accountName,
      iban,
      isOnlineGatewayActive: onlineEnabled,
      provider,
      mode,
      apiKey
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
    <div className="space-y-6 animate-fadeIn">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            تنظیمات پرداخت و مالی
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">مدیریت درگاه‌های پرداخت آنلاین و اطلاعات حساب بانکی</p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'ذخیره شد' : 'ذخیره تنظیمات'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Online Payment Settings */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">پرداخت آنلاین (درگاه)</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={onlineEnabled} onChange={e => setOnlineEnabled(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className={`space-y-5 transition-opacity ${!onlineEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">ارائه‌دهنده درگاه پرداخت</label>
              <select 
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="zarinpal">زرین‌پال (ZarinPal)</option>
                <option value="zibal">زیبال (Zibal)</option>
                <option value="nextpay">نکست‌پی (NextPay)</option>
                <option value="idpay">آیدی‌پی (IDPay)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">محیط اجرا (Mode)</label>
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setMode('production')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${mode === 'production' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  محیط عملیاتی (Production)
                </button>
                <button
                  onClick={() => setMode('sandbox')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${mode === 'sandbox' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                  محیط تست (Sandbox)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">کد پذیرنده (Merchant ID / API Key)</label>
              <input
                type="text"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-purple-500 dir-ltr text-left"
              />
            </div>
            
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300/80 leading-relaxed font-medium">
                در صورت غیرفعال بودن این بخش، کاربران خطایی دریافت نمی‌کنند، بلکه پیام «درگاه پرداخت موقتاً غیرفعال است» نمایش داده می‌شود.
              </p>
            </div>
          </div>
        </div>

        {/* Manual Payment Settings */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">پرداخت دستی (کارت‌به‌کارت / حواله)</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={manualEnabled} onChange={e => setManualEnabled(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className={`space-y-5 transition-opacity ${!manualEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">شماره کارت بانکی</label>
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                placeholder="0000-0000-0000-0000"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500 dir-ltr text-center tracking-widest"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">نام صاحب حساب</label>
              <input
                type="text"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                placeholder="نام کامل"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">شماره شبا (IBAN) - اختیاری</label>
              <input
                type="text"
                value={iban}
                onChange={e => setIban(e.target.value)}
                placeholder="IR..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500 dir-ltr text-left"
              />
            </div>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              با فعال بودن پرداخت دستی، مشتریان می‌توانند پس از تایید پیش‌فاکتور، مبلغ را واریز کرده و تصویر رسید آن را در گفتگوی پروژه آپلود کنند تا توسط شما بررسی و تایید شود.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
