import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Image as ImageIcon, 
  Users, 
  ArrowLeft,
  LogOut,
  Wrench,
  LifeBuoy,
  Settings,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { KaspLogo } from '../KaspLogo';

export type AdminTab = 'dashboard' | 'agents' | 'services' | 'banners' | 'tickets' | 'crm' | 'settings' | 'payments' | 'receipts';

interface SidebarProps {
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  onBackToLanding: () => void;
  onLogout?: () => void;
  lang: 'fa' | 'en';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeAdminTab,
  setActiveAdminTab,
  onBackToLanding,
  onLogout,
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'داشبورد مدیریت',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'agents',
      label: 'مدیریت ایجنت‌ها',
      icon: <Bot className="w-4 h-4" />
    },
    {
      id: 'services',
      label: 'مدیریت سرویس‌ها',
      icon: <Wrench className="w-4 h-4" />
    },
    {
      id: 'banners',
      label: 'بنرهای تبلیغاتی',
      icon: <ImageIcon className="w-4 h-4" />
    },
    {
      id: 'tickets',
      label: 'تیکت‌های پشتیبانی',
      icon: <LifeBuoy className="w-4 h-4" />
    },
    {
      id: 'crm',
      label: 'سفارشات پروژه CRM',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'payments',
      label: 'تنظیمات پرداخت',
      icon: <CreditCard className="w-4 h-4" />
    },
    {
      id: 'receipts',
      label: 'رسیدهای پرداخت',
      icon: <FileCheck className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'تنظیمات اصلی سایت',
      icon: <Settings className="w-4 h-4" />
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col justify-between shrink-0 shadow-xl transition-colors">
      <div>
        
        {/* Admin Header with KaspLogo */}
        <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
          <KaspLogo size="md" showTagline={true} />
        </div>

        {/* Menu Links */}
        <nav className="mt-6 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeAdminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveAdminTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>

      {/* Footer Back & Logout Buttons */}
      <div className="pt-6 mt-8 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={onBackToLanding}
          className="w-full py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>بازگشت به سایت اصلی</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full py-3 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج از پنل مدیریت</span>
          </button>
        )}
      </div>
    </aside>
  );
};
