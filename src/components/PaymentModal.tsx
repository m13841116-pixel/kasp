import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Sparkles, ArrowLeft, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  amount: string;
  lang?: 'fa' | 'en';
  orderId?: string;
  productCode?: string;
  productType?: string;
  onPaymentSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  amount,
  orderId,
  productCode = 'kasp-business-report',
}) => {
  const [isRedirectingToZibal, setIsRedirectingToZibal] = useState(false);
  const [gatewayError, setGatewayError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleZibalPay = async () => {
    setIsRedirectingToZibal(true);
    setGatewayError(null);
    try {
      const res = await apiFetch('/api/payments/zibal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId || undefined,
          productCode: productCode || 'kasp-business-report'
        })
      });
      const data = await res.json();
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        // Friendly, sanitized message without sensitive raw errors
        setGatewayError('در حال حاضر اتصال به درگاه پرداخت با مشکل مواجه شده است. لطفاً چند دقیقه دیگر دوباره تلاش کنید.');
        setIsRedirectingToZibal(false);
      }
    } catch (err: any) {
      // Non-sensitive error message
      setGatewayError('در حال حاضر اتصال به درگاه پرداخت با مشکل مواجه شده است. لطفاً چند دقیقه دیگر دوباره تلاش کنید.');
      setIsRedirectingToZibal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn dir-rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 space-y-5 relative shadow-2xl overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                پرداخت آنلاین با زیبال
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                درگاه امن شاپرک بانکی
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            disabled={isRedirectingToZibal}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Details Card */}
        <div className="bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">سفارش:</span>
            <span className="text-xs font-black text-slate-900 dark:text-white">{itemTitle || 'گزارش کامل هوش تجاری KASP'}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">مبلغ قابل پرداخت:</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{amount || '۴۹۰,۰۰۰ تومان'}</span>
          </div>
        </div>

        {/* Included Deliverables */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 block">دسترسی‌های فعال‌شده پس از پرداخت:</span>
          <div className="grid grid-cols-1 gap-1.5 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>گزارش کامل ۱۵ بخشی هوش تجاری با تحلیل عمیق بازار</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>تحلیل رقبا، ضعف‌های بازار و استراتژی قیمت‌گذاری سودآور</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>برنامه عملیاتی و زمان‌بندی ۳۰ روزه با شاخص‌های کمی</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>توصیه مستقیم «اگر من جای شما بودم...» مدیر KASP</span>
            </div>
          </div>
        </div>

        {/* Error Alert if any */}
        {gatewayError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="leading-relaxed">{gatewayError}</span>
          </div>
        )}

        {/* Gateway Guarantee Banner */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>اتصال مستقیم به شبکه پرداخت شاپرک</span>
          </div>
          <span className="font-bold text-slate-600 dark:text-slate-300">روش پرداخت: Zibal</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleZibalPay}
          disabled={isRedirectingToZibal}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isRedirectingToZibal ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>در حال انتقال به درگاه پرداخت...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>پرداخت امن با زیبال</span>
              <ArrowLeft className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};
