
import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  MessageSquare, 
  CreditCard, 
  Download, 
  Ticket, 
  Bell, 
  Settings, 
  LogOut, 
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Copy,
  Check,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { CustomerProjectConversation } from './CustomerProjectConversation';
import { PaymentModal } from './PaymentModal';
import { apiFetch } from '../utils/api';

export const CustomerDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('projects');
  const [data, setData] = useState<any>({ requests: [], tickets: [], discountCodes: [] });
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Payment modal state
  const [paymentTarget, setPaymentTarget] = useState<{ title: string; price: string } | null>(null);

  useEffect(() => {
    apiFetch('/api/customer/dashboard')
      .then(res => res.json())
      .then(d => {
        if (!d.error) setData(d);
        setLoading(false);
      });
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isCodeExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < Date.now();
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'بدون محدودیت زمان';
    try {
      return new Date(isoString).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const tabs = [
    { id: 'projects', label: 'پروژه‌های من', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'discounts', label: 'کدهای تخفیف من', icon: <Tag className="w-4 h-4" /> },
    { id: 'conversations', label: 'گفتگوها', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'invoices', label: 'پیش‌فاکتور و مالی', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'downloads', label: 'فایل‌ها و دانلودها', icon: <Download className="w-4 h-4" /> },
    { id: 'tickets', label: 'پشتیبانی', icon: <Ticket className="w-4 h-4" /> },
    { id: 'notifications', label: 'اعلانات', icon: <Bell className="w-4 h-4" /> },
    { id: 'settings', label: 'تنظیمات حساب', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      <aside className="w-full lg:w-64 shrink-0 space-y-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-3 mb-6 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
            م
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">مشتری گرامی</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">کاربر عادی</p>
          </div>
        </div>

        <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
          
          <div className="hidden lg:block h-px bg-slate-200 dark:bg-slate-800 my-2" />
          
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-colors whitespace-nowrap"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج از حساب</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
        
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              پروژه‌های من
            </h2>
            
            {loading ? (
              <p className="text-slate-700 dark:text-slate-300">در حال بارگذاری...</p>
            ) : (!data?.requests || !Array.isArray(data.requests) || data.requests.length === 0) ? (
              <p className="text-slate-500 dark:text-slate-400">پروژه‌ای یافت نشد.</p>
            ) : data.requests.map((req: any) => (
              <div key={req.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 mb-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{(req.idea || req.userName || 'پروژه جدید').substring(0, 50)}...</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">شناسه: {req.id} • تاریخ: {req.timestamp ? new Date(req.timestamp).toLocaleDateString('fa-IR') : 'نامشخص'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {req.status}
                    </div>
                    <button
                      onClick={() => setPaymentTarget({ title: `پیش‌فاکتور پروژه ${req.id}`, price: '۵,۰۰۰,۰۰۰ تومان' })}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/10 dark:bg-purple-600/20 hover:bg-purple-600/20 dark:hover:bg-purple-600/30 text-purple-600 dark:text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>پرداخت فاکتور / واریز</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>وضعیت پرداخت: <strong className="text-amber-600 dark:text-amber-400">کارت به کارت (در انتظار ثبت فیش)</strong></span>
                  <button
                    onClick={() => setActiveTab('conversations')}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>ورود به اتاق گفتگو</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              گفتگوهای پروژه‌ها
            </h2>
            <CustomerProjectConversation />
          </div>
        )}

        {activeTab === 'discounts' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>کدهای تخفیف من</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  لیست کدهای تخفیف اختصاصی صادرشده برای شما و کدهای تخفیف عمومی فعال
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold self-start sm:self-auto">
                {(!data?.discountCodes || data.discountCodes.length === 0) ? 'بدون کد تخفیف' : `${data.discountCodes.length} کد تخفیف موجود`}
              </div>
            </div>

            {(!data?.discountCodes || !Array.isArray(data.discountCodes) || data.discountCodes.length === 0) ? (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                  <Tag className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">هیچ کد تخفیفی برای شما صادر نشده است.</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  می‌توانید در گردونه شانس شرکت کرده و کد تخفیف برنده شوید یا منتظر کدهای تخفیف اختصاصی از طرف مدیریت باشید.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.discountCodes.map((c: any, idx: number) => {
                  const expired = isCodeExpired(c.expiresAt);
                  const isUsed = c.isUsed === 1;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 border border-slate-200 dark:border-slate-700/60 space-y-4 shadow-sm hover:border-purple-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold mb-1">
                            {c.assignedUserId ? '🎁 اختصاصی شما' : '🌐 تخفیف همگانی'}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{c.prize}</h3>
                        </div>

                        {isUsed ? (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold shrink-0">
                            استفاده شده
                          </span>
                        ) : expired ? (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold shrink-0">
                            منقضی شده
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold shrink-0 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> فعال
                          </span>
                        )}
                      </div>

                      {/* Code string box */}
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                        <div className="font-mono font-black text-base text-purple-600 dark:text-purple-400 dir-ltr tracking-wider">
                          {c.code}
                        </div>

                        <button
                          onClick={() => handleCopyCode(c.code)}
                          disabled={isUsed || expired}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
                        >
                          {copiedCode === c.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>کپی شد</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>کپی کد</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Footer Details */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/50">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>مهلت استفاده: <strong>{formatDate(c.expiresAt)}</strong></span>
                        </span>
                        {c.discountPercent > 0 && (
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {c.discountPercent}٪ تخفیف
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(activeTab === 'tickets' || activeTab === 'notifications') && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              {activeTab === 'notifications' ? <Bell className="w-5 h-5 text-amber-500" /> : <Ticket className="w-5 h-5 text-purple-500" />}
              <span>{activeTab === 'notifications' ? 'اعلانات و پیام‌های مدیریت' : 'تیکت‌های پشتیبانی'}</span>
            </h2>

            {(!data?.tickets || !Array.isArray(data.tickets) || data.tickets.length === 0) ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">هیچ پیام یا تیکتی یافت نشد.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.tickets.map((t: any) => (
                  <div key={t.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</h3>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        t.status === 'پیام مدیریت' 
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{t.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab !== 'projects' && activeTab !== 'conversations' && activeTab !== 'tickets' && activeTab !== 'notifications' && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 mb-4 border border-slate-200 dark:border-slate-700">
              {tabs.find(t => t.id === activeTab)?.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">این بخش در حال توسعه است</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">به زودی امکانات جدید در این قسمت در دسترس قرار خواهد گرفت.</p>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {paymentTarget && (
        <PaymentModal
          isOpen={!!paymentTarget}
          onClose={() => setPaymentTarget(null)}
          itemTitle={paymentTarget.title}
          amount={paymentTarget.price}
          lang="fa"
        />
      )}

    </div>
  );
};
