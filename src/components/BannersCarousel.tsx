import React, { useState, useEffect } from 'react';
import { PromoBanner } from '../types';
import { ChevronRight, ChevronLeft, Sparkles, ArrowLeft } from 'lucide-react';

interface BannersCarouselProps {
  banners: PromoBanner[];
  onBannerClick?: (banner: PromoBanner) => void;
}

export const BannersCarousel: React.FC<BannersCarouselProps> = ({ banners, onBannerClick }) => {
  const activeBanners = banners.filter(b => b.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (!activeBanners.length) return null;

  const currentBanner = activeBanners[currentIndex];

  return (
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl group">
        
        {/* Banner Canvas */}
        <div className={`relative min-h-[220px] sm:min-h-[280px] bg-gradient-to-r ${currentBanner.bgGradient} p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6`}>
          
          {/* Background Decorative Pattern */}
          <div className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url(${currentBanner.imageUrl})` }} />

          {/* Text Content */}
          <div className="relative z-10 max-w-2xl text-right text-white space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentBanner.badge}</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {currentBanner.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed opacity-90">
              {currentBanner.subtitle}
            </p>

            <div className="pt-2">
              <a
                href={currentBanner.linkUrl}
                onClick={(e) => {
                  if (currentBanner.linkUrl.startsWith('#')) {
                    e.preventDefault();
                    const el = document.getElementById(currentBanner.linkUrl.replace('#', ''));
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else if (onBannerClick) {
                    onBannerClick(currentBanner);
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 font-extrabold text-xs sm:text-sm shadow-lg hover:bg-slate-100 hover:scale-105 transition-all"
              >
                <span>{currentBanner.buttonText || 'مشاهده جزئیات'}</span>
                <ArrowLeft className="w-4 h-4 text-purple-600" />
              </a>
            </div>
          </div>

          {/* Banner Image Preview Card */}
          <div className="relative z-10 shrink-0 w-full md:w-80 h-40 sm:h-48 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl">
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

        </div>

        {/* Carousel Indicators & Controls */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-4 right-6 left-6 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBanners.length)}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
