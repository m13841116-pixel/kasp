import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { KaspLogo } from './KaspLogo';

interface FooterProps {
  lang: 'fa' | 'en';
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="glass-panel border-t border-slate-200/80 dark:border-slate-800/80 py-12 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-200/60 dark:border-slate-800">
          
          {/* Col 1 */}
          <div className="space-y-3">
            <KaspLogo size="lg" showTagline={false} />
            <p className="text-slate-400 text-xs leading-relaxed mt-2">
              پلتفرم پیشرو میکرواستارتاپ‌های هوش مصنوعی و توسعه سفارشی نرم‌افزار با تعرفه اقتصادی و شفاف استارتاپی.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 tracking-wider">
              ایجنت‌های اصلی
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="https://caption.kasp.ir" target="_blank" rel="noreferrer" className="hover:text-purple-300 transition-colors">ایجنت تولید کپشن اینستاگرام</a></li>
              <li><a href="https://script.kasp.ir" target="_blank" rel="noreferrer" className="hover:text-purple-300 transition-colors">دستیار ادیت و سناریو ویدیو</a></li>
              <li><a href="https://analytics.kasp.ir" target="_blank" rel="noreferrer" className="hover:text-purple-300 transition-colors">ابزار تحلیل فروشگاه آنلاین</a></li>
              <li><a href="https://support.kasp.ir" target="_blank" rel="noreferrer" className="hover:text-purple-300 transition-colors">پشتیبان هوشمند مشتریان</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 tracking-wider">
              دسترسی سریع
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#custom-app" className="hover:text-purple-300 transition-colors">سفارش نرم‌افزار اختصاصی</a></li>
              <li><a href="#custom-app" className="hover:text-purple-300 transition-colors">تعرفه مناسب استارتاپی</a></li>
              <li><a href="#agents" className="hover:text-purple-300 transition-colors">ویترین ایجنت‌ها</a></li>
            </ul>
          </div>

          {/* Col 4 - Telegram Support */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 tracking-wider">
              ارتباط و پشتیبانی Kasp.ir
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              پشتیبانی و مشاوره سریع توسعه میکرواستارتاپ‌ها از طریق آیدی رسمی تلگرام:
            </p>
            
            <a
              href="https://t.me/kasp0000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold transition-all hover:scale-105"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 3.98-1.73 6.64-2.87 7.97-3.44 3.8-1.58 4.59-1.86 5.1-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.21-.04.38z"/>
              </svg>
              <span>پشتیبانی تلگرام: kasp0000@</span>
            </a>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <p>© ۱۴۰۳ تمامی حقوق متعلق به پلتفرم کاسپ (Kasp.ir) می‌باشد.</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>تضمین امنیت، سرعت و کیفیت توسعه نرم‌افزار</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

