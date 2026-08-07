import React, { useState } from 'react';
import { Send, X, MessageSquare, Phone, CheckCircle2, Sparkles, Copy, ExternalLink } from 'lucide-react';
import { Freelancer } from '../types';

interface ProposalModalProps {
  freelancer: Freelancer | null;
  onClose: () => void;
  lang: 'fa' | 'en';
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
  freelancer,
  onClose,
  lang,
}) => {
  if (!freelancer) return null;

  const [projectTitle, setProjectTitle] = useState('Kasp Custom AI Micro-App');
  const [proposedBudget, setProposedBudget] = useState('5,000,000 Tomans');
  const [projectDeadline, setProjectDeadline] = useState('7 Days');
  const [messageText, setMessageText] = useState(
    `سلام ${freelancer.fullName} عزیز،\nپیشنهاد همکاری در پروژه "${projectTitle}" با بودجه ${proposedBudget} و مهلت تحویل ${projectDeadline} از طرف تیم Kasp.ir برای شما ارسال شده است.\nلطفاً در صورت تمایل جهت بررسی پروپوزال و شروع پروژه پاسخ دهید.`
  );

  const [copied, setCopied] = useState(false);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = freelancer.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(messageText);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6 relative shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {lang === 'fa' ? `ارسال پروپوزال به ${freelancer.fullName}` : `Send Proposal to ${freelancer.fullName}`}
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-300 font-mono">
                {freelancer.primarySkill} • {freelancer.phone}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-300 mb-1">عنوان پروژه (Project Title)</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-300 mb-1">بودجه پیشنهادی</label>
              <input
                type="text"
                value={proposedBudget}
                onChange={(e) => setProposedBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-300 mb-1">مهلت تحویل</label>
              <input
                type="text"
                value={projectDeadline}
                onChange={(e) => setProjectDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-purple-600 dark:text-purple-300 font-bold focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-300 mb-1">متن پیام / پروپوزال</label>
            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none font-sans"
            />
          </div>

        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          
          <button
            onClick={handleCopyMessage}
            className="w-full sm:w-1/2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'کپی شد!' : 'کپی متن پروپوزال'}</span>
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="w-full sm:w-1/2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          >
            <ExternalLink className="w-4 h-4" />
            <span>ارسال مستقیم واتس‌اپ</span>
          </button>

        </div>

      </div>
    </div>
  );
};
