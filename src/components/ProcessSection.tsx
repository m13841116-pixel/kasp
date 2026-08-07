import React from 'react';
import { MessageSquare, BrainCircuit, Code, Rocket } from 'lucide-react';

export const ProcessSection: React.FC = () => {
  const steps = [
    {
      stepNum: '۰۱',
      title: 'ثبت ایده و مشاوره اولیه',
      description: 'شما توضیحات اولیه ایده یا نیاز نرم‌افزاری کسب‌وکارتان را در فرم سفارش یا پشتیبانی تلگرام مطرح می‌کنید.',
      icon: MessageSquare,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      stepNum: '۰۲',
      title: 'تحلیل تخصصی معماری و هزینه',
      description: 'تیم تخصصی مهندسی و برنامه‌نویسان ارشد کاسپ امکان‌پذیری فنی، پشته تکنولوژی و تخمین دقیق زمان و هزینه را مشخص می‌کنند.',
      icon: BrainCircuit,
      color: 'from-purple-500 to-pink-600',
    },
    {
      stepNum: '۰۳',
      title: 'توسعه سریع، کدنویسی و تست',
      description: 'پروژه با معماری اختصاصی و ماژولار پیاده‌سازی شده، دیتابیس همگام گشته و تست‌های امنیتی لایه‌ای اجرا می‌شود.',
      icon: Code,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      stepNum: '۰۴',
      title: 'تحویل، استقرار و پشتیبانی',
      description: 'پروژه روی سرور یا دامنه اختصاصی شما منتشر شده و سورس کد کامل به همراه پشتیبانی تحویل داده می‌شود.',
      icon: Rocket,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <section id="process" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/40 relative overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 text-xs font-bold mb-4 border border-purple-200 dark:border-purple-500/20">
            <span>مسیر شفاف اجرای پروژه</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            فرآیند ۴ مرحله‌ای ساخت پروژه در کاسپ
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-4 leading-relaxed font-medium">
            روالی ساده، شفاف و بدون بروکراسی اداری از ایده اولیه تا تحویل نهایی نرم‌افزار روی دامنه اختصاصی شما.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-xl relative group hover:border-purple-500/40 transition-all hover:-translate-y-1"
              >
                {/* Step Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shadow-md`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-300 dark:text-slate-700 group-hover:text-purple-500 transition-colors">
                    {step.stepNum}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
