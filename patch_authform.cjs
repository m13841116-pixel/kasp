const fs = require('fs');
let content = fs.readFileSync('src/components/AuthForm.tsx', 'utf8');

const newAuthForm = `import React, { useState } from 'react';
import { Mail, KeyRound, Loader2, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../utils/api';
import { KaspLogo } from './KaspLogo';

interface AuthFormProps {
  initialMode?: 'login' | 'signup';
  onLoginSuccess: (role: 'admin' | 'customer') => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        if (data.csrfToken) {
          localStorage.setItem('csrf_token', data.csrfToken);
        }
        
        setTimeout(() => {
          onLoginSuccess(data.role);
        }, 500);
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'ایمیل یا رمز عبور اشتباه است.');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMessage('ارتباط با سرور برقرار نشد. لطفا وضعیت اینترنت خود را بررسی کنید.');
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
              خوش آمدید
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-slate-400 mt-3 text-sm md:text-base leading-relaxed">
              با وارد کردن ایمیل و رمز عبور وارد شوید. <br/> اگر حساب کاربری ندارید، برای شما ایجاد خواهد شد.
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
            disabled={isLoading || !username || !password}
            className="w-full mt-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span>ورود / ثبت‌نام</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/AuthForm.tsx', newAuthForm);
