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
  ArrowLeft,
  Cpu
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
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Determine items per page: responsive sliding
  // On desktop we display sliding items nicely
  const totalAgents = agents.length;

  useEffect(() => {
    if (!isAutoplay || totalAgents <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalAgents);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoplay, totalAgents]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalAgents - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalAgents);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'Languages': return <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />;
      case 'Bot': return <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default: return <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  if (!agents || agents.length === 0) return null;

  return (
    <section id="agents" className="py-12 md:py-16 bg-gradient-to-b from-slate-50/70 to-white dark:from-slate-900/30 dark:to-slate-950 border-y border-slate-200/80 dark:border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2.5 border border-purple-500/20">
              <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>ویترین میکرواستارتاپ‌ها & ایجنت‌های هوش مصنوعی KASP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ایجنت‌های هوشمندی که برای کسب‌وکارها می‌سازیم
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-normal leading-relaxed">
              نمونه‌هایی از دستیاران و سرویس‌های تخصصی هوش مصنوعی که طراحی، برنامه‌نویسی و مستقر کرده‌ایم.
            </p>
          </div>

          {/* Carousel Navigation Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAutoplay(!isAutoplay)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
              title="تغییر حالت چرخش خودکار"
            >
              {isAutoplay ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
              <span className="hidden sm:inline">{isAutoplay ? 'توقف' : 'پخش'}</span>
            </button>

            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition-colors shadow-sm active:scale-95"
              aria-label="ایجنت قبلی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition-colors shadow-sm active:scale-95"
              aria-label="ایجنت بعدی"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Viewport: Compact, clear card layout */}
        <div className="relative overflow-hidden py-1">
          <div 
            className="flex transition-transform duration-500 ease-out gap-5"
            style={{ 
              transform: `translateX(${currentIndex * 100}%)`,
            }}
          >
            {/* Map through all agents */}
            {agents.map((agent, index) => {
              const isCurrent = index === currentIndex;
              return (
                <div 
                  key={agent.id}
                  className="w-full md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] shrink-0 bg-white dark:bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-500/50 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3.5 text-right">
                    
                    {/* Card Top: Icon & Category */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                          {renderIcon(agent.icon)}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-700/50">
                            {agent.category}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 dir-ltr bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        {agent.subdomain}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
                      {agent.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-2">
                      {agent.description}
                    </p>

                    {/* 2-3 Bullet Capabilities */}
                    <div className="space-y-1.5 pt-1">
                      {agent.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Price & Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">تعرفه / ماهانه:</span>
                      <span className="text-xs sm:text-sm font-black text-purple-700 dark:text-purple-400">
                        {agent.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTryAgent(agent)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                      >
                        تست زنده
                      </button>

                      <a
                        href={`https://${agent.subdomain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                      >
                        <span>ورود</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Indicator Dots & Quick CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5">
            {agents.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx 
                    ? 'w-6 bg-purple-600 dark:bg-purple-500' 
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                aria-label={`اسلاید ${idx + 1}`}
              />
            ))}
          </div>

          <a
            href="#custom-app"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            <span>نیاز به ساخت ایجنت هوش مصنوعی سفارشی برای کسب‌وکار خود دارید؟</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};
