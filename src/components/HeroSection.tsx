import React from 'react';
import { Zap, ArrowLeft, Code2, ShieldCheck, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { BannerConfig } from '../types';

interface HeroSectionProps {
  bannerConfig: BannerConfig;
  onExploreAgents: () => void;
  onRequestCustomApp: () => void;
  lang: 'fa' | 'en';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  bannerConfig,
  onRequestCustomApp,
}) => {
  return (
    <section id="hero" className="relative pt-10 pb-16 md:pt-16 md:pb-28 overflow-hidden">
      
      {/* Background Glow Mesh */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 dark:bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Discount Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold mb-8 shadow-sm">
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-current" />
            <span>{bannerConfig.discountBadge || '🔥 تخفیف ویژه فقط برای ۲۰ روز به مناسبت شروع کار پلتفرم'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.25] mb-6">
            {bannerConfig.headline || 'ایده‌ات را به یک نرم‌افزار واقعی، مدرن و پرسرعت تبدیل کن'}
          </h1>

          {/* Subheadline Description */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-10 max-w-3xl mx-auto">
            {bannerConfig.subheadline || 'تحلیل تخصصی نیازمندی‌ها، طراحی اختصاصی UI/UX، کدنویسی با به‌روزترین تکنولوژی‌ها و استقرار کامل با پشتیبانی و مسئولیت ۱۰۰٪ تیم مهندسی کاسپ.'}
          </p>

          {/* Action Card */}
          <div className="flex flex-col items-center mb-16 relative">
            <div className="bg-white dark:bg-slate-900/90 backdrop-blur-2xl border-2 border-indigo-100 dark:border-indigo-500/20 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl max-w-3xl w-full relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>
               <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-right flex-1">
                    <div className="inline-block px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full mb-3 border border-indigo-200 dark:border-indigo-500/20 tracking-tight">
                      راهکار اقتصادی & تحویل سریع
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start mb-2">
                      <span className="text-xl sm:text-2xl text-slate-400 dark:text-slate-500 line-through decoration-rose-500/60 decoration-2">۱۰,۰۰۰,۰۰۰</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">تعرفه شروع از</span>
                        <span className="text-4xl md:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">۹۹۰,۰۰۰</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">تومان</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      ✓ تحلیل رایگان پروژه‌ها + ضمانت بازگشت وجه در صورت عدم رضایت از کیفیت
                    </p>
                  </div>
                  
                  <div className="shrink-0 w-full md:w-auto flex flex-col gap-2.5">
                    <button
                      onClick={onRequestCustomApp}
                      className="w-full px-8 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-base sm:text-lg shadow-2xl shadow-indigo-600/40 border border-white/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.04] active:scale-95 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform shrink-0" />
                      <span className="relative z-10">بررسی رایگان پروژه & شروع</span>
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform shrink-0" />
                    </button>
                    <a
                      href="https://t.me/kasp0000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors py-1"
                    >
                      💬 گفتگو مستقیم با مشاور فنی
                    </a>
                  </div>
               </div>
            </div>
          </div>

          {/* 3 Core Value Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
            
            {/* Card 1 */}
            <div className="glass-card p-6 rounded-3xl transition-all hover:-translate-y-1 hover:border-indigo-500/40 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                طراحی و توسعه ۱۰۰٪ سفارشی
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                طراحی رابط کاربری مدرن (UI/UX) و کدنویسی ساختاریافته بر اساس نیازمندی‌های دقیق کسب‌وکار شما.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-6 rounded-3xl transition-all hover:-translate-y-1 hover:border-indigo-500/40 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                تحویل فوق‌العاده سریع
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                بهره‌گیری از معماری کامپوننت‌محور و سیستم‌های استقرار خودکار جهت تحویل خروجی در کوتاه‌ترین زمان.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-6 rounded-3xl transition-all hover:-translate-y-1 hover:border-indigo-500/40 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                پشتیبانی & مالکیت سورس‌کد
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                تحویل کامل سورس‌کد و مستندات پروژه همراه با پشتیبانی فنی جهت توسعه و ارتقای بدون محدودیت در آینده.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};


