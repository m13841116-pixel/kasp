import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  BrainCircuit, 
  Search, 
  Megaphone, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  Target, 
  DollarSign, 
  Layers, 
  Lightbulb, 
  FileText,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  Award,
  Star,
  Printer,
  Info,
  Calendar,
  Zap,
  CheckCircle,
  Hammer,
  Mic,
  Radio
} from 'lucide-react';
import { FinalBusinessReport } from '../../server/agents/types';
import { PaymentModal } from '../PaymentModal';
import { CustomerProjectConversation } from '../CustomerProjectConversation';
import { KaspBuildMode } from './KaspBuildMode';
import { VoiceAdvisorCard } from './VoiceAdvisorCard';
import { AutonomousWorkforce } from './AutonomousWorkforce';
import { apiFetch } from '../../utils/api';

interface AITeamSectionProps {
  initialReport?: FinalBusinessReport;
  initialGoal?: string;
  onRequestCustomApp?: (details: string) => void;
  onRequireLogin?: () => void;
  lang?: 'fa' | 'en';
}

interface WorkflowStage {
  stage: string;
  title: string;
  description: string;
  progressPercent: number;
  timestamp: number;
}

interface AIPreviewData {
  goal?: string;
  summary?: string;
  initialSummary?: string;
  targetMarket?: string;
  growthPotential?: string;
  estimatedTimeToLaunch?: string;
  keyStrengths?: string[];
  kaspScore?: {
    totalOpportunityScore: number;
    marketOpportunity: number;
    competition: number;
    customerDemand: number;
    executionDifficulty: number;
    marketingPotential: number;
    scoreRationale: string;
  };
  kaspVerdict?: {
    verdict: 'GO' | 'TEST_FIRST' | 'NO_GO';
    badge: string;
    title: string;
    rationale: string;
    keyAssumptionsToValidate: string[];
  };
  topOpportunities?: string[];
  topRisks?: string[];
  sourcesCount?: number;
  previewOnly?: boolean;
}

const SAMPLE_GOALS = [
  'می‌خواهم این ساعت هوشمند را آنلاین بفروشم',
  'می‌خواهم یک برند پوشاک یا اکسسوری اقتصادی آنلاین راه‌اندازی کنم',
  'می‌خواهم برای فروش آنلاین خدمات و مشاوره‌ام لید و مشتری جذب کنم',
  'می‌خواهم فروش آنلاین این محصول را چند برابر کنم'
];

