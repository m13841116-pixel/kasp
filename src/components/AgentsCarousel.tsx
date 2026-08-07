import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Languages, 
  FileText, 
  Bot, 
  Code2, 
  TrendingUp, 
  Globe,
  CreditCard,
} from 'lucide-react';
import { AIAgent } from '../types';

interface AgentsCarouselProps {
  agents: AIAgent[];
  onTryAgent: (agent: AIAgent) => void;
  lang: 'fa' | 'en';
  onOpenPayment?: (title: string, price: string) => void;
}

export const AgentsCarousel: React.FC<AgentsCarouselProps> = ({
  agents,
  onTryAgent,
  onOpenPayment,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  useEffect(() => {
    if (!isAutoplay || agents.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % agents.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoplay, agents.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? agents.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % agents.length);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'Languages': return <Languages className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6 text-pink-600 dark:text-pink-400" />;
      case 'Bot': return <Bot className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'Code2': return <Code2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      default: return <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    }
  };

  const activeAgent = agents[currentIndex] || agents[0];

  return (
    <section id="agents" className="py-16 md:py-24 bg-slate-50/80 dark:bg-slate-900/40 relative border-y border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-3 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>سامانه‌ها & محصولات تخصصی آنلاین</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              محصولات & ابزارهای آماده KASP
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl leading-relaxed font-normal">
              مجموعه‌ای از سرویس‌ها و پلتفرم‌های آنلاین کاسپ که به عنوان راهکارهای آماده و تخصصی برای ارتقای کسب‌وکار شما در دسترس هستند.
            </p>
          </div>

          {/* Autoplay & Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoplay(!isAutoplay)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-800 flex items-center gap-2 transition-colors shadow-sm"
              title="تغییر حرکت خودکار اسلاید"
            >
              {isAutoplay ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
              <span>{isAutoplay ? 'توقف اسلاید' : 'پخش اسلاید'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors shadow-sm"
                aria-label="ایجنت قبلی"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors shadow-sm"
                aria-label="ایجنت بعدی"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Slider Stage */}
        {activeAgent && (
          <div className="relative bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xl transition-all duration-500 mb-12">
            
            {/* Background Glow */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Info Column */}
              <div className="lg:col-span-7 space-y-6 text-right">
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-inner">
                    {renderIcon(activeAgent.icon)}
                  </div>
                  <div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                      {activeAgent.category}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                      {activeAgent.title}
                    </h3>
                  </div>
                </div>

                {/* Subdomain Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-blue-700 dark:text-blue-400 dir-ltr">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>https://{activeAgent.subdomain}</span>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {activeAgent.description}
                </p>

                {/* Features List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {activeAgent.features.map((ft, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{ft}</span>
                    </div>
                  ))}
                </div>

                {/* Price & Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                      تعرفه و اشتراک:
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-400">
                      {activeAgent.price}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onTryAgent(activeAgent)}
                      className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      تست زنده ایجنت
                    </button>

                    {onOpenPayment && (
                      <button
                        onClick={() => onOpenPayment(`اشتراک ${activeAgent.title}`, activeAgent.price)}
                        className="px-4 py-3 rounded-xl bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-800/60 text-purple-800 dark:text-purple-300 font-bold text-xs border border-purple-300 dark:border-purple-700/50 flex items-center gap-1.5 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>خرید اشتراک</span>
                      </button>
                    )}

                    <a
                      href={`https://${activeAgent.subdomain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 hover:scale-105 transition-all"
                    >
                      <span>ورود به ابزار</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

              </div>

              {/* Right Interactive Card Mockup Preview */}
              <div className="lg:col-span-5">
                <div className="bg-slate-50 dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 space-y-4 shadow-md relative group">
                  
                  {/* Fake App Window Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{activeAgent.subdomain}</span>
                  </div>

                  {/* Mock Interactive Interface */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3 font-sans text-xs text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                      <span>وضعیت سرور: فعال</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">آپتایم ۹۹.۹٪</span>
                    </div>

                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40">
                      <p className="text-purple-800 dark:text-purple-300 font-bold mb-1">⚡ ایجنت هوشمند فعال</p>
                      <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium">
                        "{activeAgent.title} آماده پردازش و ارائه خدمات هوشمند"
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40">
                      <p className="text-blue-800 dark:text-blue-300 text-xs leading-relaxed font-medium">
                        تولید آنی خروجی با کیفیت بالا و پردازش زبان فارسی به سبک Kasp AI.
                      </p>
                    </div>
                  </div>

                  <div className="text-center pt-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      پیش‌نمایش آنلاین میکرواپ متصل به Kasp.ir
                    </span>
                  </div>

                </div>
              </div>

            </div>

            {/* Pagination Indicator Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {agents.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === idx ? 'w-8 bg-purple-600 dark:bg-purple-500' : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                  }`}
                  aria-label={`اسلاید ${idx + 1}`}
                />
              ))}
            </div>

          </div>
        )}

        {/* ALL AGENTS GRID DISPLAY */}
        <div className="mt-12">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>لیست تمام ایجنت‌های هوش مصنوعی فعال کاسپ</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-4 group shadow-md hover:shadow-xl"
              >
                <div className="space-y-3 text-right">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-500/30">
                      {agent.category}
                    </span>
                    <span className="text-xs font-mono text-blue-700 dark:text-blue-400 dir-ltr bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 font-bold">
                      {agent.subdomain}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 dark:text-white text-lg group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    {agent.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {agent.description}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    {agent.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">قیمت اشتراک:</span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{agent.price}</span>
                  </div>

                  <a
                    href={`https://${agent.subdomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
                  >
                    <span>ورود به ابزار</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
