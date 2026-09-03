import React, { useState, useEffect } from 'react';
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
  // 24-Hour Countdown Timer for limited discount
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const secondsInDay = 86400;
      const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const remaining = secondsInDay - currentSeconds;
      
      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDigits = (num: number) => num.toString().padStart(2, '0');

  const discountText = bannerConfig.discountBadge && !bannerConfig.discountBadge.includes('فقط برای ۲۰ روز')
    ? bannerConfig.discountBadge
    : '🔥 تخفیف ویژه به مناسبت شروع کار پلتفرم Kasp.ir';

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
            <span>{discountText}</span>
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
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-500/20">
                        ⚡ طرح ویژه اکو / جوانه
                      </span>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>مهلت تخفیف ۲۴ ساعته:</span>
                        <span className="font-mono dir-ltr font-black">
                          {formatDigits(timeLeft.hours)}:{formatDigits(timeLeft.minutes)}:{formatDigits(timeLeft.seconds)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start mb-2">
                      <span className="text-lg sm:text-xl text-slate-400 dark:text-slate-500 line-through decoration-rose-500/70 decoration-2">۹۹۰,۰۰۰</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">تعرفه شروع از</span>
                        <span className="text-4xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">۱۹۹,۰۰۰</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">تومان</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black">
                        ۸۰٪ تخفیف
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      ✓ تحلیل و شروع سریع پروژه + کدنویسی باکیفیت و استقرار روی دامنه
                    </p>
                  </div>
                  
                  <div className="shrink-0 w-full md:w-auto flex flex-col gap-2.5">
                    <button
                      onClick={onRequestCustomApp}
                      className="w-full px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-lg sm:text-xl shadow-2xl shadow-indigo-600/40 border border-white/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.04] active:scale-95 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <Sparkles className="w-6 h-6 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform shrink-0" />
                      <span className="relative z-10">شروع</span>
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform shrink-0" />
                    </button>
                    <a
                      href="https://t.me/kasp0000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors py-1"
                    >
                      💬 گفتگو مستقیم با مشاور فنی در تلگرام
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


