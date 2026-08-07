import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Rocket, 
  ArrowLeft, 
  CheckCircle2, 
  Cpu,
  MonitorSmartphone,
  Server,
  Layout,
  MousePointerClick,
  ShoppingCart,
  Phone,
  Briefcase,
  Layers,
  Search,
  Zap,
  Globe,
  PlusCircle,
  FileText,
  Upload,
  MessageSquare,
  ShieldCheck,
  Check
} from 'lucide-react';

interface CustomAppSectionProps {
  onSubmitRequest: (req: any) => void;
  lang: 'fa' | 'en';
}

const PROJECT_TYPES = [
  { id: 'corporate', label: 'سایت شرکتی', icon: Briefcase },
  { id: 'ecommerce', label: 'فروشگاه آنلاین', icon: ShoppingCart },
  { id: 'app', label: 'اپلیکیشن موبایل / PWA', icon: MonitorSmartphone },
  { id: 'admin', label: 'پنل مدیریت & CRM', icon: Layout },
  { id: 'system', label: 'سامانه اختصاصی & اتوماسیون', icon: Server },
  { id: 'landing', label: 'لندینگ پیج پرسرعت', icon: MousePointerClick },
  { id: 'other', label: 'پروژه خاص و سفارشی', icon: Layers },
];

const FEATURES = [
  { id: 'register', label: 'ثبت‌نام و لاگین (OTP / پیامک)' },
  { id: 'dashboard', label: 'پنل کاربری اختصاصی' },
  { id: 'payment', label: 'درگاه پرداخت آنلاین (شتاب / ریالی)' },
  { id: 'sms', label: 'سیستم اطلاع‌رسانی پیامکی' },
  { id: 'chat', label: 'چت آنلاین و پشتیبانی' },
  { id: 'booking', label: 'نوبت‌دهی و رزرو آنلاین' },
  { id: 'files', label: 'مدیریت فایل و آپلود سنگین' },
  { id: 'roles', label: 'سطوح دسترسی و مدیریت نقش‌ها' },
  { id: 'admin', label: 'پنل مدیریت پیشرفته' },
  { id: 'reports', label: 'گزارش‌گیری و آمار پیشرفته' },
  { id: 'api', label: 'API اختصاصی و وب‌هوکس' },
];

const BUDGETS = [
  { id: 'b1', label: 'کمتر از ۲ میلیون تومان (پایه)' },
  { id: 'b2', label: '۲ تا ۵ میلیون تومان (استاندارد)' },
  { id: 'b3', label: '۵ تا ۱۰ میلیون تومان (حرفه‌ای)' },
  { id: 'b4', label: '۱۰ تا ۲۰ میلیون تومان (پیشرفته)' },
  { id: 'b5', label: 'بیشتر از ۲۰ میلیون تومان (سازمانی)' },
];

const TIMELINES = [
  { id: 'urgent', label: 'فوری (تحویل در سریع‌ترین زمان)' },
  { id: '1week', label: 'حدود ۳ تا ۵ روز' },
  { id: '2week', label: '۱ تا ۲ هفته' },
  { id: 'flexible', label: 'کیفیت و دقت اولویت اصلی است' },
];

