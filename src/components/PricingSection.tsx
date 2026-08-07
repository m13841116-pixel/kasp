import React from 'react';
import { Check, Star, Zap, Rocket, Crown, Code2, Plus } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const plans = [
    {
      id: 'seed',
      name: 'جوانه',
      icon: <Star className="w-6 h-6 text-emerald-500" />,
      price: '۹۹۰,۰۰۰',
      color: 'emerald',
      usagePct: 25,
      description: 'مناسب برای دانشجوها، استارتاپ‌های تازه و تست ایده‌ها',
      features: [
        'مشاوره اولیه',
        'تحلیل نیاز',
        'طراحی یک صفحه یا سایت ساده',
        'طراحی واکنش‌گرا',
        'اتصال فرم تماس',
        'سئوی پایه',
        'تحویل ۲ تا ۳ روز',
        'یک بار اصلاح رایگان',
        'استقرار روی دامنه',
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
      name: 'اختصاصی',
      icon: <Crown className="w-6 h-6 text-rose-500" />,
      price: 'توافقی',
      color: 'rose',
      usagePct: 100,
      description: 'طراحی ویژه پروژه‌های بزرگ، سیستم‌ها و اپلیکیشن‌ها',
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

              <div className="mb-8">
                {plan.price === 'توافقی' ? (
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{plan.price}</span>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">تومان</span>
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
                  ${plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                  }
                `}
                onClick={() => document.getElementById('custom-app')?.scrollIntoView({ behavior: 'smooth' })}
              >
                شروع پروژه
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
