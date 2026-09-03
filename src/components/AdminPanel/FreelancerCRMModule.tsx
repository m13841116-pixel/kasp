import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Send, 
  Phone, 
  Star, 
  Briefcase, 
  DollarSign, 
  Filter, 
  Grid, 
  List, 
  Trash2, 
  Pencil, 
  CheckCircle2, 
  X, 
  FileText, 
  MessageSquare, 
  Sparkles 
} from 'lucide-react';
import { Freelancer } from '../../types';

interface FreelancerCRMModuleProps {
  freelancers: Freelancer[];
  onAddFreelancer: (freelancer: Omit<Freelancer, 'id' | 'completedProjects' | 'rating'>) => void;
  onDeleteFreelancer: (id: string) => void;
  onOpenProposalModal: (freelancer: Freelancer) => void;
  lang: 'fa' | 'en';
}

export const FreelancerCRMModule: React.FC<FreelancerCRMModuleProps> = ({
  freelancers,
  onAddFreelancer,
  onDeleteFreelancer,
  onOpenProposalModal,
  lang,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('All');

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [primarySkill, setPrimarySkill] = useState<Freelancer['primarySkill']>('Full-Stack');
  const [rate, setRate] = useState('180,000 Tomans/hr');
  const [experience, setExperience] = useState<Freelancer['experience']>('Senior');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Freelancer['status']>('Available');

  const skillsList = ['All', 'Frontend', 'Backend', 'WordPress', 'AI & ML', 'UI/UX', 'Full-Stack', 'Mobile', 'DevOps'];

  const filteredFreelancers = freelancers.filter(f => {
    const matchesSearch = 
      f.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.phone.includes(searchTerm) ||
      f.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSkill = selectedSkillFilter === 'All' || f.primarySkill === selectedSkillFilter;

    return matchesSearch && matchesSkill;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    onAddFreelancer({
      fullName,
      phone,
      primarySkill,
      rate,
      rateNum: parseInt(rate.replace(/[^0-9]/g, '')) || 150000,
      notes,
      experience,
      status,
      email: `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`
    });

    setIsFormOpen(false);
    // Reset
    setFullName('');
    setPhone('');
    setNotes('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Module Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-8 h-8 text-blue-500" />
            <span>{lang === 'fa' ? 'سی‌آرام مدیریت متخصصین فری‌لنسر (Freelancer CRM)' : 'Freelancer CRM'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'fa'
              ? 'دیتابیس داخلی ثبت و دسته‌بندی برنامه‌نویسان (Full-Stack, UI/UX, WordPress, AI) جهت ارسال پروپوزال پروژه'
              : 'Internal database of vetted developer specialists for custom project assignments.'}
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 hover:scale-105 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>{lang === 'fa' ? 'افزودن متخصص جدید (Add Specialist)' : 'Add Specialist'}</span>
        </button>
      </div>

      {/* Search Bar & Skill Filter & View Toggle */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="w-full md:w-80 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'fa' ? 'جستجوی نام، تلفن یا مهارتهای متخصص...' : 'Search specialist name, phone, notes...'}
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none placeholder-slate-500"
          />
        </div>

        {/* Skill Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {skillsList.map((sk) => (
            <button
              key={sk}
              onClick={() => setSelectedSkillFilter(sk)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSkillFilter === sk
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sk}
            </button>
          ))}
        </div>

        {/* View Switcher (Grid vs Table) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg text-xs transition-colors ${viewMode === 'table' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* DISPLAY MODE 1: GRID OF FREELANCER PROFILE CARDS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.map((free) => (
            <div 
              key={free.id} 
              className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
            >
              
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                      {free.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-purple-400 transition-colors">
                        {free.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        <span>{free.phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    free.status === 'Available'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {free.status}
                  </span>
                </div>

                {/* Primary Skill & Experience Pills */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-3 py-1 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold text-xs border border-purple-500/20">
                    {free.primarySkill}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                    {free.experience}
                  </span>
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1 ml-auto">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{free.rating}</span>
                  </span>
                </div>

                {/* Rate */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">{lang === 'fa' ? 'نرخ ساعتی / پروژه‌ای:' : 'Hourly / Project Rate:'}</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{free.rate}</span>
                </div>

                {/* Resume Notes */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-100/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  "{free.notes}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
                
                {/* Send Message / Proposal Button */}
                <button
                  onClick={() => onOpenProposalModal(free)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'fa' ? 'ارسال پروپوزال / واتس‌اپ' : 'Send Message / Proposal'}</span>
                </button>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteFreelancer(free.id)}
                  className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors shrink-0"
                  title="Remove Specialist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* DISPLAY MODE 2: DETAILED TABLE */}
      {viewMode === 'table' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase font-mono border-b border-slate-200/60 dark:border-slate-800">
                <tr>
                  <th className="p-4">{lang === 'fa' ? 'نام متخصص' : 'Specialist Name'}</th>
                  <th className="p-4">{lang === 'fa' ? 'تلفن تماس' : 'Phone'}</th>
                  <th className="p-4">{lang === 'fa' ? 'تخصص اصلی' : 'Primary Skill'}</th>
                  <th className="p-4">{lang === 'fa' ? 'نرخ' : 'Rate'}</th>
                  <th className="p-4">{lang === 'fa' ? 'خلاصه سوابق' : 'Notes/Resume'}</th>
                  <th className="p-4">{lang === 'fa' ? 'وضعیت' : 'Status'}</th>
                  <th className="p-4 text-right">{lang === 'fa' ? 'عملیات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredFreelancers.map((free) => (
                  <tr key={free.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{free.fullName}</td>
                    <td className="p-4 font-mono text-blue-400">{free.phone}</td>
                    <td className="p-4 font-semibold text-purple-400">{free.primarySkill}</td>
                    <td className="p-4 font-extrabold text-emerald-400">{free.rate}</td>
                    <td className="p-4 max-w-xs truncate">{free.notes}</td>
                    <td className="p-4 font-bold">{free.status}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => onOpenProposalModal(free)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>ارسال پروپوزال</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Specialist Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-700 space-y-6 relative shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>{lang === 'fa' ? 'افزودن متخصص جدید (Add Specialist)' : 'Add Specialist'}</span>
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              
              {/* Full Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">{lang === 'fa' ? 'نام و نام خانوادگی' : 'Full Name'} *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: مریم کریمی"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">{lang === 'fa' ? 'شماره تماس' : 'Phone Number'} *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Skill & Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{lang === 'fa' ? 'تخصص اصلی' : 'Primary Skill'}</label>
                  <select
                    value={primarySkill}
                    onChange={(e) => setPrimarySkill(e.target.value as Freelancer['primarySkill'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="WordPress">WordPress</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="Full-Stack">Full-Stack</option>
                    <option value="Mobile">Mobile</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{lang === 'fa' ? 'نرخ ساعتی/پروژه‌ای' : 'Hourly/Project Rate'}</label>
                  <input
                    type="text"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="180,000 Tomans/hr"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-emerald-400 font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Resume/Notes Textarea */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">{lang === 'fa' ? 'خلاصه رزومه و یادداشت‌ها' : 'Resume / Notes'}</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="تخصص در React، پايپ‌لاين‌های AI، نمونه‌کارهای قبلی..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg shadow-purple-500/20"
                >
                  افزودن متخصص
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
