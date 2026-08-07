import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  Upload, 
  Eye, 
  Percent 
} from 'lucide-react';
import { BannerConfig } from '../../types';

interface ManageBannersModuleProps {
  bannerConfig: BannerConfig;
  onUpdateBannerConfig: (newConfig: BannerConfig) => void;
  lang: 'fa' | 'en';
}

export const ManageBannersModule: React.FC<ManageBannersModuleProps> = ({
  bannerConfig,
  onUpdateBannerConfig,
  lang,
}) => {
  const [headline, setHeadline] = useState(bannerConfig.headline);
  const [subheadline, setSubheadline] = useState(bannerConfig.subheadline);
  const [discountBadge, setDiscountBadge] = useState(bannerConfig.discountBadge);
  const [primaryCta, setPrimaryCta] = useState(bannerConfig.primaryCta);
  const [secondaryCta, setSecondaryCta] = useState(bannerConfig.secondaryCta);
  const [bannerImage, setBannerImage] = useState(bannerConfig.bannerImage);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBannerConfig({
      headline,
      subheadline,
      discountBadge,
      primaryCta,
      secondaryCta,
      bannerImage,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ImageIcon className="w-8 h-8 text-purple-500" />
          <span>{lang === 'fa' ? 'مدیریت بنرها و متون صفحه اصلی' : 'Manage Banners & Hero Section'}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {lang === 'fa'
            ? 'ویرایش عنوان اصلی، توضیحات، درصد تخفیف و بنرهای تبلیغاتی لندینگ‌پیج Kasp.ir'
            : 'Customize hero headlines, promotional subheadlines, discount tags, and banner artwork.'}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{lang === 'fa' ? 'تغییرات بنر با موفقیت روی لندینگ‌پیج اعمال شد!' : 'Banner and Hero settings updated successfully!'}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Form */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-5">
          
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            
            {/* Discount Badge */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-purple-400" />
                <span>{lang === 'fa' ? 'نشان تخفیف و ارزش (Discount Badge)' : 'Discount Badge'}</span>
              </label>
              <input
                type="text"
                value={discountBadge}
                onChange={(e) => setDiscountBadge(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Headline */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'fa' ? 'عنوان اصلی بنر (Main Hero Headline)' : 'Hero Headline'}
              </label>
              <textarea
                rows={2}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Subheadline */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'fa' ? 'زیرعنوان و توضیحات (Subheadline)' : 'Subheadline'}
              </label>
              <textarea
                rows={3}
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'fa' ? 'متن دکمه اصلی (Primary CTA)' : 'Primary CTA Text'}
                </label>
                <input
                  type="text"
                  value={primaryCta}
                  onChange={(e) => setPrimaryCta(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'fa' ? 'متن دکمه فرعی (Secondary CTA)' : 'Secondary CTA Text'}
                </label>
                <input
                  type="text"
                  value={secondaryCta}
                  onChange={(e) => setSecondaryCta(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Banner Image URL */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>{lang === 'fa' ? 'آدرس تصویر بنر (Banner Image URL)' : 'Banner Image URL'}</span>
              </label>
              <input
                type="text"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-blue-400 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-purple-500/25 flex items-center gap-2 hover:scale-105 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'fa' ? 'ذخیره و انتشار روی سایت' : 'Save & Publish Banner'}</span>
            </button>

          </form>

        </div>

        {/* Right Preview Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-purple-400" />
            <span>{lang === 'fa' ? 'پیش‌نمایش زنده بنر' : 'Live Banner Preview'}</span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-700 space-y-4 relative overflow-hidden shadow-2xl">
            <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
              {discountBadge}
            </div>

            <h3 className="text-xl font-black text-white leading-tight">
              {headline}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {subheadline}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold">
                {primaryCta}
              </span>
              <span className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                {secondaryCta}
              </span>
            </div>

            {bannerImage && (
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-700 max-h-40">
                <img src={bannerImage} alt="Banner Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
