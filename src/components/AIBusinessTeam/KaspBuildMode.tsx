import React, { useState, useEffect } from 'react';
import { 
  Hammer, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  Code, 
  Eye, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  ShieldAlert, 
  Sliders, 
  History, 
  FileText, 
  Globe, 
  Zap, 
  ShoppingBag, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Lock, 
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  BuildArtifact, 
  BuildExecutionPlan, 
  BuildExecutionLog, 
  BuildCapabilityStatus, 
  BuildProgressStatus, 
  ArtifactHierarchyLevel 
} from '../../server/brain/types';
import { apiFetch } from '../../utils/api';

interface KaspBuildModeProps {
  projectId: string;
  businessGoal: string;
  onBackToAnalysis?: () => void;
  onRequireLogin?: () => void;
}

export const KaspBuildMode: React.FC<KaspBuildModeProps> = ({
  projectId,
  businessGoal,
  onBackToAnalysis,
  onRequireLogin
}) => {
  const [plan, setPlan] = useState<BuildExecutionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHierarchy, setActiveHierarchy] = useState<string>('ALL');
  const [executingArtifactId, setExecutingArtifactId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<BuildExecutionLog[]>([]);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  
  // Preview Modal
  const [previewArtifact, setPreviewArtifact] = useState<BuildArtifact | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewTab, setPreviewTab] = useState<'preview' | 'code'>('preview');
  const [copiedCode, setCopiedCode] = useState(false);

  // User Input Modal
  const [inputModalArtifact, setInputModalArtifact] = useState<BuildArtifact | null>(null);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});

  // Human Approval Modal
  const [approvalModalArtifact, setApprovalModalArtifact] = useState<BuildArtifact | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch(`/api/brain/build/plan/${projectId}`);
      const data = await res.json();
      if (res.ok && data.success && data.plan) {
        setPlan(data.plan);
      } else {
        setError(data.error || 'خطا در بارگذاری نقشه راه ساخت');
      }
    } catch (err: any) {
      setError('خطا در ارتباط با سرور. لطفاً مجدداً تلاش فرمایید.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await apiFetch(`/api/brain/build/logs/${projectId}`);
      const data = await res.json();
      if (res.ok && data.success && data.logs) {
        setExecutionLogs(data.logs);
      }
    } catch (err) {
      console.warn('Could not fetch build logs:', err);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchPlan();
      fetchLogs();
    }
  }, [projectId]);

  const handleExecuteBuild = async (artifact: BuildArtifact, customInputs?: Record<string, string>) => {
    try {
      setExecutingArtifactId(artifact.id);
      setError(null);

      const res = await apiFetch('/api/brain/build/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          artifactId: artifact.id,
          userInputs: customInputs || userInputs
        })
      });

      const data = await res.json();
      if (res.status === 401) {
        if (onRequireLogin) onRequireLogin();
        else setError('برای ساخت خروجی، لطفاً ابتدا وارد حساب کاربری خود شوید.');
        return;
      }

      if (res.ok && data.success && data.artifact) {
        // Update item in local plan
        setPlan(prev => {
          if (!prev) return prev;
          const updatedItems = prev.items.map(it => it.id === artifact.id ? data.artifact : it);
          const readyCount = updatedItems.filter(i => i.progress === 'READY').length;
          return {
            ...prev,
            items: updatedItems,
            overallProgress: Math.round((readyCount / updatedItems.length) * 100),
            stats: {
              ...prev.stats,
              ready: readyCount
            }
          };
        });

        // Auto open preview if it's ready
        setPreviewArtifact(data.artifact);
        fetchLogs();
      } else {
        setError(data.error || 'خطا در ساخت تسک.');
      }
    } catch (err: any) {
      setError('خطا در اجرای فرآیند ساخت.');
    } finally {
      setExecutingArtifactId(null);
      setInputModalArtifact(null);
    }
  };

  const handleApproveArtifact = async (artifact: BuildArtifact) => {
    try {
      setError(null);
      const res = await apiFetch('/api/brain/build/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          artifactId: artifact.id,
          notes: approvalNotes
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.artifact) {
        setPlan(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map(it => it.id === artifact.id ? data.artifact : it)
          };
        });
        setApprovalModalArtifact(null);
        setApprovalNotes('');
        fetchLogs();
      } else {
        setError(data.error || 'خطا در ثبت تایید');
      }
    } catch (err) {
      setError('خطا در ثبت تایید انسانی.');
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getStatusBadge = (status: BuildCapabilityStatus) => {
    switch (status) {
      case 'CAN_BUILD_NOW':
        return {
          label: 'آماده ساخت مستقیم',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: Zap
        };
      case 'NEEDS_USER_INPUT':
        return {
          label: 'نیازمند ورودی کاربر',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: Sliders
        };
      case 'NEEDS_EXTERNAL_SERVICE':
        return {
          label: 'نیازمند اتصال به سرویس',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: Globe
        };
      case 'HUMAN_APPROVAL_REQUIRED':
        return {
          label: 'نیازمند تایید انسانی',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: ShieldAlert
        };
      default:
        return {
          label: 'پشتیبانی‌نشده',
          color: 'bg-slate-700 text-slate-400 border-slate-600',
          icon: AlertCircle
        };
    }
  };

  const getProgressBadge = (progress: BuildProgressStatus) => {
    switch (progress) {
      case 'READY':
        return { label: 'آماده و تحویل‌شده', color: 'text-emerald-400 font-bold', icon: CheckCircle2 };
      case 'BUILDING':
        return { label: 'در حال ساخت...', color: 'text-indigo-400 font-bold animate-pulse', icon: RefreshCw };
      case 'TESTING':
        return { label: 'در حال تست فنی...', color: 'text-amber-400 font-bold', icon: Clock };
      case 'RESEARCHING':
        return { label: 'استخراج بینش...', color: 'text-blue-400 font-bold', icon: Clock };
      default:
        return { label: 'در صف برنامه‌ریزی', color: 'text-slate-400', icon: Clock };
    }
  };

  const hierarchyFilters = [
    { key: 'ALL', label: 'همه خروجی‌ها' },
    { key: 'BUSINESS', label: 'برند و کسب‌وکار' },
    { key: 'OFFER', label: 'پیشنهاد و قیمت‌گذاری' },
    { key: 'LANDING_PAGE', label: 'صفحه فرود و وب' },
    { key: 'LEAD_CAPTURE', label: 'جذب لید و فرم' },
    { key: 'SALES_FUNNEL', label: 'قیف و اسکریپت فروش' },
    { key: 'MARKETING_ASSETS', label: 'محتوا و ایمیل' },
    { key: 'OPERATIONS', label: 'عملیات و اتوماسیون' },
  ];

  const filteredItems = plan?.items.filter(item => {
    if (activeHierarchy === 'ALL') return true;
    return item.hierarchyLevel === activeHierarchy;
  }) || [];

  return (
    <div className="space-y-8 animate-fadeIn text-white font-sans" dir="rtl">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black rounded-full flex items-center gap-1.5">
                <Hammer className="w-3.5 h-3.5" />
                <span>KASP BUILD MODE (قابلیت ۲: ساخت و اجرا)</span>
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-full">
                سیستم‌عامل کسب‌وکار
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              ساخت و اجرای نرم‌افزار و دارایی‌های رشد: <span className="text-indigo-400">{plan?.businessName || businessGoal}</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              سیستم‌عامل KASP گراف تحلیلی را به کدهای واقعی، لندینگ‌پیج تعاملی، فرم‌های جذب لید، توالی‌های فروش و ابزارهای عملیاتی تبدیل می‌کند.
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setShowLogsDrawer(!showLogsDrawer);
                fetchLogs();
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>تاریخچه اجرای ساخت ({executionLogs.length})</span>
            </button>

            {onBackToAnalysis && (
              <button
                onClick={onBackToAnalysis}
                className="px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/30 flex items-center gap-2 transition"
              >
                <Layers className="w-4 h-4" />
                <span>مشاهده گزارش تحلیلی</span>
              </button>
            )}
          </div>
        </div>

        {/* Overall Progress Stats Bar */}
        {plan && (
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">پیشرفت کل ساخت</span>
              <span className="text-xl font-black text-indigo-400 font-mono">{plan.overallProgress}٪</span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">کل خروجی‌ها</span>
              <span className="text-xl font-black text-white font-mono">{plan.stats.total}</span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[11px] text-emerald-400 block mb-1">آماده تحویل</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{plan.stats.ready}</span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[11px] text-emerald-300 block mb-1">امکان ساخت مستقیم</span>
              <span className="text-xl font-black text-emerald-300 font-mono">{plan.stats.canBuildNow}</span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[11px] text-blue-300 block mb-1">نیازمند سرویس</span>
              <span className="text-xl font-black text-blue-300 font-mono">{plan.stats.needsService}</span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[11px] text-purple-300 block mb-1">تایید انسانی</span>
              <span className="text-xl font-black text-purple-300 font-mono">{plan.stats.humanApprovalRequired}</span>
            </div>
          </div>
        )}

        {/* Safety Guarantee Notice */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>تعهد ایمنی KASP:</strong> هیچ‌گونه هزینه مالی، ارسال پیام به مشتری یا انتشار عمومی بدون تایید مستقیم شما انجام نمی‌شود.
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white font-bold">بستن</button>
        </div>
      )}

      {/* Hierarchy Level Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {hierarchyFilters.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveHierarchy(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeHierarchy === f.key
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Artifacts Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">در حال تدوین نقشه راه ساخت و ارزیابی خروجی‌ها...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(artifact => {
            const statusConfig = getStatusBadge(artifact.status);
            const progressConfig = getProgressBadge(artifact.progress);
            const StatusIcon = statusConfig.icon;
            const ProgressIcon = progressConfig.icon;
            const isExecuting = executingArtifactId === artifact.id;
            const isReady = artifact.progress === 'READY' && artifact.output;

            return (
              <div 
                key={artifact.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xl group hover:-translate-y-1"
              >
                <div>
                  {/* Status Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border flex items-center gap-1.5 ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusConfig.label}</span>
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {artifact.hierarchyLevel}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-black text-white mb-2 leading-snug group-hover:text-indigo-300 transition">
                    {artifact.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {artifact.description}
                  </p>

                  {/* External Service requirements if any */}
                  {artifact.requiredServices && artifact.requiredServices.length > 0 && (
                    <div className="mb-4 p-2.5 bg-blue-950/20 border border-blue-500/20 rounded-xl text-[11px] text-blue-200">
                      <span className="font-bold block mb-1">سرویس‌های متصل:</span>
                      {artifact.requiredServices.map((s, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between">
                          <span>• {s.service}</span>
                          <span className={s.isConfigured ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                            {s.isConfigured ? "✓ آماده" : "نیازمند تنظیم"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Human Approval indicator */}
                  {artifact.humanApproval?.required && (
                    <div className="mb-4 p-2.5 bg-purple-950/20 border border-purple-500/20 rounded-xl text-[11px] text-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">وضعیت تایید انسانی:</span>
                        <span className={artifact.humanApproval.approved ? "text-emerald-400 font-bold" : "text-purple-400 font-bold"}>
                          {artifact.humanApproval.approved ? "✓ تایید شده" : "در انتظار تایید"}
                        </span>
                      </div>
                      {artifact.humanApproval.riskWarning && (
                        <p className="text-[10px] text-slate-400 mt-1">{artifact.humanApproval.riskWarning}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions & Progress */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  
                  {/* Progress Status Bar */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">وضعیت چرخه:</span>
                    <span className={`flex items-center gap-1.5 text-xs ${progressConfig.color}`}>
                      <ProgressIcon className="w-3.5 h-3.5" />
                      <span>{progressConfig.label}</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isReady ? (
                      <>
                        <button
                          onClick={() => setPreviewArtifact(artifact)}
                          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده و تست خروجی</span>
                        </button>

                        <button
                          onClick={() => handleExecuteBuild(artifact)}
                          disabled={isExecuting}
                          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition"
                          title="بازتولید با هوش مصنوعی"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                        </button>
                      </>
                    ) : (
                      <>
                        {artifact.status === 'NEEDS_USER_INPUT' ? (
                          <button
                            onClick={() => setInputModalArtifact(artifact)}
                            disabled={isExecuting}
                            className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-1.5 transition"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>تنظیم ورودی و ساخت</span>
                          </button>
                        ) : artifact.status === 'HUMAN_APPROVAL_REQUIRED' && !artifact.humanApproval?.approved ? (
                          <button
                            onClick={() => setApprovalModalArtifact(artifact)}
                            disabled={isExecuting}
                            className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-1.5 transition"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>بررسی و تایید انسانی</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleExecuteBuild(artifact)}
                            disabled={isExecuting}
                            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition"
                          >
                            {isExecuting ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>در حال ساخت هوشمند...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>ساخت این خروجی</span>
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewArtifact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{previewArtifact.title}</h3>
                  <p className="text-xs text-slate-400">خروجی عملیاتی ساخته‌شده توسط موتور ساخت KASP</p>
                </div>
              </div>

              {/* View switchers & close */}
              <div className="flex items-center gap-3">
                {/* Device switch for visual HTML components */}
                {previewArtifact.output?.previewHtml && previewTab === 'preview' && (
                  <div className="hidden sm:flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded-lg transition ${previewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="نمایش دسکتاپ"
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('tablet')}
                      className={`p-1.5 rounded-lg transition ${previewDevice === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="نمایش تبلت"
                    >
                      <Tablet className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded-lg transition ${previewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="نمایش موبایل"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Code vs Preview tabs */}
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setPreviewTab('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${previewTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    پیش‌نمایش
                  </button>
                  <button
                    onClick={() => setPreviewTab('code')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${previewTab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    کد و محتوا
                  </button>
                </div>

                <button
                  onClick={() => setPreviewArtifact(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
              {previewTab === 'preview' ? (
                previewArtifact.output?.previewHtml ? (
                  <div className="flex justify-center h-full">
                    <div className={`transition-all duration-300 bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800 h-[600px] ${
                      previewDevice === 'desktop' ? 'w-full' : previewDevice === 'tablet' ? 'w-[768px]' : 'w-[375px]'
                    }`}>
                      <iframe
                        srcDoc={previewArtifact.output.previewHtml}
                        title={previewArtifact.title}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-slate-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {previewArtifact.output?.content}
                  </div>
                )
              ) : (
                <div className="relative">
                  <button
                    onClick={() => handleCopyCode(previewArtifact.output?.content || '')}
                    className="absolute top-4 left-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'کپی شد' : 'کپی متن/کد'}</span>
                  </button>

                  <pre className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                    {previewArtifact.output?.content}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓ متصل به گراف کسب‌وکار</span>
                <span>•</span>
                <span>تولید شده توسط Google Gemini Flash</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(previewArtifact.output?.content || '')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی محتوا</span>
                </button>
                <button
                  onClick={() => setPreviewArtifact(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition"
                >
                  بستن
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* USER INPUT MODAL */}
      {inputModalArtifact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-black text-white text-base">تنظیم ورودی برای: {inputModalArtifact.title}</h3>
              <button onClick={() => setInputModalArtifact(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              برای شخصی‌سازی بهتر خروجی، اطلاعات زیر را تکمیل فرمایید:
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">نام تجاری یا برند مد نظر:</label>
                <input
                  type="text"
                  placeholder="مثال: فروشگاه نوین واچ"
                  value={userInputs['brandName'] || ''}
                  onChange={e => setUserInputs({ ...userInputs, brandName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">توضیحات و ترجیحات اختصاصی شما:</label>
                <textarea
                  rows={3}
                  placeholder="مثال: روی ارسال رایگان در تهران و پرداخت در محل تاکید شود."
                  value={userInputs['customNotes'] || ''}
                  onChange={e => setUserInputs({ ...userInputs, customNotes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setInputModalArtifact(null)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
              >
                انصراف
              </button>
              <button
                onClick={() => handleExecuteBuild(inputModalArtifact, userInputs)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs transition"
              >
                ذخیره و شروع ساخت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HUMAN APPROVAL MODAL */}
      {approvalModalArtifact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-purple-400 font-black">
                <ShieldAlert className="w-5 h-5" />
                <span>تایید انسانی قبل از اقدام حساس</span>
              </div>
              <button onClick={() => setApprovalModalArtifact(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-4 bg-purple-950/30 border border-purple-500/20 rounded-2xl text-xs text-purple-200 leading-relaxed">
              <strong>تسک:</strong> {approvalModalArtifact.title}
              <p className="mt-2 text-slate-300">
                این تسک به دلیل اهمیت استراتژیک یا احتمال اتصال به دامنه/پرداخت نیازمند تایید مستقیم شماست.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5 text-xs">یادداشت تایید (اختیاری):</label>
              <textarea
                rows={2}
                placeholder="تایید می‌شود؛ پس از بررسی نهایی لندینگ‌پیج متصل گردد."
                value={approvalNotes}
                onChange={e => setApprovalNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setApprovalModalArtifact(null)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
              >
                انصراف
              </button>
              <button
                onClick={() => handleApproveArtifact(approvalModalArtifact)}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs transition"
              >
                تایید نهایی و مجازسازی تسک
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXECUTION LOGS DRAWER */}
      {showLogsDrawer && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-black text-white text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <span>تاریخچه پایدار اجرای ساخت (Persistent Execution Logs)</span>
            </h3>
            <button onClick={() => setShowLogsDrawer(false)} className="text-slate-400 hover:text-white text-xs">✕ بستن</button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {executionLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">هنوز لاگی ثبت نشده است.</p>
            ) : (
              executionLogs.map(log => (
                <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-indigo-300 block">{log.artifactTitle}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded text-[10px] font-mono block">
                      {log.statusTo}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {new Date(log.timestamp).toLocaleTimeString('fa-IR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
