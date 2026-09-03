import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Search, Clock, FileImage, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export const PaymentReceiptsModule: React.FC = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = () => {
    apiFetch('/api/admin/payment-receipts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReceipts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await apiFetch(`/api/admin/payment-receipts/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchReceipts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn dir-rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            مدیریت رسیدهای پرداخت
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">بررسی، تایید یا رد فیش‌های واریزی کاربران</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">در حال بارگذاری...</div>
        ) : receipts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 mb-3 text-slate-400 dark:text-slate-600" />
            هیچ رسیدی ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-slate-700 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-4 rounded-tr-xl">مشتری</th>
                  <th className="px-4 py-4">کد پیگیری / نام واریزکننده</th>
                  <th className="px-4 py-4">مبلغ (تومان)</th>
                  <th className="px-4 py-4">تاریخ</th>
                  <th className="px-4 py-4">وضعیت</th>
                  <th className="px-4 py-4">فیش تصویر</th>
                  <th className="px-4 py-4 rounded-tl-xl text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                {receipts.map(receipt => (
                  <tr key={receipt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">{receipt.customerName || 'مهمان'}</td>
                    <td className="px-4 py-4">
                      <div className="text-emerald-600 dark:text-emerald-400 font-mono">{receipt.trackingCode}</div>
                      {receipt.senderName && <div className="text-xs text-slate-500 mt-1">{receipt.senderName}</div>}
                    </td>
                    <td className="px-4 py-4 font-mono">{receipt.amount.toLocaleString('fa-IR')}</td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400 dir-ltr text-right">
                      {new Date(receipt.createdAt).toLocaleString('fa-IR')}
                    </td>
                    <td className="px-4 py-4">
                      {receipt.status === 'pending' ? (
                        <span className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full text-xs flex items-center gap-1 w-max">
                          <Clock className="w-3 h-3" /> در انتظار تایید
                        </span>
                      ) : receipt.status === 'confirmed' ? (
                        <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs flex items-center gap-1 w-max">
                          <CheckCircle className="w-3 h-3" /> تایید شده
                        </span>
                      ) : (
                        <span className="bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full text-xs flex items-center gap-1 w-max">
                          <XCircle className="w-3 h-3" /> رد شده
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {receipt.receiptImage ? (
                        <a href={receipt.receiptImage} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-xs">
                          <FileImage className="w-4 h-4" /> مشاهده
                        </a>
                      ) : <span className="text-slate-500 text-xs">ندارد</span>}
                    </td>
                    <td className="px-4 py-4">
                      {receipt.status === 'pending' && (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(receipt.id, 'confirmed')}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                            title="تایید رسید"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(receipt.id, 'rejected')}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                            title="رد رسید"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
