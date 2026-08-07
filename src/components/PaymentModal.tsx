import React, { useState, useEffect } from 'react';
import { X, CreditCard, Copy, Check, Upload, ShieldCheck, Clock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  amount: string;
  lang?: 'fa' | 'en';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  amount,
  lang = 'fa',
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [senderName, setSenderName] = useState('');
  const [receiptNote, setReceiptNote] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gateway'>('card');
  
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      apiFetch('/api/payments/settings')
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setPaymentSettings(data);
            if (data.isOnlineGatewayActive) {
               setPaymentMethod('gateway');
            } else {
               setPaymentMethod('card');
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cardDetails = paymentSettings ? {
    bankName: paymentSettings.bankName || 'بانک',
    cardNumber: paymentSettings.cardNumber || '',
    accountHolder: paymentSettings.accountHolder || '',
    iban: paymentSettings.iban || '',
  } : {
    bankName: 'بانک ملی ایران',
    cardNumber: '6037-9919-8822-4411',
    accountHolder: 'توسعه هوش مصنوعی کاسپ (KASP)',
    iban: 'IR890170000000123456789001',
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text.replace(/-/g, ''));
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim() && !receiptFile) {
      alert('لطفاً کد پیگیری یا تصویر فیش واریزی را وارد کنید.');
      return;
    }
    
    let receiptBase64 = '';
    if (receiptFile) {
      receiptBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(receiptFile);
      });
    }

    try {
      const res = await apiFetch('/api/payments/submit-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingCode,
          senderName,
          amount: Number(amount.replace(/[^0-9]/g, '')),
          note: receiptNote,
          receiptImage: receiptBase64
        })
      });
      if (res.ok) {
        setIsSubmitted(true);
      } else {
        alert('خطایی در ثبت رسید رخ داد. لطفا دوباره تلاش کنید.');
      }
    } catch(err) {
      console.error(err);
      alert('خطایی رخ داد.');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn dir-rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                پرداخت و ثبت سفارش
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                {itemTitle}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Badge */}
        <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">مبلغ قابل پرداخت:</span>
          <span className="text-xl font-black text-purple-700 dark:text-purple-300">{amount}</span>
        </div>

        {/* Payment Method Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              paymentMethod === 'card'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>کارت به کارت / شبا (فعال)</span>
          </button>

          <button
            onClick={() => setPaymentMethod('gateway')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              paymentMethod === 'gateway'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>درگاه مستقیم (غیرفعال)</span>
          </button>
        </div>

        {paymentMethod === 'gateway' ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-amber-400/50 dark:border-amber-500/30 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="font-bold text-slate-800 dark:text-amber-300 text-sm">درگاه پرداخت آنلاین موقتاً غیرفعال است</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              درگاه پرداخت آنلاین شاپرک به زودی فعال خواهد شد. در حال حاضر می‌توانید از طریق واریز به شماره کارت بانکی یا شبا سفارش خود را نهایی کنید.
            </p>
            <button
              onClick={() => setPaymentMethod('card')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <span>انتقال به کارت به کارت</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        ) : isSubmitted ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-black text-emerald-600 dark:text-emerald-400 text-lg mb-1">رسید واریزی شما با موفقیت ثبت شد</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                اطلاعات پرداخت برای کارشناسان مالی KASP ارسال گردید. پس از تایید (کمتر از ۱ ساعت)، اشتراک/پروژه شما فعال شده و اطلاع‌رسانی پیامکی ارسال خواهد شد.
              </p>
            </div>
            {trackingCode && (
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl inline-block border border-emerald-500/30">
                <span className="text-xs text-slate-500 block">کد پیگیری ثبت شده:</span>
                <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{trackingCode}</span>
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Card Information Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>{cardDetails.bankName}</span>
                <span className="text-purple-400 font-bold">KASP AI Financial</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">شماره کارت بانکی (کارت به کارت)</span>
                <div className="flex items-center justify-between bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800 font-mono text-base tracking-widest text-emerald-400 dir-ltr">
                  <span>{cardDetails.cardNumber}</span>
                  <button
                    onClick={() => handleCopy(cardDetails.cardNumber, 'card')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[11px] font-sans"
                    title="کپی شماره کارت"
                  >
                    {copiedField === 'card' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'card' ? 'کپی شد' : 'کپی'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">نام صاحب حساب</span>
                  <span className="text-xs font-bold text-slate-200">{cardDetails.accountHolder}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">شماره شبا (IBAN)</span>
                  <div className="flex items-center justify-between bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px] text-purple-300 dir-ltr">
                    <span className="truncate">{cardDetails.iban}</span>
                    <button
                      onClick={() => handleCopy(cardDetails.iban, 'iban')}
                      className="text-slate-400 hover:text-white mr-1"
                      title="کپی شبا"
                    >
                      {copiedField === 'iban' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Receipt Form */}
            <form onSubmit={handleSubmitReceipt} className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>ثبت اطلاعات فیش واریزی</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    کد پیگیری / ارجاع *
                  </label>
                  <input
                    type="text"
                    required
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="مثلاً: 123456789"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام واریز کننده (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="نام صاحب حساب فرستنده"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تصویر فیش واریزی (اختیاری)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-purple-500" />
                    <span>انتخاب فایل عکس</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  {receiptFile && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[200px]">
                      ✓ {receiptFile.name}
                    </span>
                  )}
                </div>
              </div>

              {receiptPreview && (
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-purple-500/30">
                  <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ثبت فیش و نهایی‌سازی سفارش</span>
              </button>

            </form>

          </div>
        )}

      </div>
    </div>
  );
};
