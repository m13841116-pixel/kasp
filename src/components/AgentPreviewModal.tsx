import React, { useState } from 'react';
import { Bot, X, ExternalLink, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { AIAgent } from '../types';

interface AgentPreviewModalProps {
  agent: AIAgent | null;
  onClose: () => void;
  lang: 'fa' | 'en';
}

export const AgentPreviewModal: React.FC<AgentPreviewModalProps> = ({
  agent,
  onClose,
}) => {
  if (!agent) return null;

  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputResult, setOutputResult] = useState<string | null>(null);

  const handleSimulateRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;

    setIsProcessing(true);
    setOutputResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      setOutputResult(
        `خروجی آنلاین تولید شده توسط ایجنت "${agent.title}" (${agent.subdomain}):\nپاسخ به ورودی "${inputPrompt}": تولید محتوا و پردازش متنی با دقت بالا و تطابق کامل انجام شد.`
      );
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6 relative shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-600/30 border border-purple-200 dark:border-purple-500/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{agent.title}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/30">
                  سرویس فعال
                </span>
              </div>
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400 dir-ltr text-left">https://{agent.subdomain}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sandbox Simulator Interface */}
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {agent.description}
          </p>

          <form onSubmit={handleSimulateRun} className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-300">
              تست زنده عملکرد ایجنت (ورودی پرامپت):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="متن یا پرامپت تست خود را وارد کنید..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shrink-0 flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>اجرا</span>
              </button>
            </div>
          </form>

          {/* Output Display */}
          {outputResult && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-slate-900/90 border border-purple-200 dark:border-purple-500/30 text-xs text-purple-900 dark:text-purple-200 space-y-2 animate-fadeIn leading-relaxed">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>پاسخ دریافتی سرور (۲۰۰ OK)</span>
              </div>
              <p className="whitespace-pre-line">{outputResult}</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
          <span>حق اشتراک: <strong className="text-emerald-600 dark:text-emerald-400">{agent.price}</strong></span>
          <a
            href={`https://${agent.subdomain}`}
            target="_blank"
            rel="noreferrer"
            className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 hover:underline"
          >
            <span>ورود به ابزار</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
