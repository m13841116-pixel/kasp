import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Check, Clock, User, Calendar, Copy, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface DiscountCode {
  code: string;
  prize: string;
  discountPercent: number;
  isUsed: number;
  usedBy?: string;
  assignedUserId?: string;
  assignedUser?: { name?: string; email?: string } | null;
  expiresAt?: string;
  createdAt?: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export const ManageDiscountsModule: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [newCode, setNewCode] = useState<string>('');
  const [newPrize, setNewPrize] = useState<string>('');
  const [newPercent, setNewPercent] = useState<number>(20);
  const [targetUserId, setTargetUserId] = useState<string>('ALL');
  const [expiresDays, setExpiresDays] = useState<number>(30);
  const [customExpiresDate, setCustomExpiresDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'public' | 'active' | 'used'>('all');

  const fetchDiscountsAndUsers = async () => {
    setLoading(true);
    try {
      const [discountsData, usersData] = await Promise.all([
        apiFetch<DiscountCode[]>('/api/admin/discount-codes').catch(() => []),
        apiFetch<UserOption[]>('/api/admin/users').catch(() => [])
      ]);
      setDiscounts(discountsData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error fetching discounts or users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountsAndUsers();
  }, []);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'KASP-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(code);
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newPrize.trim()) {
      setErrorMsg('لطفا کد و عنوان تخفیف را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    let expiresAt: string | null = null;
    if (customExpiresDate) {
      expiresAt = new Date(customExpiresDate).toISOString();
    } else if (expiresDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + expiresDays);
      expiresAt = d.toISOString();
    }

    try {
      const res = await apiFetch<{ success: boolean; error?: string }>('/api/admin/discount-codes', {
        method: 'POST',
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          prize: newPrize.trim(),
          discountPercent: Number(newPercent) || 0,
          assignedUserId: targetUserId === 'ALL' ? null : targetUserId,
          expiresAt
        })
      });

      if (res.success) {
        setShowCreateModal(false);
        setNewCode('');
        setNewPrize('');
        setNewPercent(20);
        setTargetUserId('ALL');
        setExpiresDays(30);
        setCustomExpiresDate('');
        fetchDiscountsAndUsers();
      } else {
        setErrorMsg(res.error || 'خطا در ثبت کد تخفیف');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCode = async (code: string) => {
    if (!window.confirm(`آیا از حذف کد تخفیف "${code}" اطمینان دارید؟`)) return;

    try {
      await apiFetch(`/api/admin/discount-codes/${encodeURIComponent(code)}`, {
        method: 'DELETE'
      });
      fetchDiscountsAndUsers();
    } catch (err) {
      alert('خطا در حذف کد تخفیف');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < Date.now();
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'بدون محدودیت';
    try {
      return new Date(isoString).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Filter Logic
  const filteredDiscounts = discounts.filter(item => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prize.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assignedUser?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assignedUser?.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'assigned') return !!item.assignedUserId;
    if (filterStatus === 'public') return !item.assignedUserId;
    if (filterStatus === 'used') return item.isUsed === 1;
    if (filterStatus === 'active') return item.isUsed === 0 && !isExpired(item.expiresAt);

    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white shadow-md shadow-purple-500/20">
              <Tag className="w-6 h-6" />
            </div>
            <span>مدیریت کدهای تخفیف</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ایجاد، تخصیص به کاربران، تعیین تاریخ انقضا و مدیریت کدهای تخفیف صادر شده
          </p>
        </div>

        <button
          onClick={() => {
            generateRandomCode();
            setShowCreateModal(true);
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>صدور کد تخفیف جدید</span>
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-bold">کل کدهای تخفیف:</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{discounts.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-bold">کدهای فعال:</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {discounts.filter(d => d.isUsed === 0 && !isExpired(d.expiresAt)).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-bold">اختصاص داده شده به کاربر:</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {discounts.filter(d => !!d.assignedUserId).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-bold">استفاده شده:</span>
          <p className="text-2xl font-black text-rose-500 dark:text-rose-400 mt-1">
            {discounts.filter(d => d.isUsed === 1).length}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="جستجوی کد، عنوان جایزه، نام یا ایمیل کاربر..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full md:w-80 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-purple-500"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'همه' },
            { id: 'active', label: 'فعال' },
            { id: 'assigned', label: 'اختصاصی کاربر' },
            { id: 'public', label: 'عمومی' },
            { id: 'used', label: 'استفاده شده' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterStatus === f.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discounts List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold">در حال دریافت کدهای تخفیف...</div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold">
            هیچ کد تخفیفی با مشخصات خواسته شده یافت نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">کد تخفیف</th>
                  <th className="p-4">عنوان / درصد</th>
                  <th className="p-4">کاربر دریافت‌کننده</th>
                  <th className="p-4">تاریخ انقضا</th>
                  <th className="p-4">تاریخ صدور</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredDiscounts.map((c, idx) => {
                  const expired = isExpired(c.expiresAt);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-purple-600 dark:text-purple-400 dir-ltr bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                            {c.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(c.code)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            title="کپی کد"
                          >
                            {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{c.prize}</p>
                          {c.discountPercent > 0 && (
                            <span className="inline-block mt-0.5 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                              {c.discountPercent}٪ تخفیف
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        {c.assignedUser ? (
                          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <div>
                              <p className="text-xs">{c.assignedUser.name || 'کاربر'}</p>
                              <p className="text-[10px] text-slate-400 font-mono dir-ltr">{c.assignedUser.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                            🌐 عمومی (همه کاربران)
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className={expired ? 'text-rose-500 font-bold line-through' : 'font-bold'}>
                            {formatDate(c.expiresAt)}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-500 text-[11px]">
                        {formatDate(c.createdAt)}
                      </td>

                      <td className="p-4">
                        {c.isUsed === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-extrabold border border-rose-500/20">
                            <Check className="w-3.5 h-3.5" /> استفاده شده {c.usedBy ? `(${c.usedBy})` : ''}
                          </span>
                        ) : expired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" /> منقضی شده
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold border border-emerald-500/20">
                            <Sparkles className="w-3.5 h-3.5" /> فعال و معتبر
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteCode(c.code)}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                          title="حذف کد تخفیف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <span>صدور کد تخفیف جدید</span>
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCode} className="space-y-4">
              {/* Code string with random generator */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  کد تخفیف (لاتین):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: KASP-WELCOME20"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3.5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 shrink-0"
                    title="تولید کد تصادفی"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تصادفی</span>
                  </button>
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  عنوان / توضیح تخفیف:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: ۵۰٪ تخفیف ویژه ساخت اپلیکیشن"
                  value={newPrize}
                  onChange={e => setNewPrize(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Percentage */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  درصد تخفیف (۰ تا ۱۰۰٪):
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newPercent}
                  onChange={e => setNewPercent(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Assignee / User */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  تخصیص به کاربر خاص:
                </label>
                <select
                  value={targetUserId}
                  onChange={e => setTargetUserId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">🌐 همه کاربران (عمومی)</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      👤 {u.name || 'کاربر بدون نام'} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Expiration Options */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  مهلت زمان استفاده (تاریخ انقضا):
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    { days: 7, label: '۷ روز' },
                    { days: 30, label: '۳۰ روز' },
                    { days: 90, label: '۹۰ روز' },
                    { days: 0, label: 'نامحدود' }
                  ].map(opt => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => {
                        setExpiresDays(opt.days);
                        setCustomExpiresDate('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        expiresDays === opt.days && !customExpiresDate
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <input
                  type="date"
                  value={customExpiresDate}
                  onChange={e => {
                    setCustomExpiresDate(e.target.value);
                    setExpiresDays(0);
                  }}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/20"
                >
                  {isSubmitting ? 'در حال صدور...' : 'تایید و صدور کد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
