
import React, { useState } from 'react';
import { Lock, Loader2, AlertCircle, KeyRound, Sparkles, User, Mail, UserPlus, LogIn } from 'lucide-react';
import { KaspLogo } from './KaspLogo';
import { apiFetch } from '../utils/api';

interface AuthFormProps {
  initialMode?: 'login' | 'signup';
  onLoginSuccess: (role: 'admin' | 'customer') => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login', onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    setMode(initialMode);
    setErrorMessage('');
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = mode === 'login' 
        ? { email: username, password }
        : { name, email: username, password };

      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        if (data.csrfToken) {
          localStorage.setItem('csrf_token', data.csrfToken);
        }
        onLoginSuccess(data.role);
      } else {
        setErrorMessage(data.error || (mode === 'login' ? 'رمز عبور یا نام کاربری اشتباه است.' : 'خطا در ثبت نام'));
      }
    } catch (err) {
      setErrorMessage('ارتباط با سرور برقرار نشد.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setErrorMessage('');
    setPassword('');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-2xl space-y-6 relative overflow-hidden">
        
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-3 relative z-10">
          <div className="flex justify-center mb-4">
            <KaspLogo size="md" showTagline={false} />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {mode === 'login' ? 'ورود به سیستم' : 'ایجاد حساب کاربری'}
              </span>
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {mode === 'login' 
                ? 'جهت دسترسی به داشبورد، اطلاعات کاربری خود را وارد کنید.'
                : 'برای ثبت سفارش و پیگیری پروژه‌ها ثبت‌نام کنید.'}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>نام و نام خانوادگی</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: علی رضایی"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors text-right"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>شماره موبایل یا ایمیل</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: 09123456789"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors dir-ltr text-left"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>رمز عبور</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors dir-ltr text-left"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password || (mode === 'signup' && !name)}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-l from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-5 h-5" />
                <span>ورود به پنل</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>ثبت‌نام در سیستم</span>
              </>
            )}
          </button>
        </form>

        <div className="relative z-10 text-center pt-2">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            {mode === 'login' ? 'حساب کاربری ندارید؟ ثبت‌نام کنید' : 'قبلاً ثبت‌نام کرده‌اید؟ وارد شوید'}
          </button>
        </div>
      </div>
    </div>
  );
};
