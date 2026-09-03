import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Rocket, Crown, Code2, Plus, Clock, Sparkles } from 'lucide-react';

export const PricingSection: React.FC = () => {
  // 24-Hour Countdown Timer that smoothly cycles
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

  const plans = [
    {
      id: 'seed',
      name: 'جوانه (اکو)',
      badge: '⚡ تخفیف استثنایی شروع پلتفرم',
      icon: <Star className="w-6 h-6 text-emerald-500" />,
      oldPrice: '۹۹۰,۰۰۰',
      price: '۱۹۹,۰۰۰',
      hasTimer: true,
      color: 'emerald',
      usagePct: 92,
      description: 'طرح شگفت‌انگیز شروع؛ مناسب برای دانشجوها، استارتاپ‌های تازه و تست ایده‌ها با هزینه استثنایی',
      buttonText: 'شروع',
      features: [
        'مشاوره اولیه و تحلیل نیاز فنی',
        'طراحی یک صفحه یا وب‌سایت شیک و پرسرعت',
        'طراحی کاملاً واکنش‌گرا (موبایل و دسکتاپ)',
        'اتصال فرم تماس و شبکه‌های اجتماعی',
        'سئوی پایه و کدنویسی استاندارد',
        'تحویل فوق‌سریع ۲ تا ۳ روز',
        'یک بار بازبینی و اصلاح رایگان',
        'استقرار روی دامنه اختصاصی',
        'آموزش کوتاه مدیریت سایت'
      ]
    },
    {
      id: 'growth',
      name: 'رشد',
      icon: <Rocket className="w-6 h-6 text-blue-500" />,
      price: '۲,۹۹۰,۰۰۰',
      color: 'blue',
      usagePct: 58,
      description: 'مناسب برای کسب‌وکارهای کوچک و در حال توسعه',
      buttonText: 'شروع پلن رشد',
      features: [
        'تمامی امکانات پلن جوانه',
        'طراحی لوگو اختصاصی',
        'صفحات بیشتر',
        'طراحی اختصاصی‌تر',
        'فرم‌های پیشرفته',
        'اتصال واتساپ و اینستاگرام',
        'پنل مدیریت ساده',
        'سئوی بهتر و سرعت بالاتر',
        'امنیت بهتر',
        'دو مرحله اصلاح',
        'تحویل ۴ تا ۶ روز'
      ]
    },
    {
      id: 'acceleration',
      name: 'شتاب',
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      price: '۵,۹۹۰,۰۰۰',
      color: 'purple',
      usagePct: 83,
      popular: true,
      description: 'ارزش فوق‌العاده برای کسب‌وکارهای حرفه‌ای و رو به رشد',
      buttonText: 'شروع پلن شتاب',
      features: [
        'طراحی کاملاً اختصاصی (UI/UX)',
        'طراحی لوگو اختصاصی',
        'تحلیل کامل کسب‌وکار و طراحی دیتابیس',
        'مستندسازی پروژه',
        'فرم‌های اختصاصی',
        'داشبورد مدیریتی و پنل کاربران',
        'سیستم ورود و ثبت‌نام',
        'اتصال پیامک و درگاه پرداخت',
        'تست کامل و بهینه‌سازی سرعت',
        'پشتیبانی یک‌ماهه و سه مرحله اصلاح',
        'تحویل ۷ تا ۱۰ روز'
      ]
    },
    {
      id: 'custom',
      name: 'سازمانی و خاص',
      icon: <Crown className="w-6 h-6 text-rose-500" />,
      price: 'توافقی',
      color: 'rose',
      usagePct: 100,
      description: 'طراحی ویژه پروژه‌های بزرگ، سیستم‌ها و اپلیکیشن‌ها',
      buttonText: 'شروع مشاوره اختصاصی',
      features: [
        'اپلیکیشن‌های پیشرفته',
        'سیستم‌های بزرگ و یکپارچه',
        'نرم‌افزارهای CRM و ERP',
        'اتوماسیون‌های سازمانی',
        'سامانه‌های اختصاصی با معماری پیچیده',
        'توسعه ماژولار و مقیاس‌پذیر',
        'زیرساخت ابری اختصاصی',
        'تیم توسعه اختصاصی',
        'قرارداد پشتیبانی بلندمدت',
        'زمان‌بندی فازبندی شده'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-900/40 relative overflow-hidden transition-colors border-y border-slate-200 dark:border-slate-800/80">
      <div className="absolute top-1/4 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-600 dark:text-purple-400 shadow-sm border border-purple-200/50 dark:border-purple-800/50">
            <Code2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            تعرفه‌های <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">طراحی و توسعه</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ما برای هر نیاز و بودجه‌ای، یک راهکار استاندارد و حرفه‌ای داریم. از تست ایده تا پیاده‌سازی سیستم‌های سازمانی، همراه شما هستیم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full
                ${plan.popular 
                  ? 'border-purple-500 dark:border-purple-500/50 shadow-purple-500/10 shadow-xl' 
                  : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap">
                  پیشنهاد ویژه
                </div>
              )}

              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap animate-pulse">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${plan.color}-100 dark:bg-${plan.color}-900/30 border border-${plan.color}-200 dark:border-${plan.color}-800/50`}>
                    {plan.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 block">میزان محبوبیت:</span>
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400 font-mono">{plan.usagePct}٪</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[40px]">
                  {plan.description}
                </p>
                
                {/* Usage progress bar */}
                <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${plan.usagePct}%` }}
                  />
                </div>
              </div>

              {/* Price & Countdown Timer */}
              <div className="mb-6 space-y-2">
                {plan.oldPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-400 dark:text-slate-500 line-through decoration-rose-500 decoration-2">
                      {plan.oldPrice} تومان
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold">
                      ۸۰٪ تخفیف
                    </span>
                  </div>
                )}

                {plan.price === 'توافقی' ? (
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{plan.price}</span>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">تومان</span>
                  </div>
                )}

                {/* 24-Hour Countdown Timer for Limited Offer */}
                {plan.hasTimer && (
                  <div className="mt-3 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2 text-amber-700 dark:text-amber-300">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Clock className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                      <span>مهلت تخفیف ۲۴ ساعته:</span>
                    </div>
                    <div className="font-mono font-black text-sm tracking-wider dir-ltr bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-amber-500/30 text-amber-800 dark:text-amber-200">
                      {formatDigits(timeLeft.hours)}:{formatDigits(timeLeft.minutes)}:{formatDigits(timeLeft.seconds)}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                  <span>امکانات این پلن</span>
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-${plan.color}-100 dark:bg-${plan.color}-900/30 text-${plan.color}-600 dark:text-${plan.color}-400`}>
                        {idx === 0 && plan.id !== 'seed' ? <Plus className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                      </div>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all
                  ${plan.id === 'seed'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/40 hover:scale-[1.02]'
                    : plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                  }
                `}
                onClick={() => {
                  const target = document.getElementById('custom-app');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {plan.buttonText || 'شروع پروژه'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
