import React, { useState } from 'react';
import { Mail, KeyRound, Loader2, LogIn, UserPlus, AlertCircle, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../utils/api';
import { KaspLogo } from './KaspLogo';

interface AuthFormProps {
  initialMode?: 'login' | 'signup';
  onLoginSuccess: (role: 'admin' | 'customer', user?: { id: string; name: string; email: string; role: string }) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login', onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const payload = mode === 'signup' 
        ? { name: fullName.trim(), email: username.trim(), password }
        : { email: username.trim(), password };

      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        if (data.csrfToken) {
          localStorage.setItem('csrf_token', data.csrfToken);
        }
        if (data.user) {
          localStorage.setItem('cached_user', JSON.stringify(data.user));
        }
        
        setTimeout(() => {
          onLoginSuccess(data.role, data.user);
        }, 300);
      } else {
        setErrorMessage(data.error || 'خطایی در ورود/ثبت‌نام رخ داد.');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('ارتباط با سرور برقرار نشد. لطفاً وضعیت اینترنت خود را بررسی کنید.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg bg-[#0b0f19] p-8 md:p-12 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="text-center space-y-4 relative z-10 mb-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="flex justify-center mb-4"
          >
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-xl">
              <KaspLogo size="lg" showTagline={false} />
            </div>
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-3">
              {mode === 'signup' ? 'ثبت‌نام در هوش کاسپین' : 'ورود به حساب کاربری'}
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm leading-relaxed">
              {mode === 'signup' 
                ? 'برای ایجاد سفارش، دریافت پروژه‌ها و کدهای تخفیف، ثبت‌نام کنید.' 
                : 'جهت دسترسی به پنل کاربری یا پنل مدیریت، وارد شوید.'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="relative z-10 flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>ورود به حساب</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>ثبت‌نام جدید</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm font-medium flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                <span>نام و نام خانوادگی شما</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required={mode === 'signup'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: علی رضایی"
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/50 border border-slate-700/50 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-slate-600"
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>ایمیل یا شماره موبایل</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="email@example.com یا 09123456789"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/50 border border-slate-700/50 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dir-ltr text-left placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-teal-400" />
              <span>رمز عبور</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/50 border border-slate-700/50 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all dir-ltr text-left tracking-widest placeholder-slate-600"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !username || !password || (mode === 'signup' && !fullName)}
            className="w-full mt-6 py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span>ثبت‌نام و ورود به پنل</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span>ورود به حساب کاربری</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            {mode === 'signup' ? (
              <>
                قبلاً ثبت‌نام کرده‌اید؟{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(''); }}
                  className="text-purple-400 hover:underline font-bold"
                >
                  وارد شوید
                </button>
              </>
            ) : (
              <>
                حساب کاربری ندارید؟{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMessage(''); }}
                  className="text-purple-400 hover:underline font-bold"
                >
                  ثبت‌نام کنید
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
