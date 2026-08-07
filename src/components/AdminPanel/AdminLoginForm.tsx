import React, { useState } from 'react';
import { Lock, KeyRound, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface AdminLoginFormProps {
  onLoginSuccess: () => void;
  lang?: 'fa' | 'en';
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        onLoginSuccess();
      } else {
        setErrorMessage(data.error || 'رمز عبور وارد شده نادرست است.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Background Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon & Title */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-purple-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">ورود به پنل مدیریت</span>
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              جهت دسترسی به مدیریت ایجنت‌ها، اطلاعات فریلنسرها و درخواست‌ها، رمز عبور مدیریت را وارد کنید.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>رمز عبور مدیریت *</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور مدیر را وارد کنید..."
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors dir-ltr text-left"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.01]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال بررسی رمز عبور...</span>
              </>
            ) : (
              <span>ورود به سیستم</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 space-y-1">
          <p className="text-[11px] text-slate-500">
            احراز هویت سرور Kasp.ir به‌صورت امن انجام می‌شود.
          </p>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-950/50 py-1 px-3 rounded-lg inline-block border border-indigo-200/50 dark:border-indigo-800/50">
            رمز پیش‌فرض مدیر: <code className="font-bold">admin123</code>
          </p>
        </div>

      </div>
    </div>
  );
};
