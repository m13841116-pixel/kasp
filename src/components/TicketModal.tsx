import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, LifeBuoy, MessageSquare, ShieldCheck } from 'lucide-react';
import { UserTicket } from '../types';
import { apiFetch } from '../utils/api';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose }) => {
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'General' | 'Order' | 'Technical' | 'Custom App'>('Custom App');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<UserTicket | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userContact || !subject || !message) {
      setErrorMsg('لطفاً تمامی فیلدهای فرم تیکت را پر کنید.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await apiFetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          userContact,
          subject,
          category,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        setCreatedTicket(data);
      } else {
        setErrorMsg(data.error || 'خطا در ثبت تیکت پشتیبانی.');
      }
    } catch {
      setErrorMsg('خطای ارتباط با سرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setUserName('');
    setUserContact('');
    setSubject('');
    setMessage('');
    setCreatedTicket(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                ارسال تیکت پشتیبانی و مشاوره پروژه
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                ارتباط مستقیم با دپارتمان فنی و کارشناسان کاسپ
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {createdTicket ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                تیکت شما با موفقیت ثبت شد
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <p>کد پیگیری تیکت: <strong className="text-purple-600 dark:text-purple-400 text-sm">{createdTicket.id}</strong></p>
                <p>موضوع: {createdTicket.subject}</p>
                <p>وضعیت: <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">در حال بررسی</span></p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                پاسخ تیکت از طریق تماس یا پیام تلگرام در سریع‌ترین زمان ممکن به شما اطلاع‌رسانی خواهد شد.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                >
                  بستن پنجره
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                    نام و نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="مثال: محمد امینی"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                    اطلاعات تماس (تلفن / تلگرام) *
                  </label>
                  <input
                    type="text"
                    required
                    value={userContact}
                    onChange={(e) => setUserContact(e.target.value)}
                    placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹ یا amini@"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                    موضوع تیکت *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="مثال: سوال درباره زمان تحویل اپلیکیشن"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                    دسته‌بندی درخواست
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="Custom App">سفارش اپ اختصاصی</option>
                    <option value="Technical">پشتیبانی فنی ایجنت‌ها</option>
                    <option value="Order">استعلام برآورد هزینه</option>
                    <option value="General">مشاوره عمومی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                  متن پیام و جزئیات تیکت *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="لطفاً پیام خود یا سوالات مربوط به پروژه را به تفضیل شرح دهید..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <a
                  href="https://t.me/kasp0000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>یا پیام مستقیم در تلگرام</span>
                </a>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'در حال ارسال...' : 'ثبت تیکت پشتیبانی'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
