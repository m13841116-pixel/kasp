import React from 'react';
import { Bot, Code2, Zap, Layout, Smartphone, Cpu, CheckCircle2, ArrowLeft } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServicesSectionProps {
  services: ServiceItem[];
  onRequestCustomApp: () => void;
}

const defaultServices: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'افزودن هوش مصنوعی به نرم‌افزار شما',
    description: 'پیاده‌سازی قابلیت‌های هوشمند (پاسخگویی خودکار، پردازش زبان طبیعی، تولید محتوا و اتوماسیون) به عنوان بخشی از وب‌اپلیکیشن یا نرم‌افزار اختصاصی کسب‌وکار شما.',
    icon: 'Bot',
    badge: 'پرتقاضاترین',
    features: ['اتصال به Gemini و GPT-4o', 'درک زبان طبیعی فارسی', 'یکپارچه‌سازی کامل داخل نرم‌افزار اختصاصی شما', 'پشتیبانی ۲۴ ساعته'],
    estimatedDelivery: '۷ الی ۱۴ روز',
    orderNum: 1,
    isActive: true
  },
  {
    id: 'srv-2',
    title: 'توسعه اختصاصی سیستم‌ها و نرم‌افزار',
    description: 'طراحی و برنامه‌نویسی نرم‌افزارهای تحت وب، پنل‌های مدیریتی، پلتفرم‌های سازمانی و داشبوردهای تحلیل داده.',
    icon: 'Code2',
    badge: '۹۰٪ تخفیف',
    features: ['معماری مدرن React & Node.js', 'دیتابیس سریع و امن', 'رابط کاربری مدرن (RTL)', 'تحویل سورس کد کامل'],
    estimatedDelivery: '۱۴ الی ۲۱ روز',
    orderNum: 2,
    isActive: true
  },
  {
    id: 'srv-3',
    title: 'اتوماسیون فرآیندهای کسب‌وکار',
    description: 'اتصال نرم‌افزارها، درگاه‌های بانکی، سیستم‌های انبارداری و CRM به یکدیگر جهت حذف کارهای تکراری.',
    icon: 'Zap',
    badge: 'افزایش بهره‌وری',
    features: ['ارسال اتوماتیک پیامک و فاکتور', 'اتصال وب‌سایت به تلگرام', 'همگام‌سازی انبار و فروش', 'گزارش‌گیری اتوماتیک'],
    estimatedDelivery: '۵ الی ۱۰ روز',
    orderNum: 3,
    isActive: true
  },
  {
    id: 'srv-4',
    title: 'طراحی و توسعه وب‌اپلیکیشن (PWA)',
    description: 'ساخت وب‌سایت‌ها و اپلیکیشن‌های تحت وب با سرعت فوق‌العاده بالا، تجربه کاربری روان و بهینه‌سازی کامل سئو.',
    icon: 'Layout',
    features: ['طراحی کاملاً واکنش‌گرا', 'قابلیت نصب روی موبایل', 'سرعت بارگذاری زیر ۱ ثانیه', 'سئوی استاندارد Google'],
    estimatedDelivery: '۱۰ الی ۱۴ روز',
    orderNum: 4,
    isActive: true
  },
  {
    id: 'srv-5',
    title: 'توسعه اپلیکیشن موبایل (iOS & Android)',
    description: 'ساخت اپلیکیشن‌های موبایل اختصاصی با طراحی نوین، عملکرد روان و اتصال به سرور هوش مصنوعی.',
    icon: 'Smartphone',
    features: ['پشتیبانی از اندروید و iOS', 'طراحی UI/UX اختصاصی', 'اعلان‌های آنی (Push Notification)', 'انتشار در استورهای ایرانی'],
    estimatedDelivery: '۱۴ الی ۲۸ روز',
    orderNum: 5,
    isActive: true
  },
  {
    id: 'srv-6',
    title: 'توسعه API & معماری بک‌اند هوش مصنوعی',
    description: 'طراحی و پیاده‌سازی سرویس‌های سرور، APIهای پرسرعت، امنیت لایه‌ای و اتصال به سرویس‌های هوش مصنوعی.',
    icon: 'Cpu',
    features: ['معماری Express/FastAPI', 'امنیت بالا و رمزنگاری داده', 'پشتیبانی از ترافیک بالا', 'مستندات Swagger API'],
    estimatedDelivery: '۷ الی ۱۴ روز',
    orderNum: 6,
    isActive: true
  }
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services, onRequestCustomApp }) => {
  const displayServices = services && services.length > 0 ? services : defaultServices;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot': return <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'Code2': return <Code2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'Zap': return <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'Layout': return <Layout className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'Smartphone': return <Smartphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
      default: return <Cpu className="w-6 h-6 text-sky-600 dark:text-sky-400" />;
    }
  };

  return (
    <section id="services" className="py-16 md:py-24 bg-slate-100/50 dark:bg-slate-900/30 relative overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-4 border border-indigo-500/20">
            <span>تخصص‌های اصلی کاسپ (Kasp.ir)</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            سرویس‌های تخصصی توسعه نرم‌افزار و هوش مصنوعی
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-normal">
            از ساخت ایجنت‌های هوشمند خودکار تا توسعه سیستم‌های پیچیده سازمانی و وب‌اپلیکیشن‌ها؛ ما ایده شما را به محصولی واقعی و درآمدزا تبدیل می‌کنیم.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service) => (
            <div
              key={service.id}
              className="glass-card rounded-2xl p-7 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    {renderIcon(service.icon)}
                  </div>
                  {service.badge && (
                    <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60">
                      {service.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 leading-snug">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-6">
                  {service.description}
                </p>

                {/* Features Checklist */}
                <ul className="space-y-2.5 mb-6 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {service.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  زمان تحویل: <strong className="text-slate-900 dark:text-slate-200 font-bold">{service.estimatedDelivery}</strong>
                </span>
                <button
                  onClick={onRequestCustomApp}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                >
                  <span>سفارش این سرویس</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
