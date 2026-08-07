import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'آیا پس از تحویل، سورس‌کد کامل پروژه متعلق به من است؟',
      answer: (
        <div className="space-y-2">
          <p>بله. پس از تکمیل و تسویه پروژه، سورس کامل پروژه، فایل‌های مربوطه و اطلاعات مورد نیاز در اختیار شما قرار می‌گیرد و مالکیت کامل محصول متعلق به شما خواهد بود.</p>
          <p>هدف ما این است که محصولی تحویل دهید که فقط یک خروجی موقت نباشد، بلکه بتوانید در آینده آن را توسعه دهید و امکانات جدید به آن اضافه کنید.</p>
        </div>
      )
    },
    {
      question: 'چرا باید KASP را انتخاب کنیم؟',
      answer: (
        <div className="space-y-2">
          <p>در KASP فقط یک وب‌سایت یا اپلیکیشن ساخته نمی‌شود؛ ما تلاش می‌کنیم یک راهکار دیجیتال متناسب با نیاز واقعی کسب‌وکار شما ایجاد کنیم.</p>
          <p>تفاوت اصلی ما در استفاده از معماری استاندارد، طراحی قابل توسعه، توجه به تجربه کاربری و استفاده هوشمندانه از فناوری‌های جدید برای کاهش زمان توسعه و افزایش کیفیت خروجی است.</p>
        </div>
      )
    },
    {
      question: 'چگونه هزینه و زمان توسعه در کاسپ تا این حد بهینه است؟',
      answer: (
        <div className="space-y-2">
          <p>کاهش هزینه و زمان تحویل به معنی کاهش کیفیت نیست.</p>
          <p>با بهره‌گیری از سیستم‌های توسعه ماژولار، معماری کد ساختاریافته و ابزارهای پیشرفته اتوماسیون مهندسی، زمان پیاده‌سازی بخش‌های تکراری به حداقل می‌رسد. این موضوع باعث می‌شود هزینه نهایی بسیار مناسب‌تر از روش‌های سنتی باشد، در حالی که بالاترین استانداردهای کیفی و امنیتی حفظ می‌شوند.</p>
        </div>
      )
    },
    {
      question: 'زمان تحویل سفارش‌های معمول چقدر است؟',
      answer: (
        <div className="space-y-2">
          <p>زمان اجرا به نوع و پیچیدگی پروژه بستگی دارد. پروژه‌های ساده مانند سایت‌های معرفی، لندینگ پیج و ابزارهای کوچک معمولاً در زمان کوتاه‌تری انجام می‌شوند.</p>
          <p>قبل از شروع هر پروژه، زمان‌بندی دقیق بر اساس امکانات مورد نیاز مشخص خواهد شد.</p>
        </div>
      )
    },
    {
      question: 'آیا امکان دیپلوی و راه‌اندازی روی سرور هم وجود دارد؟',
      answer: (
        <div className="space-y-2">
          <p>بله. در صورت نیاز، فرآیند راه‌اندازی پروژه روی هاست یا سرور انجام می‌شود.</p>
          <p>همچنین تنظیمات اولیه، بررسی عملکرد و آماده‌سازی پروژه برای استفاده واقعی نیز قابل انجام است.</p>
        </div>
      )
    },
    {
      question: 'آیا امکان دریافت خدمات پشتیبانی و توسعه‌های بعدی وجود دارد؟',
      answer: (
        <div className="space-y-2">
          <p>بله. پس از تحویل پروژه، در صورت نیاز می‌توان برای پشتیبانی، رفع مشکلات، بهبود عملکرد و اضافه کردن امکانات جدید همکاری را ادامه داد.</p>
        </div>
      )
    },
    {
      question: 'چگونه می‌توانم قبل از ثبت سفارش مشاوره دریافت کنم؟',
      answer: (
        <div className="space-y-2">
          <p>می‌توانید ابتدا توضیحات ایده یا نیاز خود را ارسال کنید. پس از بررسی، بهترین مسیر فنی، زمان تقریبی و پیشنهاد مناسب برای اجرای پروژه ارائه خواهد شد.</p>
        </div>
      )
    },
    {
      question: 'آیا پروژه‌ها اختصاصی طراحی می‌شوند یا از قالب آماده استفاده می‌کنید؟',
      answer: (
        <div className="space-y-2">
          <p>بسته به نیاز پروژه، بهترین راهکار انتخاب می‌شود. برای پروژه‌هایی که نیاز به طراحی اختصاصی دارند، ساختار و رابط کاربری کاملاً متناسب با نیاز کسب‌وکار ایجاد می‌شود.</p>
          <p>هدف ما انتخاب بهترین راهکار برای رسیدن به نتیجه مطلوب است، نه صرفاً استفاده از یک روش ثابت.</p>
        </div>
      )
    },
    {
      question: 'آیا پروژه‌های شما قابلیت توسعه در آینده را دارند؟',
      answer: (
        <div className="space-y-2">
          <p>بله. در طراحی پروژه‌ها تلاش می‌شود ساختار به شکلی باشد که اضافه کردن امکانات جدید در آینده بدون نیاز به بازنویسی کامل امکان‌پذیر باشد.</p>
        </div>
      )
    },
    {
      question: 'رویکرد مهندسی و تضمین کیفیت کدهای شما چگونه است؟',
      answer: (
        <div className="space-y-2">
          <p>تمام کدهای تولید شده بر اساس استانداردهای مدرن وب (TypeScript, React, Tailwind CSS) و معماری clean-code پیاده‌سازی می‌شوند.</p>
          <p>تصمیم‌های فنی، معماری دیتابیس و تست‌های امنیتی توسط مهندسان ارشد نرم‌افزار ارزیابی شده و سورس‌کد نهایی تمیز، خوانا و آماده توسعه در آینده تحویل داده می‌شود.</p>
        </div>
      )
    },
    {
      question: 'آیا فقط سایت طراحی می‌کنید یا اپلیکیشن و سیستم‌های اختصاصی هم توسعه می‌دهید؟',
      answer: (
        <div className="space-y-2">
          <p>خدمات KASP محدود به طراحی سایت نیست. ما در کنار وب‌سایت‌های حرفه‌ای، وب‌اپلیکیشن‌ها، پنل‌های مدیریتی، ابزارهای اختصاصی و MVP محصولات دیجیتال را نیز توسعه می‌دهیم.</p>
        </div>
      )
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 text-xs font-bold mb-4 border border-blue-200 dark:border-blue-500/20">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>سوالات متداول کارفرمایان</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            پاسخ به ابهامات و سوالات شما
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-4 leading-relaxed font-medium">
            پاسخ شفاف به مهم‌ترین سوالات درباره سورس‌کد، تعرفه‌ها، مالکیت و نحوه‌ی تحویل پروژه‌ها.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-right p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm sm:text-base focus:outline-none"
                >
                  <span className="leading-snug">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 pt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800 font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Telegram Direct Support Box */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-purple-500/10 border border-sky-500/20 text-center space-y-3">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            سوال دیگری دارید که پاسخ آن را پیدا نکردید؟
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            همین الان در تلگرام با کارشناسان فنی کاسپ به صورت مستقیم صحبت کنید.
          </p>
          <a
            href="https://t.me/kasp0000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs shadow-lg transition-transform hover:scale-105"
          >
            <MessageSquare className="w-4 h-4" />
            <span>گفتگو در تلگرام (kasp0000@)</span>
          </a>
        </div>
      </div>
    </section>
  );
};
