import React from 'react';
import { LayoutDashboard, Code, ArrowLeft } from 'lucide-react';
import { KaspLogo } from './KaspLogo';

interface NavbarProps {
  activeTab: 'landing' | 'admin';
  setActiveTab: (tab: 'landing' | 'admin') => void;
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenTicketModal?: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onScrollToSection,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/50 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo with Official Kasp Logo */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="cursor-pointer group hover:opacity-90 transition-opacity"
        >
          <KaspLogo size="md" showTagline={true} />
        </div>

        {/* Center Nav Links (Landing View) */}
        {activeTab === 'landing' && (
          <nav className="hidden lg:flex items-center gap-1.5 bg-white/60 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
            <button
              onClick={() => onScrollToSection('hero')}
              className="px-4 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:shadow-sm border border-transparent transition-all"
            >
              صفحه اصلی
            </button>
            <button
              onClick={() => onScrollToSection('agents')}
              className="px-4 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm border border-transparent transition-all flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500" />
              راهکارها & نمونه‌کارها
            </button>
            <button
              onClick={() => onScrollToSection('pricing')}
              className="px-4 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm border border-transparent transition-all"
            >
              پلن‌ها & تعرفه‌ها
            </button>
            <button
              onClick={() => onScrollToSection('custom-app')}
              className="px-4 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm border border-transparent transition-all flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5 text-indigo-500" />
              توسعه سفارشی
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Telegram Support Link */}
          <a
            href="https://t.me/kasp0000"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 dark:text-sky-400 border border-sky-500/20 text-xs font-bold transition-all hover:scale-105"
            title="پشتیبانی تلگرام Kasp.ir"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 3.98-1.73 6.64-2.87 7.97-3.44 3.8-1.58 4.59-1.86 5.1-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.21-.04.38z"/>
            </svg>
            <span>پشتیبانی تلگرام</span>
          </a>

          {/* User Auth Actions */}
          {activeTab === 'landing' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth ? onOpenAuth('login') : setActiveTab('admin')}
                className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                ورود
              </button>
              <button
                onClick={() => onOpenAuth ? onOpenAuth('signup') : setActiveTab('admin')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 hover:scale-[1.02] transition-transform"
              >
                ثبت نام
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('landing')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <span>بازگشت به صفحه اصلی</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

