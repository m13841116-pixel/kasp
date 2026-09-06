import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  User,
  Bot,
  Mic,
  Video,
  Sparkles
} from 'lucide-react';

export const CustomerProjectConversation: React.FC<{ report?: any }> = ({ report }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'admin',
      text: 'گزارش ۱۵ بخشی هوش تجاری KASP آماده است. اکنون اگر درباره فازهای اجرا، رقبا، قیمت‌گذاری، یا توصیه استراتژیک سوالی دارید، بپرسید.',
      time: 'همین الان',
      attachments: []
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const QUICK_QUESTIONS = [
    'اولین قدم من در این هفته چیست؟',
    'چطور با رقیب اصلی خودم رقابت کنم؟',
    'بهترین استراتژی قیمت‌گذاری برای شروع چیست؟',
    'بزرگ‌ترین ریسکی که باید مراقبش باشم چیست؟'
  ];

  const handleSendMessage = async (customText?: string) => {
    const userText = (customText || newMessage).trim();
    if (!userText || isLoading) return;
    
    const newMsg = {
      id: Date.now(),
      sender: 'customer',
      text: userText,
      time: 'همین الان',
      attachments: []
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-team/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          report: report,
          history: messages.map(m => ({ role: m.sender === 'admin' ? 'assistant' : 'user', content: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'admin',
          text: data.reply || 'پاسخ دریافت نشد.',
          time: 'همین الان',
          attachments: []
        }]);
      } else {
        throw new Error('Server error');
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'admin',
        text: 'خطا در برقراری ارتباط با مشاور هوش مصنوعی KASP. لطفاً دوباره تلاش کنید.',
        time: 'همین الان',
        attachments: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden relative z-10 shadow-xl">
      
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-850 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>مشاور هوشمند KASP (مدیر استراتژی)</span>
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              آنلاین و مسلط بر گزارش ۱۵ بخشی پروژه
            </p>
          </div>
        </div>

        {/* Future Voice / Video Advisor Teaser */}
        <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/30 px-3 py-1.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Mic className="w-3.5 h-3.5" />
            <Video className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-indigo-300">
            مشاوره صوتی و تصویری KASP (به‌زودی)
          </span>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="bg-slate-100 dark:bg-slate-950/60 px-4 py-2 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] text-slate-500 font-bold shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          پرسش‌های سریع:
        </span>
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAdmin = msg.sender === 'admin';
          return (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAdmin ? 'self-start' : 'self-end flex-row-reverse float-left w-full'}`}>
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${
                isAdmin ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
              }`}>
                {isAdmin ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`space-y-1 ${!isAdmin && 'flex flex-col items-end'}`}>
                <div className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-line ${
                  isAdmin 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-tr-sm border border-slate-200 dark:border-slate-700/50' 
                    : 'bg-indigo-600 text-white rounded-tl-sm text-right'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 font-medium px-1">
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              <span>مشاور KASP در حال تحلیل و پاسخ...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isLoading}
            placeholder="سوال خود را درباره گزارش، استراتژی یا اجرای نقشه راه بپرسید..."
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all shrink-0 flex items-center gap-1.5 text-xs font-bold"
          >
            <span>ارسال</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