export const CustomAppSection: React.FC<CustomAppSectionProps> = ({
  onSubmitRequest,
}) => {
  const [step, setStep] = useState(1);
  const [discountCode, setDiscountCode] = useState('');
  const [formData, setFormData] = useState({
    type: '',
    businessName: '',
    goal: '',
    features: [] as string[],
    otherFeatures: '',
    budget: '',
    timeline: '',
    reference: '',
    fileAttached: false,
    fileName: '',
    description: '',
  });

  useEffect(() => {
    const activeDiscount = localStorage.getItem('kasp_active_discount');
    if (activeDiscount) {
      setDiscountCode(activeDiscount);
    }
  }, []);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const analysisSteps = [
    'در حال تحلیل نیازمندی‌ها و ساختار فنی پروژه...',
    'بررسی الزامات امنیتی، دیتابیس و پشته تکنولوژی...',
    'تدوین پروپوزال تخصصی و معماری سیستم...',
    'بررسی اولیه توسط معمار ارشد نرم‌افزار...',
    'محاسبه بهینه‌ترین زمان‌بندی و پلن توسعه...',
    'آماده‌سازی سند اولیه سفارش...'
  ];

  const handleFeatureToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(id) 
        ? prev.features.filter(f => f !== id)
        : [...prev.features, id]
    }));
  };

  const nextStep = () => {
    if (step < 8) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitForm = async () => {
    if (discountCode.trim()) {
      try {
        await fetch('/api/wheel/use-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: discountCode.trim() }),
        });
        localStorage.removeItem('kasp_active_discount');
      } catch (err) {
        console.error('Error marking code as used:', err);
      }
    }
    setAnalyzing(true);
  };

  useEffect(() => {
    if (analyzing) {
      if (analysisStep < analysisSteps.length - 1) {
        const timer = setTimeout(() => setAnalysisStep(s => s + 1), 1200);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setAnalyzing(false);
          setStep(9); // Summary & Final Confirmation Step
          onSubmitRequest({
            title: `پروژه ${formData.type} - ${formData.businessName}`,
            description: formData.description,
            contactInfo: formData.businessName,
          });
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [analyzing, analysisStep]);

  return (
    <section id="custom-app" className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-200 dark:border-indigo-800/50">
            <Code2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            شروع آنلاین پروژه و دریافت برآورد هزینه
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base font-normal">
            پاسخ به ۸ سوال کوتاه درباره ایده‌تان به تیم مهندسی KASP کمک می‌کند تا بهترین راهکار فنی، معماری دیتابیس و زمان‌بندی دقیق را پیشنهاد دهد.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 shadow-2xl overflow-hidden min-h-[520px] flex flex-col relative">
          
          {analyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
                <div className="absolute inset-2 bg-blue-500/20 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700">
                  <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">تیم مهندسی در حال بررسی نیازمندی‌های پروژه...</h3>
              
              <div className="w-full max-w-md space-y-3">
                {analysisSteps.map((text, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 text-sm transition-all duration-500
                      ${idx < analysisStep ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 
                        idx === analysisStep ? 'text-slate-900 dark:text-white font-bold animate-pulse' : 
                        'text-slate-400 dark:text-slate-600 opacity-50'}`}
                  >
                    {idx < analysisStep ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : idx === analysisStep ? (
                      <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0"></div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-current shrink-0"></div>
                    )}
                    <span className="text-right">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : step === 9 ? (
            <div className="flex-1 p-8 sm:p-12 flex flex-col justify-between animate-fadeIn">
              <div>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      پیشنهاد اولیه و تحلیل نیازمندی‌ها آماده شد!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
                      خلاصه مشخصات زیر ثبت شد و کارشناس ارشد پروژه جهت مشاوره تکمیلی به زودی با شما ارتباط خواهد گرفت.
                    </p>
                  </div>
                </div>

                {/* Project Summary Cards */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 mb-8">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    📋 شناسنامه درخواست پروژه
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 block mb-1">نوع پروژه:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {PROJECT_TYPES.find(p => p.id === formData.type)?.label || 'سفارشی'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">نام برند / ایده:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{formData.businessName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">بودجه پیشنهادی:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {BUDGETS.find(b => b.id === formData.budget)?.label || 'تعیین نشده'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">زمان تحویل مدنظر:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {TIMELINES.find(t => t.id === formData.timeline)?.label || 'انعطاف‌پذیر'}
                      </span>
                    </div>
                  </div>

                  {formData.features.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block mb-2 text-xs">امکانات کلیدی انتخابی:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.features.map(fId => {
                          const feat = FEATURES.find(f => f.id === fId);
                          return (
                            <span key={fId} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
                              {feat?.label || fId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {formData.description && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block mb-1 text-xs">توضیحات تکمیلی:</span>
                      <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        {formData.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <a
                  href="https://t.me/kasp0000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>پیگیری فوری در تلگرام (kasp0000@)</span>
                </a>

                <button
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
                >
                  ثبت درخواست جدید
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="h-2 bg-slate-200 dark:bg-slate-700/50 w-full">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${(step / 8) * 100}%` }}
                ></div>
              </div>

              <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800">
                      مرحله {step} از ۸
                    </span>
                    <span className="text-xs text-slate-400 font-medium">مشاوره تخصصی KASP</span>
                  </div>

                  <div className="animate-fadeIn">
                    {/* Step 1: Project Type */}
                    {step === 1 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">نوع پروژه شما چیست؟</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">کدام دسته‌بندی با ایده شما سازگارتر است؟</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {PROJECT_TYPES.map(type => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => {
                                setFormData({...formData, type: type.id});
                                setTimeout(nextStep, 250);
                              }}
                              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col gap-3 cursor-pointer
                                ${formData.type === type.id 
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-md scale-[1.02]' 
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                                }
                              `}
                            >
                              <type.icon className={`w-6 h-6 ${formData.type === type.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                              <span className="font-bold text-sm sm:text-base">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Goal & Business Name */}
                    {step === 2 && (
                      <div className="space-y-6 max-w-xl">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">نام کسب‌وکار یا عنوان پروژه چیست؟</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">نام برند یا عنوانی که برای این پروژه در نظر دارید را وارد کنید.</p>
                        </div>
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                          placeholder="مثال: فروشگاه آنلاین آرایشی / سامانه مدیریت مشتریان"
                          className="w-full px-5 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:outline-none text-base text-slate-900 dark:text-white shadow-sm transition-colors"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && formData.businessName.trim()) {
                              nextStep();
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Step 3: Project Goal */}
                    {step === 3 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">هدف اصلی شما از ساخت این نرم‌افزار چیست؟</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">چه مسئله‌ای قرار است حل شود یا چه ارزشی برای کاربران ایجاد خواهد شد؟</p>
                        </div>
                        <textarea
                          value={formData.goal}
                          onChange={(e) => setFormData({...formData, goal: e.target.value})}
                          placeholder="مثلاً: می‌خواهیم فرآیند فروش و صدور فاکتور مشتریان را اتوماتیک کنیم..."
                          className="w-full px-5 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:outline-none text-sm sm:text-base text-slate-900 dark:text-white shadow-sm transition-colors min-h-[140px] resize-none"
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Step 4: Required Features (PROPER CLICK HANDLER FIXED!) */}
                    {step === 4 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">چه امکاناتی نیاز دارید؟</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">روی گزینه‌های مدنظر کلیک کنید (می‌توانید چند مورد را انتخاب کنید):</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {FEATURES.map(feat => {
                            const isSelected = formData.features.includes(feat.id);
                            return (
                              <button
                                key={feat.id}
                                type="button"
                                onClick={() => handleFeatureToggle(feat.id)}
                                className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border-2 text-right transition-all
                                  ${isSelected
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'
                                  }
                                `}
                              >
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors
                                  ${isSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'border-2 border-slate-300 dark:border-slate-600'
                                  }
                                `}>
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                                <span className="text-xs sm:text-sm leading-tight">
                                  {feat.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">سایر امکانات خاص مدنظر شما:</label>
                          <input
                            type="text"
                            value={formData.otherFeatures}
                            onChange={(e) => setFormData({...formData, otherFeatures: e.target.value})}
                            placeholder="مثال: اتصال به نرم‌افزار هلو، سیستم انبارداری..."
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none text-xs sm:text-sm text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 5: Budget */}
                    {step === 5 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">بودجه تقریبی شما چقدر است؟</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">این موضوع به ما کمک می‌کند بهترین راهکار متناسب با سرمایه‌گذاری شما را پیشنهاد دهیم.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                          {BUDGETS.map(budget => (
                            <button
                              key={budget.id}
                              type="button"
                              onClick={() => {
                                setFormData({...formData, budget: budget.id});
                                setTimeout(nextStep, 250);
                              }}
                              className={`p-4 rounded-xl border-2 text-right transition-all cursor-pointer
                                ${formData.budget === budget.id 
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm' 
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                                }
                              `}
                            >
                              <span className="font-bold text-sm block">{budget.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 6: Timeline */}
                    {step === 6 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">زمان مدنظر شما برای تحویل پروژه؟</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">تیم ما امکان تحویل سریع پروژه‌ها را فراهم کرده است.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                          {TIMELINES.map(time => (
                            <button
                              key={time.id}
                              type="button"
                              onClick={() => {
                                setFormData({...formData, timeline: time.id});
                                setTimeout(nextStep, 250);
                              }}
                              className={`p-4 rounded-xl border-2 text-right transition-all cursor-pointer
                                ${formData.timeline === time.id 
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm' 
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                                }
                              `}
                            >
                              <span className="font-bold text-sm block">{time.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 7: Reference & Upload File */}
                    {step === 7 && (
                      <div className="space-y-6 max-w-xl">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">نمونه سایت یا فایل‌های ضمیمه</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">اگر وب‌سایت مرجع یا طرح اولیه دارید وارد یا آپلود کنید (اختیاری).</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">لینک سایت مرجع:</label>
                            <div className="relative">
                              <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input
                                type="url"
                                value={formData.reference}
                                onChange={(e) => setFormData({...formData, reference: e.target.value})}
                                placeholder="https://example.com"
                                className="w-full pr-11 pl-4 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none text-xs sm:text-sm text-slate-900 dark:text-white text-left dir-ltr"
                              />
                            </div>
                          </div>

                          <div 
                            onClick={() => setFormData(prev => ({...prev, fileAttached: true, fileName: 'Sought_Document_RP.pdf'}))}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer
                              ${formData.fileAttached 
                                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' 
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-500'
                              }
                            `}
                          >
                            <Upload className={`w-8 h-8 mx-auto mb-2 ${formData.fileAttached ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {formData.fileAttached ? `فایل ضمیمه شد: ${formData.fileName}` : 'جهت انتخاب یا آپلود فایل (PDF, ZIP, Figma) کلیک کنید'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 8: Full Description & Discount Code */}
                    {step === 8 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">توضیحات تکمیلی پروژه و کد تخفیف</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">هیچ محدودیتی در نوشتن جزییات وجود ندارد. اگر کد تخفیف از گردونه شانس دریافت کرده‌اید وارد نمایید.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">نام شما *</label>
                            <input
                              type="text"
                              required
                              value={formData.customerName}
                              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                              placeholder="علی رضایی"
                              className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none text-sm text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">شماره تماس *</label>
                            <input
                              type="text"
                              required
                              value={formData.customerPhone}
                              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                              placeholder="09123456789"
                              className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none text-sm text-slate-900 dark:text-white dir-ltr text-left"
                            />
                          </div>
                        </div>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="جزئیات کامل، انتظارات خاص، نیازمندی‌های کاربران، یا هر نکته دیگری که فکر می‌کنید برای تیم ما مفید است..."
                          className="w-full px-5 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:outline-none text-sm text-slate-900 dark:text-white shadow-sm transition-colors min-h-[140px] resize-y"
                          autoFocus
                        />
                        
                        <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                            🎁 کد تخفیف اختصاصی (اختیاری):
                          </label>
                          <input
                            type="text"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                            placeholder="مثال: KASP-OFF20-8A9F"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-mono text-purple-600 dark:text-purple-400 font-bold dir-ltr tracking-wider focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={step === 1}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all
                      ${step === 1 
                        ? 'opacity-0 pointer-events-none' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    <span>مرحله قبل</span>
                  </button>

                  <button
                    type="button"
                    onClick={step === 8 ? submitForm : nextStep}
                    disabled={
                      (step === 1 && !formData.type) ||
                      (step === 2 && !formData.businessName.trim()) ||
                      (step === 8 && (!formData.customerName.trim() || !formData.customerPhone.trim()))
                    }
                    className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span>{step === 8 ? 'ارسال درخواست و استعلام هزینه' : 'مرحله بعد'}</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

