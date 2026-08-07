import React, { useState } from 'react';
import { Lock, Loader2, AlertCircle, KeyRound, Sparkles, User, Mail, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { KaspLogo } from './KaspLogo';
import { apiFetch } from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';

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
        // Small delay for smooth UX
        setTimeout(() => {
          onLoginSuccess(data.role);
        }, 500);
      } else {
        setErrorMessage(data.error || (mode === 'login' ? 'رمز عبور یا نام کاربری اشتباه است.' : 'خطا در ثبت نام'));
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('ارتباط با سرور برقرار نشد. لطفا وضعیت اینترنت خود را بررسی کنید.');
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setErrorMessage('');
    setPassword('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg bg-[#0b0f19] p-8 md:p-12 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="text-center space-y-4 relative z-10 mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-xl">
              <KaspLogo size="lg" showTagline={false} />
            </div>
          </motion.div>

          <div>
            <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
              {mode === 'login' ? 'خوش آمدید' : 'شروع کنیم'}
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-slate-400 mt-3 text-sm md:text-base leading-relaxed">
              {mode === 'login' 
                ? 'برای دسترسی به پنل کاربری، اطلاعات خود را وارد کنید.'
                : 'با ایجاد حساب کاربری به تمام امکانات دسترسی داشته باشید.'}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <AnimatePresence mode="popLayout">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>نام و نام خانوادگی</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: علی رضایی"
                    className="w-full pl-4 pr-4 py-4 rounded-2xl bg-slate-900/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-right placeholder-slate-600"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>شماره موبایل یا ایمیل</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="09123456789 یا email@example.com"
                className="w-full pl-4 pr-4 py-4 rounded-2xl bg-slate-900/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dir-ltr text-left placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
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
                className="w-full pl-4 pr-4 py-4 rounded-2xl bg-slate-900/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all dir-ltr text-left tracking-widest placeholder-slate-600"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !username || !password || (mode === 'signup' && !name)}
            className="w-full mt-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span>ورود به حساب</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span>ایجاد حساب کاربری</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="relative z-10 text-center mt-8 pt-6 border-t border-slate-800">
          <p className="text-slate-400 mb-4 text-sm">
            {mode === 'login' ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            className="flex items-center justify-center gap-2 mx-auto text-sm text-purple-400 hover:text-purple-300 font-bold transition-colors group"
          >
            <span>{mode === 'login' ? 'همین حالا ثبت‌نام کنید' : 'وارد حساب خود شوید'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