export const AITeamSection: React.FC<AITeamSectionProps> = ({
  initialReport,
  initialGoal = '',
  onRequestCustomApp,
  onRequireLogin
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [goal, setGoal] = useState(initialGoal);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<AIPreviewData | null>(null);
  const [currentStage, setCurrentStage] = useState<WorkflowStage | null>(null);
  const [report, setReport] = useState<FinalBusinessReport | null>(initialReport || null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'marketing' | 'kaspPlan'>('overview');
  const [majorCapability, setMajorCapability] = useState<'workforce' | 'analysis' | 'build' | 'voice'>('workforce');
  
  // Smart Goal Clarification (Step 2: Understanding the goal)
  const [showClarification, setShowClarification] = useState(false);
  const [businessStage, setBusinessStage] = useState<string>('');
  const [salesModel, setSalesModel] = useState<string>('');
  const [budgetRange, setBudgetRange] = useState<string>('');

  const getFullEnrichedGoal = (baseGoal?: string) => {
    let target = (baseGoal || goal).trim();
    const details: string[] = [];
    if (businessStage) details.push(`مرحله: ${businessStage}`);
    if (salesModel) details.push(`مدل فروش: ${salesModel}`);
    if (budgetRange) details.push(`بودجه: ${budgetRange}`);
    if (details.length > 0) {
      target += ` (اطلاعات تکمیلی: ${details.join(' | ')})`;
    }
    return target;
  };

  // Monetization & Credit state
  const [userStatus, setUserStatus] = useState<{
    isAuthenticated: boolean;
    hasCredit: boolean;
    creditsRemaining: number;
    isAdmin: boolean;
    isDev: boolean;
    product?: { code: string; name: string; price: number };
  } | null>(null);

  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    orderId?: string;
    productCode?: string;
    itemTitle: string;
    amount: string;
  } | null>(null);

  const formattedPrice = userStatus?.product?.price 
    ? `${Number(userStatus.product.price).toLocaleString('fa-IR')} تومان` 
    : '۴۹۰,۰۰۰ تومان';

  const getPrimaryButtonLabel = () => {
    if (report) return 'مشاهده گزارش کامل هوش تجاری';
    if (isLoading) return 'KASP در حال تحلیل و پژوهش...';
    if (!userStatus?.isAuthenticated) return 'ورود برای دریافت گزارش کامل';
    if (!userStatus?.hasCredit) return `خرید گزارش کامل — ${formattedPrice}`;
    return 'شروع تحلیل کامل (با اعتبار فعال)';
  };

  const handlePrimaryAction = () => {
    if (report) {
      const el = document.getElementById('kasp-final-report-document');
      el?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!userStatus?.isAuthenticated) {
      if (onRequireLogin) {
        onRequireLogin();
      } else {
        setError('برای دریافت گزارش جامع، لطفاً ابتدا وارد حساب کاربری خود شوید.');
      }
      return;
    }
    if (!userStatus?.hasCredit) {
      handleCreateOrderAndPay();
      return;
    }
    handleRunTeam();
  };

  const fetchStatus = async () => {
    try {
      const res = await apiFetch('/api/ai/user-status');
      if (res.ok) {
        const data = await res.json();
        setUserStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch user status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (initialGoal && initialGoal !== goal) {
      setGoal(initialGoal);
    }
  }, [initialGoal]);

  useEffect(() => {
    if (initialReport) {
      setReport(initialReport);
      setGoal(initialReport.businessGoal);
      setTimeout(() => {
        const el = document.getElementById('kasp-final-report-document');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [initialReport]);

  const handleCreateOrderAndPay = async () => {
    try {
      setError(null);
      const res = await apiFetch('/api/ai/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productCode: 'kasp-business-report' })
      });
      const order = await res.json();
      if (res.status === 401) {
        setError('برای خرید و صدور گزارش هوش تجاری، لطفاً ابتدا وارد حساب کاربری خود شوید.');
        return;
      }
      if (order && order.id) {
        setPaymentModalData({
          isOpen: true,
          orderId: order.id,
          productCode: order.productCode || 'kasp-business-report',
          itemTitle: `گزارش کامل هوش تجاری KASP (سفارش ${order.id.substring(0, 8)})`,
          amount: `${(order.amount || 490000).toLocaleString('fa-IR')} تومان`
        });
      } else {
        setError(order.error || 'خطا در ثبت سفارش گزارش');
      }
    } catch (err: any) {
      setError('خطا در ثبت سفارش. لطفاً اتصال اینترنت خود را بررسی نمایید.');
    }
  };

  const handleGetPreview = async (selectedGoal?: string) => {
    const targetGoal = getFullEnrichedGoal(selectedGoal);
    if (!targetGoal) return;

    setIsPreviewLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      const res = await apiFetch('/api/ai-team/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: targetGoal })
      });
      const data = await res.json();
      if (data.success && data.preview) {
        setPreviewData(data.preview);
      } else {
        setError(data.error || 'خطا در دریافت پیش‌نمایش');
      }
    } catch (err) {
      setError('خطا در دریافت پیش‌نمایش، لطفاً دوباره امتحان کنید.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleRunTeam = async (selectedGoal?: string) => {
    const targetGoal = getFullEnrichedGoal(selectedGoal);
    if (!targetGoal) return;

    setIsLoading(true);
    setError(null);
    setReport(null);
    setCurrentStage({
      stage: 'manager_planning',
      title: 'مدیر ارشد KASP در حال تحلیل هدف و تفکیک ماموریت...',
      description: 'استخراج اهداف کلیدی، تعیین سوالات و انتقال به واحدهای تحقیق بازار و بازاریابی',
      progressPercent: 10,
      timestamp: Date.now()
    });

    try {
      // Try streaming with fetch and reader
      const response = await fetch('/api/ai-team/run-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal: targetGoal })
      });

      if (response.status === 401) {
        setIsLoading(false);
        setError('برای اجرای گزارش کامل هوش مصنوعی، لطفاً ابتدا وارد حساب کاربری خود شوید.');
        return;
      }

      if (response.status === 402) {
        setIsLoading(false);
        const errJson = await response.json().catch(() => ({}));
        setError(errJson.error || 'برای دریافت این گزارش جامع، نیاز به تهیه اعتبار گزارش دارید.');
        handleCreateOrderAndPay();
        return;
      }

      if (!response.ok) {
        // Fallback to synchronous endpoint
        const syncRes = await fetch('/api/ai-team/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal: targetGoal })
        });

        if (syncRes.status === 401) {
          setIsLoading(false);
          setError('برای اجرای گزارش کامل هوش مصنوعی، لطفاً ابتدا وارد حساب کاربری خود شوید.');
          return;
        }

        if (syncRes.status === 402) {
          setIsLoading(false);
          const errJson = await syncRes.json().catch(() => ({}));
          setError(errJson.error || 'برای دریافت این گزارش جامع، نیاز به تهیه اعتبار گزارش دارید.');
          handleCreateOrderAndPay();
          return;
        }

        const syncData = await syncRes.json();
        if (syncData.success && syncData.project) {
          setReport(syncData.project);
          setIsLoading(false);
          fetchStatus();
          return;
        } else {
          throw new Error(syncData.error || 'خطا در ارتباط با دستیار هوشمند');
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) {
        throw new Error('عدم امکان برقراری ارتباط جریانی');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const eventMatch = block.match(/event:\s*(.+)/);
          const dataMatch = block.match(/data:\s*(.+)/);

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1].trim();
            try {
              const data = JSON.parse(dataMatch[1]);
              if (eventType === 'stage') {
                setCurrentStage(data);
              } else if (eventType === 'result') {
                if (data.project) {
                  setReport(data.project);
                  fetchStatus();
                }
              } else if (eventType === 'error') {
                setError(data.error || 'خطا در اجرای فرآیند');
              }
            } catch (e) {
              console.warn('SSE parse error:', e);
            }
          }
        }
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Execution error:', err);
      // Try fallback to synchronous run
      try {
        const syncRes = await fetch('/api/ai-team/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal: targetGoal })
        });
        if (syncRes.status === 402) {
          setError('برای دریافت این گزارش جامع، نیاز به تهیه اعتبار گزارش دارید.');
          handleCreateOrderAndPay();
          return;
        }
        const syncData = await syncRes.json();
        if (syncData.success && syncData.project) {
          setReport(syncData.project);
          fetchStatus();
        } else {
          setError(syncData.error || 'خطا در تولید گزارش، لطفاً مجدداً تلاش فرمایید.');
        }
      } catch (fallbackErr: any) {
        setError('خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت را بررسی و مجدداً امتحان کنید.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopyReport = () => {
    if (!report) return;
    const pricing = report.pricingStrategy || {
      pricingModel: report.salesStrategy?.pricingModel || 'رقابتی و ارزش‌محور',
      suggestedPriceRange: 'طبق ارزیابی بازار',
      grossMarginEstimate: '۲۵٪ تا ۳۵٪',
      psychologicalTactics: [],
      promotionsAndOffers: []
    };

    const actionPlan = report.actionPlan30Days || [];

    const text = `
============================================================
گزارش هوش تجاری و نقشه راه کسب‌وکار KASP (Business Intelligence Report)
دستیار هوشمند تحقیق، تحلیل و برنامه‌ریزی کسب‌وکار
============================================================
هدف کسب‌وکار: ${report.businessGoal}
تاریخ تدوین: ${new Date(report.createdAt).toLocaleDateString('fa-IR')}
نتیجه نهایی KASP: ${report.kaspVerdict?.badge || '🟡 TEST FIRST'} - ${report.kaspVerdict?.title || ''}
امتیاز فرصت KASP: ${report.kaspScore?.totalOpportunityScore || 78} از ۱۰۰

------------------------------------------------------------
۱. خلاصه اجرایی (Executive Summary):
------------------------------------------------------------
${report.executiveSummary}

------------------------------------------------------------
۲. تحلیل ایده و محصول (Idea & Product Analysis):
------------------------------------------------------------
${report.ideaAndProductAnalysis}

------------------------------------------------------------
۳. مشتریان هدف و پرسونا (Target Customers & Personas):
------------------------------------------------------------
${report.targetCustomers.summary}
${report.targetCustomers.personas.map(p => `• ${p.personaName} (${p.demographics}):\n  - دغدغه‌ها: ${p.painPoints.join('، ')}\n  - انگیزه‌های خرید: ${p.buyingTriggers.join('، ')}`).join('\n')}

------------------------------------------------------------
۴. وضعیت کنونی بازار و تقاضا (Market Analysis):
------------------------------------------------------------
${report.marketStatus}
${report.searchGroundingStatus ? `(وضعیت استناد وب: ${report.searchGroundingStatus})` : ''}

------------------------------------------------------------
۵. تحلیل رقبا و جایگاه ما (Competitor Analysis):
------------------------------------------------------------
${report.competitors.summary}
${report.competitors.list.map(c => `• ${c.name}:\n  - نقاط قوت: ${c.strengths}\n  - نقاط ضعف: ${c.weaknesses}\n  - مزیت رقابتی ما: ${c.ourAdvantage}`).join('\n')}

------------------------------------------------------------
۶. فرصت‌های اصلی بازار (Core Opportunities):
------------------------------------------------------------
${report.coreOpportunities.map(o => `• ${o}`).join('\n')}

------------------------------------------------------------
۷. پیشنهاد ارزش اصلی و متمایز (USP):
------------------------------------------------------------
«${report.valueProposition}»

------------------------------------------------------------
۸. استراتژی و مدل قیمت‌گذاری (Pricing Strategy):
------------------------------------------------------------
• مدل قیمت‌گذاری: ${pricing.pricingModel}
• بازه قیمتی پیشنهادی: ${pricing.suggestedPriceRange}
• حاشیه سود ناخالص تخمینی: ${pricing.grossMarginEstimate}
• تکنیک‌های روانی: ${pricing.psychologicalTactics?.join(' | ') || 'تکنیک عدد ۹، ارزش ادراک‌شده'}
• آفرها و پروموشن‌ها: ${pricing.promotionsAndOffers?.join(' | ') || 'ارسال رایگان در ازای خرید آنلاین'}

------------------------------------------------------------
۹. استراتژی جذب مشتری و قیف فروش (Customer Acquisition & Funnel):
------------------------------------------------------------
کانال‌های اصلی:
${report.marketingStrategyAndChannels.channels.map(c => `• ${c.channel} (اولویت: ${c.priority}) - دلیل: ${c.rationale}`).join('\n')}

مراحل قیف تبدیل:
${report.salesStrategy.funnel.map((step, idx) => `  مرحله ${idx + 1}: ${step}`).join('\n')}

تکنیک‌های نهایی بستن فروش:
${report.salesStrategy.closingTactics.map(t => `  • ${t}`).join('\n')}

------------------------------------------------------------
۱۰. ایده‌های تبلیغاتی و محتوایی (Ad Hooks & Content):
------------------------------------------------------------
ایده‌های تبلیغاتی (Ad Hooks):
${report.advertisingIdeas.map(a => `• [${a.channel} | ${a.format}] قلاب: "${a.hook}" (زاویه روانی: ${a.targetAngle})`).join('\n')}

ایده‌های محتوایی:
${report.contentStrategyAndCaptions.map(c => `• [${c.contentType}] ${c.title} -> CTA: ${c.cta}`).join('\n')}

------------------------------------------------------------
۱۱. برنامه اجرایی ۳۰ روزه (30-Day Action Plan):
------------------------------------------------------------
${actionPlan.map(p => `[${p.timeframe}] [اولویت: ${p.priority}]\n  اقدام: ${p.action}\n  هدف: ${p.objective}\n  شاخص موفقیت (KPI): ${p.kpi}`).join('\n\n')}

------------------------------------------------------------
۱۲. ریسک‌ها و راهکارهای مهار (Risks & Mitigation):
------------------------------------------------------------
ریسک‌های کلیدی:
${report.risksAndChallenges.criticalRisks.map(r => `• ${r}`).join('\n')}
راهکارهای مهار KASP:
${report.risksAndChallenges.mitigationPlan.map(m => `• ${m}`).join('\n')}

------------------------------------------------------------
۱۳. نتیجه نهایی و امتیاز KASP:
------------------------------------------------------------
وضعیت ارزیابی: ${report.kaspVerdict?.badge || '🟡 TEST FIRST'} - ${report.kaspVerdict?.title || ''}
دلیل نتیجه‌گیری: ${report.kaspVerdict?.rationale || ''}
فرضیات کلیدی برای تست:
${(report.kaspVerdict?.keyAssumptionsToValidate || []).map(a => `• ${a}`).join('\n')}

امتیاز KASP Opportunity Score: ${report.kaspScore?.totalOpportunityScore || 78} / 100
استدلال امتیازدهی: ${report.kaspScore?.scoreRationale || ''}

------------------------------------------------------------
۱۴. منابع و استنادهای زنده وب:
------------------------------------------------------------
وضعیت جستجوی زنده: ${report.searchGroundingStatus || 'تحلیل مبتنی بر مدل'}
${(report.sources && report.sources.length > 0) 
  ? report.sources.map(s => `• ${s.title}: ${s.url} (${s.claim})`).join('\n') 
  : 'تمامی داده‌ها و استنتاجات حاصل تحلیل ساختاری و شبیه‌سازی بازار است.'}

------------------------------------------------------------
۱۵. توصیه مستقیم مدیر ارشد KASP («اگر من جای شما بودم...»):
------------------------------------------------------------
${report.managerDirectAdvice || 'اولین اقدام شما باید تست ملموس پیشنهاد ارزش با کمترین هزینه و اعتبارسنجی فرضیه تمایل به خرید باشد. از انباشت هزینه روی زیرساخت پیش از تایید تقاضای واقعی اجتناب کنید.'}

============================================================
KASP - دستیار هوشمند تحقیق، تحلیل و برنامه‌ریزی کسب‌وکار
============================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyExecutiveSummary = () => {
    if (!report) return;
    const text = `
خلاصه اجرایی گزارش هوش تجاری KASP
هدف کسب‌وکار: ${report.businessGoal}
نتیجه نهایی: ${report.kaspVerdict?.badge || '🟢 GO'} - ${report.kaspVerdict?.title || ''}
امتیاز فرصت KASP Score: ${report.kaspScore?.totalOpportunityScore || 78} از ۱۰۰

خلاصه اجرایی:
${report.executiveSummary}

پیشنهاد ارزش اصلی (USP):
«${report.valueProposition}»

بازه قیمتی و حاشیه سود پیشنهادی:
${report.pricingStrategy?.suggestedPriceRange || 'بازه رقابتی'} (حاشیه سود تخمینی: ${report.pricingStrategy?.grossMarginEstimate || '۲۵٪ تا ۳۵٪'})

اقدامات فوری هفته اول:
${(report.actionPlan30Days || []).slice(0, 2).map(p => `• [${p.timeframe}] ${p.action} (شاخص: ${p.kpi})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleJumpToSources = () => {
    setActiveTab('research');
    setTimeout(() => {
      const el = document.getElementById('report-sources-section');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const handleGetFullReportCTA = () => {
    setActiveTab('kaspPlan');
    setTimeout(() => {
      const el = document.getElementById('kasp-execution-box');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <section 
      id="ai-team-workforce" 
      ref={containerRef}
      className="py-20 bg-slate-900 text-white relative overflow-hidden border-y border-slate-800"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Product Positioning */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-bold mb-4 shadow-sm">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>دستیار هوشمند تحقیق، تحلیل و برنامه‌ریزی کسب‌وکار (KASP)</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            تحقیق بازار، تحلیل رقبا و <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">برنامه‌ریزی هوشمند</span> کسب‌وکار
          </h2>
          
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            KASP هدف کسب‌وکار شما را دریافت و تحلیل می‌کند؛ با تکیه بر جستجوی زنده در وب و مدل‌سازی داده‌محور، رقبا و مشتریان هدف را ارزیابی کرده، استراتژی قیمت‌گذاری و نقشه راه ۳۰ روزه را در قالب یک گزارش تحلیل تجاری (Business Intelligence Report) مدون تحویل می‌دهد.
          </p>
        </div>

        {/* 3 Active AI Roles Visual Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
          
          {/* Role 1: Manager */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentStage?.stage.startsWith('manager') 
              ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/20' 
              : 'bg-slate-850/50 border-slate-800'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">۱. مدیر استراتژی (Manager)</h4>
                <p className="text-[11px] text-slate-400">تحلیل هدف، تفکیک ماموریت و تدوین گزارش</p>
              </div>
            </div>
            <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              {currentStage?.stage.startsWith('manager') ? (
                <span className="text-indigo-300 flex items-center gap-1.5 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  در حال بررسی و هدایت تیم...
                </span>
              ) : (
                'استخراج هدف، تدوین وظایف و سنتز خروجی نهایی'
              )}
            </div>
          </div>

          {/* Role 2: Research Unit */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentStage?.stage.startsWith('research') 
              ? 'bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-500/20' 
              : 'bg-slate-850/50 border-slate-800'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">۲. واحد تحقیق بازار (Research)</h4>
                <p className="text-[11px] text-slate-400">جستجوی زنده وب، تحلیل رقبا و پرسونا</p>
              </div>
            </div>
            <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              {currentStage?.stage.startsWith('research') ? (
                <span className="text-purple-300 flex items-center gap-1.5 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  در حال جستجوی زنده و ارزیابی بازار...
                </span>
              ) : (
                'شناسایی فرصت‌ها، رقبا و استنادهای معتبر وب'
              )}
            </div>
          </div>

          {/* Role 3: Marketing Unit */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentStage?.stage.startsWith('marketing') 
              ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/20' 
              : 'bg-slate-850/50 border-slate-800'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">۳. واحد بازاریابی و فروش (Marketing)</h4>
                <p className="text-[11px] text-slate-400">قیمت‌گذاری، قیف فروش و قلاب‌های تبلیغاتی</p>
              </div>
            </div>
            <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              {currentStage?.stage.startsWith('marketing') ? (
                <span className="text-emerald-300 flex items-center gap-1.5 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  در حال طراحی استراتژی فروش و قلاب‌ها...
                </span>
              ) : (
                'تدوین پیشنهاد ارزش، ایده‌های تبلیغاتی و CTA'
              )}
            </div>
          </div>

        </div>

        {/* 5-Question Sales Clarity & Product Value Grid */}
        <div className="max-w-5xl mx-auto mb-10 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-4 text-amber-400 font-black text-sm">
            <Sparkles className="w-4 h-4" />
            <span>راهنمای شفاف محصول هوش تجاری KASP</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                گزارش هوش تجاری KASP چیست؟
              </span>
              <p className="text-slate-400 leading-relaxed">
                تحلیل جامع، داده‌محور و اختصاصی از بازار، رقبا، قیمت‌گذاری و رفتار خریداران برای هدف یا محصول شما با هوش مصنوعی و جستجوی زنده در وب.
              </p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                چه مواردی دریافت می‌کنید؟
              </span>
              <p className="text-slate-400 leading-relaxed">
                سند ۱۵ بخشی: ارزیابی فرصت (KASP Score)، تحلیل رقبا، پرسونای خریدار، قیمت‌گذاری و حاشیه سود، قیف فروش، قلاب‌های تبلیغاتی، نقشه ۳۰ روزه و توصیه استراتژیک مستقیم.
              </p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                این گزارش برای چه کسانی است؟
              </span>
              <p className="text-slate-400 leading-relaxed">
                صاحبان فروشگاه آنلاین، کارآفرینان، استارتاپ‌ها، فریلنسرها، تولیدکنندگان و مشاورانی که می‌خواهند با دید باز و نقشه دقیق بفروشند.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                💳
              </span>
              <div>
                <span className="text-slate-400 block text-[11px]">قیمت مصوب کاتالوگ سرور:</span>
                <span className="text-white font-black font-mono text-sm">{formattedPrice}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
              <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                ⚡
              </span>
              <div>
                <span className="text-slate-400 block text-[11px]">فرآیند بعد از خرید:</span>
                <span className="text-white font-bold text-xs">فعال‌سازی آنی ۱ اعتبار + اجرای تیم هوش مصنوعی و ذخیره گزارش</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Box / Mission Terminal */}
        <div className="max-w-3xl mx-auto bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl mb-12">
          
          {/* Credit Status & Pricing Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <label className="block text-sm font-bold text-slate-200">
              هدف، ایده یا محصول خود را برای تحلیل و تدوین برنامه وارد کنید:
            </label>

            {userStatus?.hasCredit ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{userStatus.isAdmin ? 'دسترسی نامحدود ادمین' : `${userStatus.creditsRemaining} اعتبار گزارش فعال`}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>پیش‌نمایش رایگان • گزارش کامل: {formattedPrice}</span>
              </div>
            )}
          </div>
          
          <div className="relative mb-3">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={isLoading || isPreviewLoading}
              rows={3}
              placeholder="مثال: من یک ساعت هوشمند اقتصادی دارم و می‌خواهم آن را آنلاین بفروشم، یا می‌خواهم یک سایت فروش آنلاین لباس راه بیندازم..."
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-2xl p-4 text-white text-sm sm:text-base leading-relaxed placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none disabled:opacity-50"
            />
          </div>

          {/* Quick inspiration chips */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              نمونه‌های پیشنهادی:
            </span>
            {SAMPLE_GOALS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setGoal(sample);
                  handleGetPreview(sample);
                }}
                disabled={isLoading || isPreviewLoading}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/50 transition-all disabled:opacity-50"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Smart Goal Clarification (Step 2: Understanding Goal) */}
          <div className="mb-5 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => setShowClarification(!showClarification)}
              className="w-full flex items-center justify-between text-xs font-bold text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                <span>تدقیق هوشمند هدف (پاسخ به ۳ سوال اختیاری جهت افزایش دقت تحلیل KASP)</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {showClarification ? 'بستن' : (businessStage || salesModel || budgetRange ? 'ویرایش اطلاعات' : 'پاسخ اختیاری')}
              </span>
            </button>

            {showClarification && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 animate-fadeIn text-xs">
                {/* Q1: Stage */}
                <div>
                  <span className="text-slate-400 block mb-1.5 font-bold">۱. مرحله فعلی کسب‌وکار شما:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['ایده اولیه و راه‌اندازی', 'محصول آماده فروش', 'کسب‌وکار فعال و در حال رشد'].map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setBusinessStage(businessStage === stage ? '' : stage)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          businessStage === stage
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2: Sales Channel */}
                <div>
                  <span className="text-slate-400 block mb-1.5 font-bold">۲. کانال اصلی فروش یا ارائه:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['فروشگاه آنلاین و شبکه‌های اجتماعی', 'فروش B2B و شرکتی', 'خدمات و مشاوره تخصصی'].map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => setSalesModel(salesModel === model ? '' : model)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          salesModel === model
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q3: Budget */}
                <div>
                  <span className="text-slate-400 block mb-1.5 font-bold">۳. بودجه تخمینی اولیه برای شروع یا توسعه:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['کمتر از ۳۰ میلیون تومان', '۳۰ تا ۱۰۰ میلیون تومان', 'بیش از ۱۰۰ میلیون تومان'].map((bgt) => (
                      <button
                        key={bgt}
                        type="button"
                        onClick={() => setBudgetRange(budgetRange === bgt ? '' : bgt)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          budgetRange === bgt
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {bgt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-700/60">
            {/* Free Preview Button */}
            <button
              onClick={() => handleGetPreview()}
              disabled={isPreviewLoading || isLoading || !goal.trim()}
              className="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-600 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isPreviewLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                  <span>در حال استخراج پیش‌نمایش...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>پیش‌نمایش رایگان و سریع</span>
                </>
              )}
            </button>

            {/* Dynamic Primary Execution / Action Button */}
            <button
              onClick={handlePrimaryAction}
              disabled={isLoading || isPreviewLoading || !goal.trim()}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>KASP در حال تحلیل و پژوهش...</span>
                </>
              ) : (
                <>
                  <span>{getPrimaryButtonLabel()}</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
              {!userStatus?.hasCredit && userStatus?.isAuthenticated && (
                <button
                  onClick={handleCreateOrderAndPay}
                  className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold text-[11px] border border-rose-500/40 transition-colors shrink-0"
                >
                  خرید اعتبار گزارش
                </button>
              )}
            </div>
          )}
        </div>

        {/* Free Preview Card Display */}
        {previewData && !report && !isLoading && (
          <div className="max-w-4xl mx-auto bg-slate-900/95 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl mb-12 animate-fadeIn space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-500/30 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    پیش‌نمایش رایگان ارزیابی ایده (KASP Preview)
                  </span>
                  {previewData.kaspVerdict && (
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                      previewData.kaspVerdict.verdict === 'GO' 
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' 
                        : previewData.kaspVerdict.verdict === 'TEST_FIRST'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                    }`}>
                      {previewData.kaspVerdict.badge} — {previewData.kaspVerdict.title}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">{goal}</h3>
              </div>

              {previewData.kaspScore && (
                <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-700 flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">امتیاز کل فرصت KASP</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {previewData.kaspScore.totalOpportunityScore}
                      <span className="text-xs text-slate-400 font-normal"> / ۱۰۰</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {previewData.summary || previewData.initialSummary}
            </div>

            {/* Metric Grid */}
            {previewData.kaspScore && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-850/70 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">فرصت بازار</span>
                  <span className="text-sm font-bold text-white font-mono">{previewData.kaspScore.marketOpportunity}٪</span>
                </div>
                <div className="bg-slate-850/70 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">تقاضای مشتری</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{previewData.kaspScore.customerDemand}٪</span>
                </div>
                <div className="bg-slate-850/70 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">پتانسیل مارکتینگ</span>
                  <span className="text-sm font-bold text-purple-400 font-mono">{previewData.kaspScore.marketingPotential}٪</span>
                </div>
                <div className="bg-slate-850/70 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">شدت رقابت</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">{previewData.kaspScore.competition}٪</span>
                </div>
              </div>
            )}

            {/* Opportunities & Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewData.topOpportunities && previewData.topOpportunities.length > 0 && (
                <div className="bg-slate-850/60 p-4 rounded-2xl border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    فرصت‌های اصلی رشد:
                  </span>
                  <ul className="space-y-1.5">
                    {previewData.topOpportunities.map((op, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{op}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {previewData.topRisks && previewData.topRisks.length > 0 && (
                <div className="bg-slate-850/60 p-4 rounded-2xl border border-rose-500/20 space-y-2">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    ریسک‌ها و چالش‌های اولیه:
                  </span>
                  <ul className="space-y-1.5">
                    {previewData.topRisks.map((rk, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{rk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Comparison: Preview vs Full Report */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300">مقایسه پیش‌نمایش با گزارش جامع ۱۵ بخشی:</h4>
                <span className="text-[11px] text-amber-400 font-bold">ارزش افزوده نسخه کامل</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 flex items-center gap-2">
                  <span className="text-slate-500">○</span>
                  <span>پیش‌نمایش: ارزیابی سریع و خلاصه امتیاز اولیه</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>گزارش کامل: جستجوی زنده وب، تحلیل عمیق رقبا و استراتژی قیمت‌گذاری</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 flex items-center gap-2">
                  <span className="text-slate-500">○</span>
                  <span>پیش‌نمایش: بدون استنادهای زنده وب و بدون قیف فروش</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>گزارش کامل: قیف فروش، قلاب‌های تبلیغاتی، نقشه ۳۰ روزه و توصیه مستقیم مدیر</span>
                </div>
              </div>
            </div>

            {/* Bottom Call To Action */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-right">
                <h4 className="text-sm font-black text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>قفل‌گشایی گزارش جامع هوش تجاری و استراتژی اجرایی</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">۱۵ بخش اختصاصی</span>
                </h4>
                <p className="text-xs text-slate-400">
                  تحقیق زنده با Google Search Grounding، مدل‌سازی قیمت و حاشیه سود، و نقشه اقدام هفته به هفته
                </p>
              </div>

              <button
                onClick={handlePrimaryAction}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{getPrimaryButtonLabel()}</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Execution Progress Card */}
        {isLoading && currentStage && (
          <div className="max-w-3xl mx-auto bg-slate-800/90 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl mb-12 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping"></div>
                <h3 className="text-base font-black text-white">{currentStage.title}</h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                {currentStage.progressPercent}٪ پیشرفت
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {currentStage.description}
            </p>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${currentStage.progressPercent}%` }}
              ></div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
              <span>هماهنگی بین Manager و واحدهای Research و Marketing</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                پردازش real-time
              </span>
            </div>
          </div>
        )}

        {/* FINAL COMPREHENSIVE BUSINESS INTELLIGENCE REPORT & BUILD MODE */}
        {report && (
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Major Capability Selector Switcher */}
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl grid grid-cols-2 md:grid-cols-4 items-center gap-2 shadow-2xl">
              <button
                onClick={() => setMajorCapability('workforce')}
                className={`w-full py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
                  majorCapability === 'workforce'
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Zap className="w-4 h-4 fill-current text-slate-950" />
                <span>۱. نیروی کار اجرایی</span>
                <span className="px-1.5 py-0.5 bg-slate-950/20 text-slate-900 text-[10px] font-black rounded-full">اصلی</span>
              </button>

              <button
                onClick={() => setMajorCapability('analysis')}
                className={`w-full py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
                  majorCapability === 'analysis'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span>۲. تحلیل و پژوهش</span>
              </button>

              <button
                onClick={() => setMajorCapability('build')}
                className={`w-full py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
                  majorCapability === 'build'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Hammer className="w-4 h-4 text-amber-300" />
                <span>۳. ساخت دارایی‌ها</span>
              </button>

              <button
                onClick={() => setMajorCapability('voice')}
                className={`w-full py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
                  majorCapability === 'voice'
                    ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-lg shadow-amber-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Mic className="w-4 h-4 text-amber-300" />
                <span>۴. مشاور صوتی</span>
                <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[10px] font-black rounded-full">صوتی</span>
              </button>
            </div>

            {majorCapability === 'workforce' ? (
              <AutonomousWorkforce
                projectId={report.id}
                businessGoal={report.businessGoal}
                onBackToAnalysis={() => setMajorCapability('analysis')}
                onRequireLogin={onRequireLogin}
              />
            ) : majorCapability === 'build' ? (
              <KaspBuildMode
                projectId={report.id}
                businessGoal={report.businessGoal}
                onBackToAnalysis={() => setMajorCapability('analysis')}
                onRequireLogin={onRequireLogin}
              />
            ) : majorCapability === 'voice' ? (
              <div className="space-y-6 animate-fadeIn">
                <VoiceAdvisorCard
                  projectId={report.id}
                  businessGoal={report.businessGoal}
                  businessName={report.businessGoal}
                />
              </div>
            ) : (
              <div id="kasp-final-report-document" className="bg-slate-950/90 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fadeIn">
            
            {/* Report Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-6 sm:p-8 border-b border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    گزارش هوش تجاری KASP (Business Intelligence)
                  </span>
                  <span className="text-xs text-slate-400">
                    شناسه: <span className="font-mono">{report.id.slice(0, 8)}</span>
                  </span>
                  {report.kaspVerdict && (
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                      report.kaspVerdict.status === 'GO' 
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' 
                        : report.kaspVerdict.status === 'TEST_FIRST'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                    }`}>
                      {report.kaspVerdict.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  تحلیل و برنامه جامع: «{report.businessGoal}»
                </h3>
              </div>

              {/* Action & Sales-Ready Export Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setMajorCapability('workforce')}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>🚀 نیروی کار اجرایی KASP</span>
                </button>

                <button
                  onClick={() => setMajorCapability('voice')}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>🎙️ از مشاور KASP بشنو</span>
                </button>

                <button
                  onClick={() => setMajorCapability('build')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Hammer className="w-4 h-4 text-amber-300" />
                  <span>ساخت دارایی‌ها</span>
                </button>

                <button
                  onClick={handleGetFullReportCTA}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>اقدام ۳۰ روزه</span>
                </button>

                <button
                  onClick={handleCopyReport}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                  title="کپی متن کامل گزارش ۱۵ بخشی"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'کپی شد!' : 'Copy Report'}</span>
                </button>

                <button
                  onClick={handleCopyExecutiveSummary}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                  title="کپی خلاصه اجرایی و نکات کلیدی"
                >
                  {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4" />}
                  <span>{copiedSummary ? 'کپی شد!' : 'خلاصه اجرایی'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                  title="چاپ یا ذخیره خروجی تمیز PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={handleJumpToSources}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Search className="w-3.5 h-3.5 text-purple-400" />
                  <span>منابع</span>
                </button>
              </div>
            </div>

            {/* Embedded Voice Advisor Card in Overview */}
            <div className="p-6 sm:p-8 pb-2">
              <VoiceAdvisorCard
                projectId={report.id}
                businessGoal={report.businessGoal}
                businessName={report.businessGoal}
              />
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-900/60 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-slate-950 text-indigo-400 border-t-2 border-indigo-500 border-x border-slate-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span>۱. خلاصه، نتیجه نهایی و برنامه ۳۰ روزه</span>
              </button>

              <button
                onClick={() => setActiveTab('research')}
                className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'research'
                    ? 'bg-slate-950 text-purple-400 border-t-2 border-purple-500 border-x border-slate-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>۲. تحلیل بازار، رقبا و پرسونا</span>
              </button>

              <button
                onClick={() => setActiveTab('marketing')}
                className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'marketing'
                    ? 'bg-slate-950 text-emerald-400 border-t-2 border-emerald-500 border-x border-slate-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>۳. قیمت‌گذاری، فروش و کمپین‌ها</span>
              </button>

              <button
                onClick={() => setActiveTab('kaspPlan')}
                className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'kaspPlan'
                    ? 'bg-slate-950 text-amber-400 border-t-2 border-amber-500 border-x border-slate-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300">۴. پیشنهاد KASP برای قدم بعدی</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* TAB 1: OVERVIEW & VERDICT & ACTION PLAN */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* 13. KASP FINAL VERDICT & SCORE BANNER */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Verdict Card */}
                    <div className={`lg:col-span-2 p-6 rounded-3xl border ${
                      report.kaspVerdict?.status === 'GO'
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : report.kaspVerdict?.status === 'TEST_FIRST'
                        ? 'bg-amber-950/30 border-amber-500/40'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>۱۳. نتیجه‌گیری نهایی KASP (Final Verdict)</span>
                        </span>
                        <span className={`px-3 py-1 text-xs font-black rounded-full ${
                          report.kaspVerdict?.status === 'GO'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : report.kaspVerdict?.status === 'TEST_FIRST'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {report.kaspVerdict?.badge || '🟡 TEST FIRST'}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-white mb-2 leading-snug">
                        {report.kaspVerdict?.title || 'ارزیابی و تست اولیه پیش از سرمایه‌گذاری سنگین'}
                      </h4>

                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                        {report.kaspVerdict?.rationale || 'بر مبنای ارزیابی تقاضای بازار و وضعیت رقبا، اجرای پایلوت کنترل‌شده بهترین مسیر برای اعتبارسنجی فرضیات فروش است.'}
                      </p>

                      {report.kaspVerdict?.keyAssumptionsToValidate && report.kaspVerdict.keyAssumptionsToValidate.length > 0 && (
                        <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-400 block">
                            فرضیات حیاتی که باید در تست اولیه اعتبارسنجی شوند:
                          </span>
                          {report.kaspVerdict.keyAssumptionsToValidate.map((assumption, aIdx) => (
                            <div key={aIdx} className="flex items-start gap-2 text-xs text-slate-200">
                              <span className="text-amber-400 font-bold shrink-0">❖</span>
                              <span>{assumption}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* KASP Score Card */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-indigo-400" />
                            <span>امتیاز فرصت (KASP Score)</span>
                          </span>
                          <span className="text-2xl font-black font-mono text-emerald-400">
                            {report.kaspScore?.totalOpportunityScore || 78}<span className="text-xs text-slate-400 font-normal">/۱۰۰</span>
                          </span>
                        </div>

                        {/* Metric Breakdown */}
                        <div className="space-y-2 text-xs">
                          <div>
                            <div className="flex justify-between text-slate-300 mb-1">
                              <span>فرصت بازار (Market Opportunity)</span>
                              <span className="font-mono text-indigo-300">{report.kaspScore?.marketOpportunity || 8}/۱۰</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(report.kaspScore?.marketOpportunity || 8) * 10}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-300 mb-1">
                              <span>رقابت‌پذیری (Competition)</span>
                              <span className="font-mono text-purple-300">{report.kaspScore?.competition || 6}/۱۰</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(report.kaspScore?.competition || 6) * 10}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-300 mb-1">
                              <span>تقاضای مشتری (Customer Demand)</span>
                              <span className="font-mono text-emerald-300">{report.kaspScore?.customerDemand || 9}/۱۰</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(report.kaspScore?.customerDemand || 9) * 10}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-300 mb-1">
                              <span>سهولت اجرا (Execution Feasibility)</span>
                              <span className="font-mono text-amber-300">{report.kaspScore?.executionDifficulty || 7}/۱۰</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(report.kaspScore?.executionDifficulty || 7) * 10}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-300 mb-1">
                              <span>پتانسیل بازاریابی (Marketing Potential)</span>
                              <span className="font-mono text-sky-300">{report.kaspScore?.marketingPotential || 8}/۱۰</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(report.kaspScore?.marketingPotential || 8) * 10}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {report.kaspScore?.scoreRationale && (
                        <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800 leading-relaxed">
                          {report.kaspScore.scoreRationale}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* 15. MANAGER DIRECT ADVICE ("اگر من جای شما بودم...") */}
                  <div className="bg-gradient-to-r from-amber-950/40 via-indigo-950/40 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 text-amber-400 font-black text-sm sm:text-base">
                        <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                        <span>۱۵. توصیه استراتژیک مدیر ارشد KASP: «اگر من جای شما بودم...»</span>
                      </div>
                      <span className="text-[11px] px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shrink-0">
                        تصمیم و جهت‌گیری کلیدی
                      </span>
                    </div>
                    <div className="text-slate-100 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium bg-slate-950/60 p-4 rounded-2xl border border-amber-500/20">
                      {report.managerDirectAdvice || 'اگر من جای شما بودم، به جای اینکه سرمایه زیادی صرف خرید اولیه انبار یا ساخت سیستم‌های پیچیده کنم، ابتدا یک پیشنهاد فوق‌العاده شفاف (Irresistible Offer) با تست ویدئویی ملموس آماده می‌کردم. اولین فروش را با موجودی محدود محقق می‌کردم تا هزینه جذب واقعی (CAC) و دغدغه واقعی مشتریان کشف شود. بزرگ‌ترین تله در این حوزه، خواب سرمایه روی تنوع کالا پیش از اثبات تقاضای پایدار است.'}
                    </div>
                  </div>

                  {/* 1. Executive Summary */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-sm">
                        <FileText className="w-4 h-4" />
                        <span>۱. خلاصه اجرایی (Executive Summary)</span>
                      </div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                        FACT & INFERENCE SYNTHESIS
                      </span>
                    </div>
                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
                      {report.executiveSummary}
                    </p>
                  </div>

                  {/* 2. Idea & Product Analysis */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2.5 mb-3 text-purple-400 font-bold text-sm">
                      <Lightbulb className="w-4 h-4" />
                      <span>۲. تحلیل ساختاری ایده / محصول و اقتصاد واحد (Unit Economics)</span>
                    </div>
                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
                      {report.ideaAndProductAnalysis}
                    </p>
                  </div>

                  {/* 7. Value Proposition */}
                  <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-2.5 mb-2 text-emerald-400 font-bold text-sm">
                      <Target className="w-4 h-4" />
                      <span>۷. پیشنهاد ارزش اصلی و متمایز (USP)</span>
                    </div>
                    <p className="text-lg font-bold text-white leading-relaxed">
                      «{report.valueProposition}»
                    </p>
                  </div>

                  {/* 11. 30-DAY ACTION PLAN TABLE */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>۱۱. برنامه اجرایی ۳۰ روزه (30-Day Action Plan)</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        برنامه گام‌به‌گام عملیاتی با شاخص‌های کلیدی عملکرد (KPI)
                      </span>
                    </div>

                    {/* Responsive Action Plan Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
                            <th className="p-3 w-32 shrink-0">بازه زمانی</th>
                            <th className="p-3 min-w-[200px]">اقدام عملی و ملموس</th>
                            <th className="p-3 min-w-[160px]">هدف فاز</th>
                            <th className="p-3 min-w-[150px]">شاخص کلیدی (KPI)</th>
                            <th className="p-3 w-28 text-center">اولویت</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {(report.actionPlan30Days || []).map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                              <td className="p-3 font-bold text-indigo-300 whitespace-nowrap align-top">
                                {item.timeframe}
                              </td>
                              <td className="p-3 text-slate-200 leading-relaxed align-top font-medium">
                                {item.action}
                              </td>
                              <td className="p-3 text-slate-300 leading-relaxed align-top">
                                {item.objective}
                              </td>
                              <td className="p-3 text-emerald-300 font-mono text-[11px] leading-relaxed align-top">
                                {item.kpi}
                              </td>
                              <td className="p-3 text-center align-top whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.priority.includes('P0') || item.priority.includes('ضروری')
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : item.priority.includes('P1') || item.priority.includes('بالا')
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                }`}>
                                  {item.priority}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: RESEARCH, COMPETITORS & PERSONAS */}
              {activeTab === 'research' && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* 3. Target Audience Personas */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2.5 mb-2 text-purple-400 font-bold text-sm">
                      <Users className="w-4 h-4" />
                      <span>۳. مشتری هدف و پرسونای خریداران</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-6">{report.targetCustomers.summary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.targetCustomers.personas.map((persona, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                            {persona.personaName}
                          </div>
                          <p className="text-xs text-slate-400">{persona.demographics}</p>
                          
                          <div className="pt-2">
                            <span className="text-[11px] font-bold text-rose-400 block mb-1">دغدغه‌ها و موانع خرید:</span>
                            <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                              {persona.painPoints.map((pain, pIdx) => (
                                <li key={pIdx}>{pain}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="pt-1">
                            <span className="text-[11px] font-bold text-emerald-400 block mb-1">انگیزه‌های نهایی خرید:</span>
                            <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                              {persona.buyingTriggers.map((trig, tIdx) => (
                                <li key={tIdx}>{trig}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Market Overview & Data Categorization */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                        <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span>۴. وضعیت کنونی بازار و تقاضا</span>
                        </div>
                        {report.searchGroundingStatus && (
                          <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full border ${
                            report.searchGroundingStatus.includes('فعال')
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800/80 text-slate-400 border-slate-700'
                          }`}>
                            {report.searchGroundingStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4">
                        {report.marketStatus}
                      </p>

                      {/* Explicit Fact vs Estimate vs Inference Breakdown */}
                      {report.groundedFactsVsEstimates && (
                        <div className="space-y-2 pt-3 border-t border-slate-800">
                          {report.groundedFactsVsEstimates.verifiedFacts && report.groundedFactsVsEstimates.verifiedFacts.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs">
                              <span className="font-bold text-emerald-300 block mb-1">🟢 FACT / SEARCH-GROUNDED (واقعیت اثبات‌شده):</span>
                              <ul className="text-slate-300 space-y-0.5 list-disc list-inside">
                                {report.groundedFactsVsEstimates.verifiedFacts.map((f, fIdx) => (
                                  <li key={fIdx}>{f}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {report.groundedFactsVsEstimates.groundedEstimates && report.groundedFactsVsEstimates.groundedEstimates.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs">
                              <span className="font-bold text-amber-300 block mb-1">🟡 ESTIMATE / ASSUMPTION (تخمین‌های محاسباتی):</span>
                              <ul className="text-slate-300 space-y-0.5 list-disc list-inside">
                                {report.groundedFactsVsEstimates.groundedEstimates.map((e, eIdx) => (
                                  <li key={eIdx}>{e}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {report.groundedFactsVsEstimates.modelInferences && report.groundedFactsVsEstimates.modelInferences.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-900/40 text-xs">
                              <span className="font-bold text-indigo-300 block mb-1">🔵 MODEL ANALYSIS / INFERENCE (استنباط تحلیلی):</span>
                              <ul className="text-slate-300 space-y-0.5 list-disc list-inside">
                                {report.groundedFactsVsEstimates.modelInferences.map((m, mIdx) => (
                                  <li key={mIdx}>{m}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                      <div className="flex items-center gap-2.5 mb-3 text-emerald-400 font-bold text-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>۶. فرصت‌های اصلی بازار</span>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-200">
                        {report.coreOpportunities.map((opp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-black shrink-0">✦</span>
                            <span>{opp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 5. Competitors */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2.5 mb-2 text-amber-400 font-bold text-sm">
                      <Layers className="w-4 h-4" />
                      <span>۵. تحلیل رقبا و جایگاه ما</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{report.competitors.summary}</p>
                    
                    <div className="space-y-3">
                      {report.competitors.list.map((comp, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <div className="font-bold text-white text-sm mb-2">{comp.name}</div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div className="text-slate-400">
                              <span className="font-bold text-slate-300 block mb-0.5">نقاط قوت رقیب:</span>
                              {comp.strengths}
                            </div>
                            <div className="text-slate-400">
                              <span className="font-bold text-slate-300 block mb-0.5">نقاط ضعف رقیب:</span>
                              {comp.weaknesses}
                            </div>
                            <div className="text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                              <span className="font-bold block mb-0.5">مزیت رقابتی ما:</span>
                              {comp.ourAdvantage}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 12. Risks */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2.5 mb-3 text-rose-400 font-bold text-sm">
                      <ShieldAlert className="w-4 h-4" />
                      <span>۱۲. ریسک‌ها و راهکارهای مهار (Risk Mitigation)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl">
                        <span className="text-xs font-bold text-rose-300 block mb-2">ریسک‌های کلیدی:</span>
                        <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                          {report.risksAndChallenges.criticalRisks.map((risk, rIdx) => (
                            <li key={rIdx}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl">
                        <span className="text-xs font-bold text-emerald-300 block mb-2">راهکارهای مهار KASP:</span>
                        <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                          {report.risksAndChallenges.mitigationPlan.map((plan, pIdx) => (
                            <li key={pIdx}>{plan}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 14. Grounding Sources Section */}
                  <div id="report-sources-section" className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                        <Search className="w-4 h-4" />
                        <span>۱۴. منابع و شواهد زنده جستجوی وب (Verified Sources)</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {report.sources && report.sources.length > 0 ? `${report.sources.length} منبع معتبر وب` : 'تحلیل استنباطی'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-4">
                      تنها منابع مستخرج از جستجوی واقعی وب در این بخش درج شده و هیچ منبع یا آدرس ساختگی تولید نشده است.
                    </p>

                    {report.sources && report.sources.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {report.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 transition-all text-xs group"
                          >
                            <div className="font-semibold text-indigo-300 group-hover:text-indigo-200 flex items-center justify-between gap-2 mb-1">
                              <span className="truncate">{src.title}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-indigo-400" />
                            </div>
                            <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                              {src.claim || src.url}
                            </p>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                        داده‌های این گزارش بر پایه تحلیل ساختاری مدل و متغیرهای اقتصاد دیجیتال تدوین شده است.
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 3: MARKETING, PRICING & CAMPAIGNS */}
              {activeTab === 'marketing' && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* 8. Pricing Strategy */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2.5 mb-4 text-emerald-400 font-bold text-sm">
                      <DollarSign className="w-4 h-4" />
                      <span>۸. استراتژی و مدل قیمت‌گذاری (Pricing Strategy)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-slate-400 block mb-1">مدل قیمت‌گذاری پیشنهادی:</span>
                        <p className="text-sm font-bold text-white">{report.pricingStrategy?.pricingModel || report.salesStrategy.pricingModel}</p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-emerald-400 block mb-1">بازه قیمتی پیشنهادی:</span>
                        <p className="text-sm font-black text-emerald-300 font-mono">{report.pricingStrategy?.suggestedPriceRange || 'بر اساس رقبا'}</p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-amber-400 block mb-1">تخمین حاشیه سود ناخالص:</span>
                        <p className="text-sm font-black text-amber-300 font-mono">{report.pricingStrategy?.grossMarginEstimate || '۲۵٪ تا ۳۵٪'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="font-bold text-indigo-300 block mb-2">تکنیک‌های روانی قیمت‌گذاری:</span>
                        <ul className="text-slate-300 list-disc list-inside space-y-1">
                          {(report.pricingStrategy?.psychologicalTactics || [
                            'استفاده از قیمت‌گذاری عدد ۹ (مثلاً ۸۹۰,۰۰۰ تومان)',
                            'ایجاد لنگر ذهنی با مقایسه با ساعت‌های لوکس',
                            'ارائه باندل با اقلام مکمل رایگان'
                          ]).map((tactic, tIdx) => (
                            <li key={tIdx}>{tactic}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="font-bold text-emerald-300 block mb-2">آفرها و تخفیفات اولیه:</span>
                        <ul className="text-slate-300 list-disc list-inside space-y-1">
                          {(report.pricingStrategy?.promotionsAndOffers || [
                            'ارسال رایگان در ازای تسویه آنلاین',
                            'ضمانت تعویض ۴۸ ساعته در صورت عدم رضایت'
                          ]).map((promo, pIdx) => (
                            <li key={pIdx}>{promo}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 9. Sales Funnel & Customer Acquisition */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2.5 mb-4 text-indigo-400 font-bold text-sm">
                      <Target className="w-4 h-4" />
                      <span>۹. استراتژی جذب مشتری و قیف فروش (Sales Funnel)</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                      {report.salesStrategy.funnel.map((step, idx) => (
                        <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 relative">
                          <span className="text-xs font-mono font-bold text-indigo-400 block mb-1">مرحله ۰{idx + 1}</span>
                          <p className="text-xs text-slate-200 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="font-bold text-slate-300 block mb-2">کانال‌های اصلی جذب:</span>
                        <div className="space-y-2">
                          {report.marketingStrategyAndChannels.channels.map((ch, chIdx) => (
                            <div key={chIdx} className="flex items-start justify-between gap-2 border-b border-slate-900 pb-1.5 last:border-0">
                              <span className="text-white font-bold">{ch.channel}</span>
                              <span className="text-slate-400 text-[11px] text-left">{ch.rationale}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="font-bold text-slate-300 block mb-2">تکنیک‌های نهایی بستن فروش:</span>
                        <ul className="text-slate-400 list-disc list-inside space-y-1">
                          {report.salesStrategy.closingTactics.map((tactic, tIdx) => (
                            <li key={tIdx}>{tactic}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 10. Advertising Ideas */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2.5 mb-4 text-indigo-400 font-bold text-sm">
                      <Megaphone className="w-4 h-4" />
                      <span>۱۰. ایده‌های تبلیغاتی و قلاب‌های ترغیب‌کننده (Ad Hooks)</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {report.advertisingIdeas.map((ad, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-indigo-400 font-bold mb-2">
                              <span>{ad.channel}</span>
                              <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400">{ad.format}</span>
                            </div>
                            <p className="text-sm font-bold text-white mb-3 leading-relaxed">
                              {ad.hook}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 bg-slate-900 p-2 rounded border border-slate-800/80">
                            زاویه روانی: {ad.targetAngle}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 10-b. Content Strategy & Captions */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2.5 mb-4 text-purple-400 font-bold text-sm">
                      <FileText className="w-4 h-4" />
                      <span>پیشنهاد محتوایی، کپشن و دعوت به اقدام (CTA)</span>
                    </div>
                    
                    <div className="space-y-4">
                      {report.contentStrategyAndCaptions.map((content, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-white">{content.title}</h4>
                            <span className="text-xs text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                              {content.contentType}
                            </span>
                          </div>
                          <div className="bg-slate-900/80 p-3 rounded-lg text-xs text-slate-300 whitespace-pre-line leading-relaxed mb-3 border border-slate-800">
                            {content.captionDraft}
                          </div>
                          <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                            <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">CTA:</span>
                            <span>{content.cta}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: KASP RECOMMENDATION & SALES-READY EXECUTION */}
              {activeTab === 'kaspPlan' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div id="kasp-execution-box" className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2.5 mb-3 text-amber-400 font-black text-base">
                      <Sparkles className="w-5 h-5" />
                      <span>دریافت گزارش کامل و نقشه راه پیاده‌سازی KASP</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white mb-4 leading-tight">
                      چگونه این نقشه راه و استراتژی تحلیلی را به محصول و فروش واقعی تبدیل کنیم؟
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                        <span className="text-xs font-bold text-indigo-400 block mb-2">راهکار نرم‌افزاری پیشنهادی:</span>
                        <p className="text-slate-200 leading-relaxed">{report.kaspRecommendations.softwareSolution}</p>
                      </div>

                      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                        <div>
                          <span className="text-xs font-bold text-emerald-400 block mb-1">پشته تکنولوژی استاندارد:</span>
                          <p className="text-xs font-mono text-slate-300">{report.kaspRecommendations.recommendedTechStack}</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-amber-400 block mb-1">زمان‌بندی تحویل MVP:</span>
                          <p className="text-xs text-slate-300">{report.kaspRecommendations.estimatedLaunchTimeline}</p>
                        </div>
                      </div>
                    </div>

                    {/* Step by step action plan */}
                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-slate-200 mb-3">مراحل عملیاتی پیاده‌سازی با KASP:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {report.kaspRecommendations.actionSteps.map((step, idx) => (
                          <div key={idx} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                              ✓
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Direct execution triggers */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setMajorCapability('build');
                          const buildElem = document.getElementById('kasp-final-report-document') || document.querySelector('.bg-slate-900\\/90');
                          buildElem?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-95"
                      >
                        <Hammer className="w-5 h-5 text-amber-300" />
                        <span>ساخت این کسب‌وکار (ورود به KASP Build Mode)</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onRequestCustomApp) {
                            onRequestCustomApp(`برنامه اجرایی و ساخت نرم‌افزار: ${report.businessGoal}`);
                          } else {
                            const customSection = document.getElementById('custom-app');
                            customSection?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>سفارش اختصاصی به تیم فنی KASP</span>
                      </button>

                      <a
                        href="https://t.me/kasp0000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-5 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
                      >
                        <span>مشاور در تلگرام</span>
                      </a>
                    </div>

                  </div>

                </div>
              )}

            </div>

            
            {/* MANAGER CONVERSATION (Post-Report Q&A) */}
            <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-500" />
                  <span>گفتگو با مدیر هوش مصنوعی KASP</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  می‌توانید درباره جزئیات این گزارش، رقبا، و قدم‌های بعدی از مدیر استراتژی سوال بپرسید.
                </p>
              </div>
              <CustomerProjectConversation report={report} />
            </div>

            {/* Bottom Reset / Re-run */}
            <div className="bg-slate-900/60 p-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>گزارش کامل در حافظه ذخیره شده است.</span>
              <button
                onClick={() => {
                  setGoal('');
                  setReport(null);
                  setCurrentStage(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحلیل یک ایده یا هدف جدید</span>
              </button>
            </div>

          </div>
            )}
          </div>
        )}

      </div>

      {/* Payment Modal for AI Report Orders */}
      {paymentModalData && (
        <PaymentModal
          isOpen={paymentModalData.isOpen}
          onClose={() => setPaymentModalData(null)}
          itemTitle={paymentModalData.itemTitle}
          amount={paymentModalData.amount}
          orderId={paymentModalData.orderId}
          productCode={paymentModalData.productCode}
          onPaymentSuccess={() => {
            fetchStatus();
            setPaymentModalData(null);
            setError(null);
          }}
          lang="fa"
        />
      )}
    </section>
  );
};

