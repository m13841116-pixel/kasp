import { AIAgent, BannerConfig, Freelancer, AppRequest, PromoBanner, UserTicket, ServiceItem } from '../types';

export const initialAgents: AIAgent[] = [
  {
    id: 'agent-1',
    title: 'ایجنت تولید کپشن اینستاگرام',
    description: 'تولید هوشمند کپشن‌های جذاب، هشتگ‌های پربازدید و تقویم محتوایی اینستاگرام متناسب با کسب‌وکار شما.',
    subdomain: 'caption.kasp.ir',
    price: '۵۰,۰۰۰ تومان / ماهانه',
    priceNum: 50000,
    subscribers: 1420,
    monthlyRevenue: '۷۱,۰۰۰,۰۰۰ تومان',
    category: 'بازاریابی و شبکه‌های اجتماعی',
    icon: 'FileText',
    status: 'Active',
    features: ['درک لحن برند ایرانی', 'پیشنهاد هشتگ‌های پربازدید', 'سازگار با الگوریتم اینستاگرام', 'خروجی اکسل و متن']
  },
  {
    id: 'agent-2',
    title: 'دستیار ادیت و سناریو ویدیو',
    description: 'نگارش سناریوهای ویرال ویدیو، ریلز و ریموت‌اسکریپت تبلیغاتی به همراه قلاب‌های جذابی برای شروع ویدیو.',
    subdomain: 'script.kasp.ir',
    price: '۷۵,۰۰۰ تومان / ماهانه',
    priceNum: 75000,
    subscribers: 980,
    monthlyRevenue: '۷۳,۵۰۰,۰۰۰ تومان',
    category: 'تولید محتوا و ویدیو',
    icon: 'Languages',
    status: 'Active',
    features: ['سناریونویسی ریلز و تیک‌تاک', 'طراحی قلاب ۵ ثانیه‌ای اول', 'ساختار ویدیوهای آموزشی و فروش', 'پشتیبانی کامل از زبان فارسی']
  },
  {
    id: 'agent-3',
    title: 'ابزار تحلیل فروشگاه آنلاین',
    description: 'تحلیل رفتار مشتریان، بررسی نرخ تبدیل، بررسی سبدهای رهاشده و ارائه‌ راهکارهای فروش بیشتر.',
    subdomain: 'analytics.kasp.ir',
    price: '۱۲۰,۰۰۰ تومان / ماهانه',
    priceNum: 120000,
    subscribers: 610,
    monthlyRevenue: '۷۳,۲۰۰,۰۰۰ تومان',
    category: 'ابزار تجارت الکترونیک',
    icon: 'TrendingUp',
    status: 'Active',
    features: ['تحلیل سبدهای خریداران', 'گزارش‌گیری اتوماتیک روزانه', 'اتصال به درگاه‌های بانکی', 'ارائه پیش‌بینی فروش']
  },
  {
    id: 'agent-4',
    title: 'ایجنت پشتیبان هوشمند مشتریان',
    description: 'پاسخگویی ۲۴ ساعته اتوماتیک در اینستاگرام، تلگرام و وب‌سایت با قابلیت صدور فاکتور رسمی.',
    subdomain: 'support.kasp.ir',
    price: '۹۰,۰۰۰ تومان / ماهانه',
    priceNum: 90000,
    subscribers: 850,
    monthlyRevenue: '۷۶,۵۰۰,۰۰۰ تومان',
    category: 'پشتیبانی و فروش',
    icon: 'Bot',
    status: 'Active',
    features: ['پاسخ به دایرکت اینستاگرام', 'ربات تلگرام هوشمند', 'اتصال به درگاه زرین‌پال', 'همگام‌سازی با انبار']
  },
  {
    id: 'agent-5',
    title: 'ابزار سئو و تولید محتوای تخصصی',
    description: 'تولید مقالات تخصصی سئو شده، یافتن کلمات کلیدی پرجستجو و آنالیز رقبا به زبان فارسی.',
    subdomain: 'seo.kasp.ir',
    price: '۶۰,۰۰۰ تومان / ماهانه',
    priceNum: 60000,
    subscribers: 1100,
    monthlyRevenue: '۶۶,۰۰۰,۰۰۰ تومان',
    category: 'سئو و وب',
    icon: 'Code2',
    status: 'Active',
    features: ['بررسی سئوی آنبرج', 'تولید اتوماتیک متاتگ‌ها', 'یافتن شکاف کلمات کلیدی', 'ارسال مستقیم به وردپرس']
  }
];

