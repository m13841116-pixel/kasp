
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
  ShieldCheck
} from 'lucide-react';
import { CustomerProjectConversation } from './CustomerProjectConversation';
import { PaymentModal } from './PaymentModal';
import { apiFetch } from '../utils/api';

export const CustomerDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('projects');
  const [data, setData] = useState<any>({ requests: [], tickets: [] });
  const [loading, setLoading] = useState(true);

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

  const tabs = [
    { id: 'projects', label: 'پروژه‌های من', icon: <FolderGit2 className="w-4 h-4" /> },
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
            ) : data.requests.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">پروژه‌ای یافت نشد.</p>
            ) : data.requests.map((req: any) => (
              <div key={req.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 mb-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{req.idea.substring(0, 50)}...</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">شناسه: {req.id} • تاریخ: {new Date(req.timestamp).toLocaleDateString('fa-IR')}</p>
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

        {activeTab !== 'projects' && activeTab !== 'conversations' && (
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
