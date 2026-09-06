import React, { useState, useEffect } from 'react';
import { Zap, ArrowLeft, Code2, ShieldCheck, Clock, CheckCircle, Sparkles, Bot, BrainCircuit, Search, Megaphone } from 'lucide-react';
import { BannerConfig } from '../types';

interface HeroSectionProps {
  bannerConfig: BannerConfig;
  onExploreAgents: () => void;
  onRequestCustomApp: () => void;
  onStartAITeam?: (goal?: string) => void;
  lang: 'fa' | 'en';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  bannerConfig,
  onRequestCustomApp,
  onStartAITeam,
}) => {
  const [heroGoal, setHeroGoal] = useState('');
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
    : '🚀 KASP: نیروی کار هوش مصنوعی برای تحلیل و رشد کسب‌وکار شما';

  const QUICK_PROMPTS = [
    'می‌خواهم یک فروشگاه آنلاین لوازم ورزشی راه بیندازم',
    'دنبال استراتژی فروش برای خدمات مشاوره خودم هستم',
    'می‌خواهم فروش محصول نرم‌افزاری‌ام را ۲ برابر کنم'
  ];

  const handleTriggerAITeam = (promptText?: string) => {
    const textToUse = (promptText || heroGoal).trim();
    if (onStartAITeam) {
      onStartAITeam(textToUse);
    } else {
      const section = document.getElementById('ai-team-workforce');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="hero" className="relative pt-10 pb-16 md:pt-16 md:pb-28 overflow-hidden">
      
      {/* Background Glow Mesh */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 dark:bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Discount & Ecosystem Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold mb-6 shadow-sm">
            <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-current" />
            <span>{discountText}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.25] mb-5">
            هدفت را به <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">KASP</span> بده؛ تیم هوش مصنوعی برای انجامش تشکیل می‌شود
          </h1>

          {/* Subheadline Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-8 max-w-3xl mx-auto">
            KASP یک تیم از کارمندان هوش مصنوعی است که هدف کسب‌وکار شما را بررسی می‌کند، بازار و رقبا را با جستجوی زنده تحلیل می‌کند، و نقشه عملی و قطعی رسیدن به هدف را برایتان می‌سازد.
          </p>

          {/* PRIMARY INTERACTIVE HERO GOAL INPUT */}
          <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-indigo-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl max-w-3xl mx-auto mb-10 text-right">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
              هدف یا مسئله کسب‌وکار خود را به زبان ساده بنویسید:
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <input
                type="text"
                value={heroGoal}
                onChange={(e) => setHeroGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTriggerAITeam();
                }}
                placeholder="مثلاً: می‌خواهم یک برند لباس ورزشی برای آقایان ۱۸ تا ۳۵ سال راه‌اندازی کنم..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button
                onClick={() => handleTriggerAITeam()}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
              >
                <span>شروع با KASP</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt suggestions */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold">پیشنهاد سریع:</span>
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setHeroGoal(prompt);
                    handleTriggerAITeam(prompt);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center mb-10">
            <button
              onClick={() => handleTriggerAITeam()}
              className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline underline-offset-4 flex items-center gap-1.5"
            >
              <span>تیم هوش مصنوعی را ببینید</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Core Value Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
            
            {/* Card 1 */}
            <div className="glass-card p-6 rounded-3xl transition-all hover:-translate-y-1 hover:border-indigo-500/40 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                کارمندان تخصصی هوش مصنوعی
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                KASP شامل کارشناس تحقیق بازار، تحلیلگر رقبا، و استراتژیست فروش است که با نظارت مدیر AI پروژه شما را جلو می‌برند.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-6 rounded-3xl transition-all hover:-translate-y-1 hover:border-indigo-500/40 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                تحقیق زنده و داده‌محور
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                تیم هوش مصنوعی به اینترنت متصل است و جدیدترین آمارها، رقبا و روندهای بازار را جستجو و مستندسازی می‌کند.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-6 rounded-3xl transition-all hover:-translate-y-1 hover:border-indigo-500/40 border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                خروجی اجرایی و برنامه ۳۰ روزه
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                به‌جای دریافت یک متن ساده، شما گزارش هوش تجاری ۱۴ بخشی، تصمیم نهایی و لیست کارهای ۳۰ روزه دریافت می‌کنید.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};