export const initialServices: ServiceItem[] = [
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

export const initialBannerConfig: BannerConfig = {
  headline: 'راهکارهای هوش مصنوعی، ایجنت‌های هوشمند و توسعه اختصاصی نرم‌افزار',
  subheadline: 'طراحی و اجرای ۱۰۰٪ سفارشی نرم‌افزار، وب‌اپlikیشن، اپ موبایل و ایجنت‌های هوشمند با ۹۰٪ تخفیف ویژه استارتاپی و تحویل فوق‌العاده سریع',
  discountBadge: '🎉 تخفیف استثنایی: ساخت اپلیکیشن و ایجنت اختصاصی با ۹۰٪ کاهش هزینه',
  primaryCta: 'مشاوره رایگان و استعلام قیمت',
  secondaryCta: 'شروع پروژه اختصاصی',
  bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  telegramContact: 'kasp0000',
  phoneContact: '۰۹۱۲۳۴۵۶۷۸۹',
  emailContact: 'info@kasp.ir'
};

export const initialPromoBanners: PromoBanner[] = [
  {
    id: 'pb-1',
    title: 'توسعه اختصاصی نرم‌افزار، وب‌سایت و اپلیکیشن',
    subtitle: 'ساخت کامل پروژه شما بر اساس دقیق‌ترین ایده‌ها با پشتیبانی فنی دائمی و تعرفه فوق‌العاده اقتصادی.',
    badge: '⚡ ۹۰٪ تخفیف ویژه استارتاپ‌ها',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    linkUrl: '#custom-app',
    buttonText: 'ثبت رایگان ایده و استعلام قیمت',
    bgGradient: 'from-purple-900/90 via-indigo-900/90 to-blue-900/90',
    isActive: true,
    displayOrder: 1
  },
  {
    id: 'pb-2',
    title: 'ایجنت‌های هوش مصنوعی برای حل چالش‌های واقعی کسب‌وکار',
    subtitle: 'ابزارهای اتوماسیون فروش، تولید محتوا، پشتیبانی تلگرام و اینستاگرام و تحلیل داده‌های کسب‌وکار.',
    badge: '🤖 ایجنت‌های هوشمند فعال',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    linkUrl: '#agents',
    buttonText: 'بررسی و تست آنلاین ایجنت‌ها',
    bgGradient: 'from-blue-900/90 via-sky-900/90 to-teal-900/90',
    isActive: true,
    displayOrder: 2
  },
  {
    id: 'pb-3',
    title: 'مشاوره مستقیم و آنلاین در تلگرام (kasp0000@)',
    subtitle: 'امکان مطرح کردن سوالات، دریافت برآورد قیمت اتوماتیک و ارتباط با برنامه‌نویسان ارشد کاسپ.',
    badge: '💬 پشتیبانی فوری تلگرام',
    imageUrl: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=800&q=80',
    linkUrl: 'https://t.me/kasp0000',
    buttonText: 'ارتباط مستقیم با پشتیبانی تلگرام',
    bgGradient: 'from-sky-900/90 via-blue-900/90 to-indigo-900/90',
    isActive: true,
    displayOrder: 3
  }
];

export const initialFreelancers: Freelancer[] = [
  {
    id: 'free-1',
    fullName: 'علی حسینی',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    primarySkill: 'Full-Stack',
    rate: '۱۸۰,۰۰۰ تومان / ساعت',
    rateNum: 180000,
    notes: 'برنامه‌نویس ارشد React و Node.js. ۶ سال سابقه توسعه میکروسرویس‌ها و اتصال به درگاه‌های پرداخت بانکی ایران.',
    experience: 'Senior',
    rating: 4.9,
    completedProjects: 28,
    status: 'Available',
    email: 'ali.hosseini@example.com'
  },
  {
    id: 'free-2',
    fullName: 'سارا محمدی',
    phone: '۰۹۳۵۹۸۷۶۵۴۳',
    primarySkill: 'AI & ML',
    rate: '۲۲۰,۰۰۰ تومان / ساعت',
    rateNum: 220000,
    notes: 'متخصص پردازش زبان طبیعی فارسی (NLP)، کار با مدل‌های Gemini، پایتون و پیاده‌سازی ربات‌های هوشمند.',
    experience: 'Lead',
    rating: 5.0,
    completedProjects: 19,
    status: 'Available',
    email: 'sara.m@example.com'
  }
];

export const initialAppRequests: AppRequest[] = [
  {
    id: 'req-1',
    userName: 'کاوه احمدی',
    contactInfo: 'kaveh@startup.ir | ۰۹۱۲۷۷۷۶۶۵۵',
    projectType: 'توسعه سیستم هوش مصنوعی',
    idea: 'اپلیکیشن تحلیل‌گر قوانین و قراردادها با هوش مصنوعی جهت تشخیص ریسک‌های حقوقی و خلاصه‌سازی بندها.',
    budget: 8000000,
    timestamp: '۱۴۰۳/۰۵/۱۳ ۱۴:۲۰',
    status: 'Analyzed',
    aiAnalysis: {
      feasibilityScore: 96,
      recommendedStack: ['React', 'Python FastAPI', 'Gemini API', 'Tailwind CSS'],
      estimatedTimeline: '۲ تا ۴ هفته متناسب با حجم پروژه',
      summary: 'امکان‌پذیری بسیار بالا. پردازش متن قراردادها با استفاده از مدل هوش مصنوعی Gemini امکان‌پذیر است.'
    }
  }
];

export const initialTickets: UserTicket[] = [
  {
    id: 't-101',
    userName: 'کاوه احمدی',
    userContact: '۰۹۱۲۷۷۷۶۶۵۵',
    subject: 'استعلام زمان تحویل فاز اول اپلیکیشن حقوقی',
    category: 'Custom App',
    message: 'سلام وقت بخیر، ایده من تحلیل قراردادهاست. آیا فاز اول تا ۲ هفته آینده آماده تست خواهد بود؟',
    status: 'Open',
    createdAt: '۱۴۰۳/۰۵/۱۴ ۱۰:۳۰'
  }
];
