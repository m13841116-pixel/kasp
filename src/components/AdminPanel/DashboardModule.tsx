import React from 'react';
import { 
  DollarSign, 
  Bot, 
  Users, 
  Code, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { AIAgent, Freelancer, AppRequest } from '../../types';

interface DashboardModuleProps {
  agents: AIAgent[];
  freelancers: Freelancer[];
  requests: AppRequest[];
  lang: 'fa' | 'en';
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  agents = [],
  freelancers = [],
  requests = [],
  lang,
}) => {
  const safeAgents = Array.isArray(agents) ? agents : [];
  const safeFreelancers = Array.isArray(freelancers) ? freelancers : [];
  const safeRequests = Array.isArray(requests) ? requests : [];

  const totalSubscribers = safeAgents.reduce((sum, a) => sum + (a.subscribers || 0), 0);
  const activeAgentsCount = safeAgents.filter(a => a.status === 'Active').length;
  const totalFreelancersCount = safeFreelancers.length;
  const pendingRequestsCount = safeRequests.filter(r => r.status === 'Pending' || r.status === 'Analyzed').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {lang === 'fa' ? 'داشبورد مدیریتی Kasp.ir' : 'Kasp.ir Admin Overview'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {lang === 'fa' ? 'آمار کل پلتفرم، ایجنت‌های متصل به ساب‌دومین‌ها و درخواست‌های سفارشی' : 'Real-time performance metrics and application management.'}
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'fa' ? 'درآمد کل ماهانه' : 'Monthly Revenue'}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            0 <span className="text-xs font-normal text-slate-400">تومان</span>
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>0% {lang === 'fa' ? 'ثبت درآمدهای جدید' : 'new revenue logged'}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'fa' ? 'ایجنت‌های فعال' : 'Active AI Agents'}</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {activeAgentsCount} / {safeAgents.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            {totalSubscribers} {lang === 'fa' ? 'مشترک فعال روی ساب‌دومین‌ها' : 'subscribers across subdomains'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'fa' ? 'مشتریان فعال' : 'Active Customers'}</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {safeRequests.filter(r => r.status === 'InProgress').length} <span className="text-xs font-normal text-slate-400">{lang === 'fa' ? 'پروژه' : 'projects'}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            {safeRequests.filter(r => r.status === 'InProgress').length} {lang === 'fa' ? 'پروژه در حال توسعه' : 'projects under development'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'fa' ? 'سفارشات سفارشی' : 'Custom App Orders'}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Code className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {safeRequests.length} <span className="text-xs font-normal text-slate-400">{lang === 'fa' ? 'درخواست' : 'requests'}</span>
          </p>
          <p className="text-[11px] text-amber-500 font-semibold mt-2">
            {pendingRequestsCount} {lang === 'fa' ? 'در انتظار بررسی اولیه' : 'pending AI analysis'}
          </p>
        </div>

      </div>

      {/* Custom App Request Queue Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          <span>{lang === 'fa' ? 'درخواست‌های سفارشی اخیر' : 'Recent Custom App Requests'}</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase font-mono border-b border-slate-200/60 dark:border-slate-800">
              <tr>
                <th className="p-3 text-right">{lang === 'fa' ? 'نام کاربر' : 'User Name'}</th>
                <th className="p-3 text-right">{lang === 'fa' ? 'اطلاعات تماس' : 'Contact Info'}</th>
                <th className="p-3 text-right">{lang === 'fa' ? 'شرح ایده' : 'Idea Description'}</th>
                <th className="p-3 text-right">{lang === 'fa' ? 'امکانات' : 'Features'}</th>
                <th className="p-3 text-right">{lang === 'fa' ? 'وضعیت' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {safeRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white text-right">{req.userName}</td>
                  <td className="p-3 font-mono text-[11px] text-blue-400 text-right">{req.contactInfo}</td>
                  <td className="p-3 max-w-xs truncate text-right">{req.idea}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20 text-[10px]">
                      {req.aiAnalysis?.recommendedStack?.length || 0} مورد
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
