
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

export const CustomerDashboard: React.FC<{ onLogout: () => void, onViewReport: (report: any) => void }> = ({ onLogout, onViewReport }) => {
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<any>({ requests: [], tickets: [], discountCodes: [] });
  const [loading, setLoading] = useState(true);

  const handleOpenReport = async (projectId: string) => {
    setLoadingReport(projectId);
    try {
      const res = await apiFetch(`/api/ai-team/projects/${projectId}`);
      if (res.ok) {
        const report = await res.json();
        onViewReport(report);
      } else {
        alert('خطا در دریافت گزارش کامل. لطفاً دوباره تلاش کنید.');
      }
    } catch (e) {
      alert('خطا در برقراری ارتباط با سرور.');
    } finally {
      setLoadingReport(null);
    }
  };

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Payment modal state
  const [paymentTarget, setPaymentTarget] = useState<{ title: string; price: string; orderId?: string; productCode?: string } | null>(null);
  const [isOrderingAI, setIsOrderingAI] = useState(false);

  const fetchDashboardData = () => {
    apiFetch('/api/customer/dashboard')
      .then(res => res.json())
      .then(d => {
        if (!d.error) setData(d);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBuyAICredit = async () => {
    try {
      setIsOrderingAI(true);
      const res = await apiFetch('/api/ai/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productCode: 'kasp-business-report' })
      });
      const order = await res.json();
      if (order && order.id) {
        setPaymentTarget({
          title: `خرید ${order.productName || 'گزارش هوش تجاری KASP'} (سفارش ${order.id.substring(0, 8)})`,
          price: `${(order.amount || 490000).toLocaleString('fa-IR')} تومان`,
          orderId: order.id,
          productCode: order.productCode || 'kasp-business-report'
        });
      } else {
        alert(order.error || 'خطا در ثبت سفارش');
      }
    } catch (err) {
      console.error(err);
      alert('خطا در ارتباط با سرور');
    } finally {
      setIsOrderingAI(false);
    }
  };

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
    { id: 'dashboard', label: 'داشبورد من', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'invoices', label: 'مالی و تراکنش‌ها', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'discounts', label: 'کدهای تخفیف من', icon: <Tag className="w-4 h-4" /> },
    { id: 'tickets', label: 'پشتیبانی', icon: <Ticket className="w-4 h-4" /> },
    { id: 'settings', label: 'تنظیمات حساب', icon: <Settings className="w-4 h-4" /> },
  ];

  const cachedUser = (() => {
    try {
      const u = localStorage.getItem('cached_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const activeUser = data.user || cachedUser;
  const displayName = activeUser?.name?.trim() || activeUser?.email?.split('@')[0] || 'مشتری گرامی';
  const displayEmail = activeUser?.email || 'کاربر سیستم';
  const initialChar = (displayName.charAt(0) || 'م').toUpperCase();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      <aside className="w-full lg:w-64 shrink-0 space-y-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-3 mb-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {initialChar}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">{displayName}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate dir-ltr text-right">{displayEmail}</p>
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
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Credit Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span>تیم هوش مصنوعی شما</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  مدیریت اعتبارات و پروژه‌های تولیدشده توسط KASP
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/"
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>شروع تحلیل جدید</span>
                </a>
                <button
                  onClick={handleBuyAICredit}
                  disabled={isOrderingAI}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>خرید اعتبار (۴۹۰,۰۰۰ تومان)</span>
                </button>
              </div>
            </div>

            {/* Credit Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block mb-1">اعتبار باقیمانده گزارش</span>
                <div className="text-2xl font-black text-purple-900 dark:text-purple-200">
                  {data?.aiEntitlements?.[0]?.creditsRemaining !== undefined 
                    ? `${Number(data.aiEntitlements[0].creditsRemaining).toLocaleString('fa-IR')} گزارش` 
                    : (data.user?.role === 'admin' ? 'نامحدود (ادمین)' : '۰ گزارش')}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">کل گزارش‌های خریداری‌شده</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {data?.aiEntitlements?.[0]?.creditsTotal !== undefined 
                    ? `${Number(data.aiEntitlements[0].creditsTotal).toLocaleString('fa-IR')} عدد` 
                    : (data.user?.role === 'admin' ? 'ادمین' : '۰ عدد')}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">گزارش‌های تکمیل‌شده</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {Array.isArray(data?.aiProjects) ? `${data.aiProjects.length.toLocaleString('fa-IR')} گزارش` : '۰ گزارش'}
                </div>
              </div>
            </div>

            {/* Saved AI Reports Section */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-500" />
                <span>گزارش‌های تحلیل و استراتژی</span>
              </h3>

              {(!data?.aiProjects || !Array.isArray(data.aiProjects) || data.aiProjects.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">هنوز گزارشی توسط تیم هوش مصنوعی برای شما صادر نشده است.</p>
                  <a
                    href="/"
                    className="inline-block text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    شروع اولین تحلیل کسب‌وکار با KASP ←
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.aiProjects.map((p: any) => (
                    <div
                      key={p.id}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-500/40 transition-all"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{p.businessGoal}</h4>
                          {p.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                              {p.badge}
                            </span>
                          )}
                          {p.score !== null && p.score !== undefined && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              امتیاز فرصت: {p.score} از ۱۰۰
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          شناسه: {p.id} • تاریخ ثبت: {formatDate(p.createdAt)}
                          {p.verdict ? ` • نتیجه: ${p.verdict}` : ''}
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenReport(p.id)}
                        disabled={loadingReport === p.id}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-300 hover:bg-purple-600/20 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{loadingReport === p.id ? 'در حال بارگذاری...' : 'مشاهده گزارش کامل هوش تجاری'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              <span>مالی و تراکنش‌ها</span>
            </h2>

            {/* AI Orders History in Invoices tab */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">سوابق خرید و تراکنش‌های حساب</h3>

              {(!data?.aiOrders || !Array.isArray(data.aiOrders) || data.aiOrders.length === 0) ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">سفارشی ثبت نشده است.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right text-slate-700 dark:text-slate-300">
                    <thead className="text-[11px] uppercase bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-3 py-3 rounded-tr-xl">کد سفارش</th>
                        <th className="px-3 py-3">نام محصول</th>
                        <th className="px-3 py-3">مبلغ (تومان)</th>
                        <th className="px-3 py-3">وضعیت</th>
                        <th className="px-3 py-3 rounded-tl-xl">تاریخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                      {data.aiOrders.map((o: any) => (
                        <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-3 py-3 font-mono font-bold text-slate-900 dark:text-white">{o.id.substring(0, 8)}...</td>
                          <td className="px-3 py-3 font-bold">{o.productName || 'گزارش هوش تجاری KASP'}</td>
                          <td className="px-3 py-3 font-mono">{(Number(o.amount) || 490000).toLocaleString('fa-IR')}</td>
                          <td className="px-3 py-3">
                            {o.status === 'confirmed' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                ✓ تایید شده و فعال
                              </span>
                            ) : o.status === 'pending' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                ⏳ در انتظار تایید رسید
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                ✕ رد شده
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-slate-500 font-mono dir-ltr text-right">{formatDate(o.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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

        {activeTab !== 'dashboard' && activeTab !== 'invoices' && activeTab !== 'discounts' && activeTab !== 'tickets' && (
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
          orderId={paymentTarget.orderId}
          productCode={paymentTarget.productCode}
          onPaymentSuccess={fetchDashboardData}
          lang="fa"
        />
      )}

    </div>
  );
};
