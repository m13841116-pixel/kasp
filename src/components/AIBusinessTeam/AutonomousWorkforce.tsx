import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Play, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  FileText, 
  Zap, 
  RefreshCw, 
  Send, 
  Lock, 
  HelpCircle,
  Award,
  BarChart3,
  Lightbulb,
  Radio,
  ChevronRight,
  Flame,
  Maximize2,
  X
} from 'lucide-react';
import { 
  AutonomousExecutionState, 
  ExecutionTask, 
  ApprovalRequest, 
  BusinessLearningEntry, 
  WorkforceAgentRole,
  TaskExecutionStatus
} from '../../server/brain/types';
import { apiFetch } from '../../utils/api';

interface AutonomousWorkforceProps {
  projectId: string;
  businessGoal?: string;
  onBackToAnalysis?: () => void;
  onRequireLogin?: () => void;
}

export const AutonomousWorkforce: React.FC<AutonomousWorkforceProps> = ({
  projectId,
  businessGoal,
  onBackToAnalysis,
  onRequireLogin
}) => {
  const [state, setState] = useState<AutonomousExecutionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [isExecutingNext, setIsExecutingNext] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'deliverables' | 'approvals' | 'metrics' | 'learning'>('queue');
  
  // Deliverable Inspector Modal
  const [inspectingTask, setInspectingTask] = useState<ExecutionTask | null>(null);
  const [previewTab, setPreviewTab] = useState<'rendered' | 'code' | 'details'>('rendered');
  const [copiedText, setCopiedText] = useState(false);

  // Approval Modal / Processing
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});

  const fetchExecutionState = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch(`/api/brain/execution/${projectId}`);
      const data = await res.json();
      if (res.ok && data.success && data.state) {
        setState(data.state);
      } else {
        // Try initialize if not yet exists
        const initRes = await apiFetch('/api/brain/execution/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, goal: businessGoal })
        });
        const initData = await initRes.json();
        if (initRes.ok && initData.success && initData.state) {
          setState(initData.state);
        } else {
          setError(initData.error || 'خطا در بارگذاری لایه اجرایی خودکار');
        }
      }
    } catch (err: any) {
      setError('خطا در برقراری ارتباط با سرور KASP. لطفاً مجدداً تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchExecutionState();
    }
  }, [projectId]);

  // Execute Next Highest-Value Task (Manager Auto Decision)
  const handleExecuteNext = async () => {
    try {
      setIsExecutingNext(true);
      setError(null);

      const res = await apiFetch('/api/brain/execution/next-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });

      const data = await res.json();
      if (res.status === 401) {
        if (onRequireLogin) onRequireLogin();
        else setError('لطفاً برای ادامه عملیات وارد حساب کاربری خود شوید.');
        return;
      }

      if (res.ok && data.success && data.state) {
        setState(data.state);
        if (data.executedTask) {
          setInspectingTask(data.executedTask);
        }
      } else if (data.requiresApproval) {
        setActiveTab('approvals');
        setError(`اقدام بعدی نیازمند تایید در «مرکز تاییدها» است: ${data.error}`);
      } else {
        setError(data.error || 'خطا در اجرای گام بعدی');
      }
    } catch (err) {
      setError('خطا در اجرای تسک هوشمند');
    } finally {
      setIsExecutingNext(false);
    }
  };

  // Execute specific task directly
  const handleExecuteSpecificTask = async (task: ExecutionTask) => {
    try {
      setExecutingTaskId(task.id);
      setError(null);

      const res = await apiFetch('/api/brain/execution/execute-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, taskId: task.id })
      });

      const data = await res.json();
      if (res.status === 401) {
        if (onRequireLogin) onRequireLogin();
        else setError('لطفاً برای ادامه عملیات وارد حساب کاربری خود شوید.');
        return;
      }

      if (res.ok && data.success && data.state) {
        setState(data.state);
        if (data.executedTask) {
          setInspectingTask(data.executedTask);
        }
      } else {
        setError(data.error || 'خطا در اجرای تسک');
      }
    } catch (err: any) {
      setError('خطا در فرآیند اجرای تسک');
    } finally {
      setExecutingTaskId(null);
    }
  };

  // Approval Center decision
  const handleApprovalDecision = async (approval: ApprovalRequest, decision: 'APPROVE' | 'REJECT') => {
    try {
      setApprovingId(approval.id);
      setError(null);

      const res = await apiFetch('/api/brain/execution/approval/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          approvalId: approval.id,
          decision,
          notes: approvalNotes[approval.id] || ''
        })
      });

      const data = await res.json();
      if (res.status === 401) {
        if (onRequireLogin) onRequireLogin();
        else setError('برای تایید اقدامات احراز هویت الزامی است.');
        return;
      }

      if (res.ok && data.success && data.state) {
        setState(data.state);
      } else {
        setError(data.error || 'خطا در ثبت تصمیم');
      }
    } catch (err) {
      setError('خطا در ارتباط با مرکز تاییدها');
    } finally {
      setApprovingId(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getAgentRoleBadge = (role: WorkforceAgentRole) => {
    switch (role) {
      case 'manager':
        return { label: 'مدیر ارشد عملیات', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'research':
        return { label: 'تحلیل‌گر بازار', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      case 'customer':
        return { label: 'متخصص رفتار خریدار', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'competitor':
        return { label: 'استراتژیست رقابتی', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      case 'marketing':
        return { label: 'مدیر بازاریابی و محتوا', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
      case 'builder':
        return { label: 'مهندس ساخت و نرم‌افزار', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };
      case 'operations':
        return { label: 'سرپرست فروش و قیف', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
      case 'growth':
        return { label: 'هکر رشد و مقیاس‌پذیری', color: 'bg-amber-400/20 text-amber-200 border-amber-400/40' };
      default:
        return { label: 'نیروی کار KASP', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-12 text-center space-y-6 shadow-2xl">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping"></div>
          <div className="w-16 h-16 rounded-full border-4 border-amber-400 border-t-transparent animate-spin flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-100">در حال اتصال به نیروی کار هوشمند KASP...</h3>
          <p className="text-xs text-slate-400">بازیابی پرونده هدف، صف تسک‌ها و اتصال مدیر عملیات</p>
        </div>
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="bg-slate-950 border border-red-500/30 rounded-[2.5rem] p-8 text-center space-y-4 shadow-2xl">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-base font-bold text-red-200">{error}</h3>
        <button
          onClick={fetchExecutionState}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!state) return null;

  const nextRecommendation = state.nextRecommendedTask;
  const pendingApprovalsCount = state.approvals.filter(a => a.status === 'PENDING').length;

  return (
    <div className="space-y-6 font-sans text-right" dir="rtl">
      
      {/* 1. Executive Master Operating Header */}
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 space-y-6">
          
          {/* Top Mission Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-black rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  نیروی کار اجرایی KASP (Autonomous Workforce)
                </span>
                <span className="text-xs text-slate-400">
                  {state.currentState.stage}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
                <span>{state.goal}</span>
              </h2>
            </div>

            {onBackToAnalysis && (
              <button
                onClick={onBackToAnalysis}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition flex items-center gap-1.5 shrink-0"
              >
                <span>بازگشت به سند تحلیل</span>
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>

          {/* Current State vs Target State Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Current State Card */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  وضعیت فعلی (CURRENT STATE)
                </span>
                <span className="px-2.5 py-0.5 bg-slate-800 text-amber-300 text-[10px] font-black rounded-lg border border-slate-700">
                  {state.currentState.maturityLevel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {state.currentState.summary}
              </p>
              {state.currentState.currentBottleneck && (
                <div className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-800/30 p-2.5 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                  <span>گلوگاه فعلی: {state.currentState.currentBottleneck}</span>
                </div>
              )}
            </div>

            {/* Target State Card */}
            <div className="bg-slate-900/70 border border-emerald-900/30 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  وضعیت هدف ۳۰ روزه (TARGET STATE)
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-950/60 text-emerald-300 text-[10px] font-black rounded-lg border border-emerald-800/40">
                  {state.targetState.horizon}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {state.targetState.summary}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300">
                <span className="font-bold text-emerald-400">مایلستون کلیدی:</span>
                <span>{state.targetState.targetMilestone}</span>
              </div>
            </div>

          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl text-center space-y-1">
              <div className="text-[11px] text-slate-400">پیشرفت کلی پروژه</div>
              <div className="text-lg font-black text-amber-400">{state.metrics.overallProgress}٪</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${state.metrics.overallProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl text-center space-y-1">
              <div className="text-[11px] text-slate-400">آمادگی عرضه به بازار</div>
              <div className="text-lg font-black text-emerald-400">{state.metrics.businessReadinessScore}٪</div>
              <div className="text-[10px] text-slate-400">{state.completedTasks.length} از {state.metrics.totalTasksCount} اقدام تکمیل شده</div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl text-center space-y-1">
              <div className="text-[11px] text-slate-400">سرعت عملیاتی نیروی کار</div>
              <div className="text-lg font-black text-indigo-300">{state.metrics.executionVelocity}</div>
              <div className="text-[10px] text-slate-400">بدون اتلاف وقت و اصطکاک</div>
            </div>

            <div 
              onClick={() => setActiveTab('approvals')}
              className={`p-3 rounded-xl text-center space-y-1 cursor-pointer transition border ${
                pendingApprovalsCount > 0 
                  ? 'bg-purple-950/30 border-purple-600/40 hover:bg-purple-900/30' 
                  : 'bg-slate-900/40 border-slate-800/60'
              }`}
            >
              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                <span>تاییدهای معلق</span>
              </div>
              <div className={`text-lg font-black ${pendingApprovalsCount > 0 ? 'text-purple-300 animate-pulse' : 'text-slate-400'}`}>
                {pendingApprovalsCount} اقدام
              </div>
              <div className="text-[10px] text-purple-400 font-bold">مشاهده مرکز تاییدها</div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. The Manager's Continuous Next Highest-Value Task Deck */}
      {nextRecommendation && (
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/40 border-2 border-amber-500/30 rounded-[2rem] p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-full flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                  <Flame className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
                  تصمیم لحظه‌ای مدیر KASP (Next Highest-Value Action)
                </span>

                <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border ${getAgentRoleBadge(nextRecommendation.agentRole).color}`}>
                  مسئول: {getAgentRoleBadge(nextRecommendation.agentRole).label}
                </span>

                <span className="text-xs text-slate-400 font-bold">
                  گام {nextRecommendation.task.stageSequence} از ۱۳
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white">
                {nextRecommendation.task.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400 font-bold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>چرا این اقدام در این لحظه بالاترین ارزش را دارد؟</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {nextRecommendation.why}
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تاثیر و خروجی مورد انتظار</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {nextRecommendation.expectedImpact}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div className="shrink-0 w-full lg:w-auto">
              {nextRecommendation.isApprovalRequired ? (
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="w-full lg:w-auto px-7 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-95"
                >
                  <ShieldAlert className="w-5 h-5 text-purple-200 animate-pulse" />
                  <span>بررسی و تایید در مرکز تاییدها</span>
                </button>
              ) : (
                <button
                  onClick={handleExecuteNext}
                  disabled={isExecutingNext}
                  className="w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isExecutingNext ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>نیروی کار هوشمند در حال اجرا...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
                      <span>اجرای گام بعدی با نیروی کار هوشمند</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 3. Navigation Controls / Operating Views */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-2 flex items-center gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'queue'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>صف و جریان کار (Pipeline)</span>
          <span className="px-2 py-0.5 bg-slate-950/20 rounded-full text-[10px]">
            {state.taskQueue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('deliverables')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'deliverables'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>دارایی‌های تکمیل‌شده (Deliverables)</span>
          <span className="px-2 py-0.5 bg-slate-950/20 rounded-full text-[10px]">
            {state.completedTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'approvals'
              ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-purple-300" />
          <span>مرکز تاییدها (Approval Center)</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-2 py-0.5 bg-purple-400 text-slate-950 font-black rounded-full text-[10px] animate-pulse">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('learning')}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'learning'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>یادگیری و بینش‌ها (Learning)</span>
          <span className="px-2 py-0.5 bg-slate-950/20 rounded-full text-[10px]">
            {state.learning.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 min-w-[130px] py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'metrics'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>سنجه‌ها و رشد (Metrics)</span>
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB: QUEUE & WORKFORCE PIPELINE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {state.taskQueue.map((task, idx) => {
              const roleBadge = getAgentRoleBadge(task.agentRole);
              const isFirst = idx === 0;
              const isExecuting = executingTaskId === task.id;

              return (
                <div 
                  key={task.id}
                  className={`bg-slate-950 border rounded-2xl p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isFirst 
                      ? 'border-amber-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/20 shadow-xl' 
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-amber-400">
                        #{task.stageSequence}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {task.stageName}
                      </span>
                      {task.requiresApproval && (
                        <span className="px-2 py-0.5 bg-purple-500/15 text-purple-300 text-[10px] font-bold rounded-md border border-purple-500/30 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          نیازمند تایید
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-black text-slate-100">
                      {task.title}
                    </h4>

                    <p className="text-xs text-slate-300 line-clamp-2">
                      {task.description}
                    </p>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => handleExecuteSpecificTask(task)}
                      disabled={isExecuting}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 ${
                        isFirst
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isExecuting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>در حال اجرا...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>اجرا توسط {roleBadge.label}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: COMPLETED DELIVERABLES */}
      {activeTab === 'deliverables' && (
        <div className="space-y-4">
          {state.completedTasks.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Layers className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">هنوز دارایی تکمیل‌شده‌ای ثبت نشده است</h4>
              <p className="text-xs text-slate-500">با زدن دکمه «اجرای گام بعدی با نیروی کار هوشمند»، اولین دارایی کسب‌وکار تولید خواهد شد.</p>
              <button
                onClick={handleExecuteNext}
                className="mt-2 px-6 py-2.5 bg-amber-400 text-slate-950 font-black text-xs rounded-xl"
              >
                اجرای اولین اقدام
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.completedTasks.map((task) => (
                <div 
                  key={task.id}
                  className="bg-slate-950 border border-emerald-900/40 hover:border-emerald-500/50 rounded-2xl p-5 space-y-3 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-lg border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        تکمیل و اعتبارسنجی شد
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {task.completedAt ? new Date(task.completedAt).toLocaleTimeString('fa-IR') : ''}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-100">
                      {task.title}
                    </h4>

                    <p className="text-xs text-slate-300 line-clamp-3">
                      {task.output?.summary || task.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-amber-400 font-bold">
                      {task.output?.deliverableType || 'سند اجرایی'}
                    </span>

                    <button
                      onClick={() => setInspectingTask(task)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>مشاهده و کپی خروجی</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: APPROVAL CENTER (CRITICAL FOR EXTERNAL / FINANCIAL ACCESS) */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-purple-950/20 border border-purple-800/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-black text-purple-200">
                مرکز تایید و تصمیم‌گیری بنیان‌گذار (Approval Center)
              </h4>
              <p className="text-xs text-purple-300/80 leading-relaxed">
                سیستم KASP هرگز ادعای غیرواقعی در خصوص انجام اقدامات خارجی (مانند خرج کردن بودجه، انتشار سایت، یا ارسال پیامک) نخواهد کرد. کلیه اقدامات حساس نیازمند تایید شفاف شماست.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {state.approvals.map((approval) => {
              const isPending = approval.status === 'PENDING';
              const isApproved = approval.status === 'APPROVED';
              const isProcessing = approvingId === approval.id;

              return (
                <div 
                  key={approval.id}
                  className={`bg-slate-950 border rounded-2xl p-5 sm:p-6 space-y-4 transition ${
                    isPending 
                      ? 'border-purple-500/40 bg-gradient-to-r from-slate-950 to-purple-950/20 shadow-xl' 
                      : isApproved 
                        ? 'border-emerald-900/40 opacity-90' 
                        : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/50">
                        اقدام پیشنهادی KASP (Action Proposal)
                      </span>
                      <h4 className="text-base font-black text-slate-100">
                        {approval.title}
                      </h4>
                    </div>

                    <div className="shrink-0">
                      {isPending ? (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-lg border border-purple-500/40 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          در انتظار تصمیم بنیان‌گذار
                        </span>
                      ) : isApproved ? (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/40 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تایید و اجرا شد
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg border border-red-500/40">
                          رد شده
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Pillars of Approval (Why, Expected Result, Risk, Cost) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                        علت اقدام (Why):
                      </span>
                      <p className="text-slate-200 leading-relaxed font-medium">
                        {approval.recommendationReason}
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        نتیجه مورد انتظار (Expected Result):
                      </span>
                      <p className="text-slate-200 leading-relaxed font-medium">
                        {approval.expectedResult}
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        ارزیابی ریسک (Risk):
                      </span>
                      <p className="text-slate-200 leading-relaxed font-medium">
                        {approval.riskAssessment}
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                        هزینه تخمینی (Estimated Cost):
                      </span>
                      <p className="text-amber-300 leading-relaxed font-black">
                        {approval.estimatedCost}
                      </p>
                    </div>

                  </div>

                  {approval.executionResult && (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 font-medium">
                      <span className="font-bold">نتیجه اجرا در سامانه: </span>
                      {approval.executionResult}
                    </div>
                  )}

                  {/* Actions for Pending */}
                  {isPending && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={() => handleApprovalDecision(approval, 'APPROVE')}
                        disabled={isProcessing}
                        className="w-full sm:flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>در حال صدور مجوز و اجرای زنده...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-slate-950" />
                            <span>تایید و اجرای مستقیم توسط نیروی کار KASP</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleApprovalDecision(approval, 'REJECT')}
                        disabled={isProcessing}
                        className="w-full sm:w-auto py-3 px-5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-300 text-xs font-bold rounded-xl border border-slate-800 transition"
                      >
                        رد این اقدام
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: LEARNING & STRATEGIC INSIGHTS */}
      {activeTab === 'learning' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {state.learning.map((item) => (
              <div 
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 text-[10px] font-bold rounded-lg border border-amber-500/30">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(item.timestamp).toLocaleDateString('fa-IR')}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-400">فرضیه مورد بررسی:</div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium">
                    {item.hypothesis}
                  </p>
                </div>

                <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-xs font-bold text-emerald-400">یافته و بینش استخراج‌شده:</div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {item.finding}
                  </p>
                </div>

                <div className="text-xs text-amber-300/90 font-bold pt-1">
                  💡 تصمیم استراتژیک حاصل: {item.strategicTakeaway}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: METRICS & VELOCITY */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2 text-center">
              <span className="text-xs text-slate-400 font-bold">هزینه تخمینی جذب هر مشتری (CAC)</span>
              <div className="text-2xl font-black text-amber-400">{state.metrics.estimatedCac}</div>
              <p className="text-[11px] text-slate-500">بهینه‌شده با ریلز و بازاریابی محتوایی</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2 text-center">
              <span className="text-xs text-slate-400 font-bold">ارزش طول عمر مشتری (LTV)</span>
              <div className="text-2xl font-black text-emerald-400">{state.metrics.estimatedLtv}</div>
              <p className="text-[11px] text-slate-500">بر اساس میانگین ۳.۲ خرید مجدد در سال</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2 text-center">
              <span className="text-xs text-slate-400 font-bold">آمادگی چک‌لیست لانچ</span>
              <div className="text-2xl font-black text-indigo-300">{state.metrics.launchChecklistReadiness}٪</div>
              <p className="text-[11px] text-slate-500">تست‌های امنیتی و زیرساختی روز اول</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Deliverable Inspector Modal (View and Copy Live Outputs) */}
      {inspectingTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-lg border border-emerald-500/30">
                    خروجی تکمیل‌شده
                  </span>
                  <span className="text-xs text-slate-400">
                    {inspectingTask.stageName}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {inspectingTask.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(inspectingTask.output?.codeOrHtml || inspectingTask.output?.content || '')}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 transition flex items-center gap-1.5"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>کپی محتوا</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setInspectingTask(null)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs (Rendered vs Code vs Markdown) */}
            {inspectingTask.output?.codeOrHtml && (
              <div className="px-6 pt-3 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => setPreviewTab('rendered')}
                  className={`py-2 px-4 border-b-2 transition ${
                    previewTab === 'rendered'
                      ? 'border-amber-400 text-amber-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  پیش‌نمایش زنده بصری
                </button>
                <button
                  onClick={() => setPreviewTab('code')}
                  className={`py-2 px-4 border-b-2 transition ${
                    previewTab === 'code'
                      ? 'border-amber-400 text-amber-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  کد منبع HTML/CSS
                </button>
                <button
                  onClick={() => setPreviewTab('details')}
                  className={`py-2 px-4 border-b-2 transition ${
                    previewTab === 'details'
                      ? 'border-amber-400 text-amber-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  سند استراتژیک
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {previewTab === 'rendered' && inspectingTask.output?.codeOrHtml ? (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">
                  <div 
                    dangerouslySetInnerHTML={{ __html: inspectingTask.output.codeOrHtml }}
                  />
                </div>
              ) : previewTab === 'code' && inspectingTask.output?.codeOrHtml ? (
                <pre className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto text-left" dir="ltr">
                  {inspectingTask.output.codeOrHtml}
                </pre>
              ) : (
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-line font-medium">
                  {inspectingTask.output?.content || inspectingTask.output?.summary}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                اقدام بعدی: <strong className="text-amber-400">{inspectingTask.output?.actionableNextStep || 'ادامه نقشه راه'}</strong>
              </span>
              <button
                onClick={() => setInspectingTask(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
              >
                بستن
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
