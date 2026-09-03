import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  User,
  Bot
} from 'lucide-react';

export const CustomerProjectConversation: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'admin',
      text: 'سلام! درخواست شما دریافت شد. ایده بسیار جذابی است. در حال بررسی نیازمندی‌های فنی آن هستیم.',
      time: '۱۰:۳۲ - ۲ شهریور',
      attachments: []
    },
    {
      id: 2,
      sender: 'customer',
      text: 'سلام، ممنون. آیا امکان اتصال به درگاه زرین‌پال هم در این فاز وجود دارد؟',
      time: '۱۱:۱۵ - ۲ شهریور',
      attachments: []
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setMessages([...messages, {
      id: Date.now(),
      sender: 'customer',
      text: newMessage,
      time: 'همین الان',
      attachments: []
    }]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden relative z-10 shadow-lg">
      
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">تیم فنی KASP</h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              پاسخگویی سریع
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
          پروژه در حال بررسی
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => {
          const isAdmin = msg.sender === 'admin';
          return (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAdmin ? 'self-start' : 'self-end flex-row-reverse float-left w-full'}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                isAdmin ? 'bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-500/30' : 'bg-purple-500/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
              }`}>
                {isAdmin ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`space-y-1 ${!isAdmin && 'flex flex-col items-end'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isAdmin 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-tr-sm border border-slate-200 dark:border-slate-700/50' 
                    : 'bg-purple-100 dark:bg-purple-600/20 text-purple-900 dark:text-purple-100 rounded-tl-sm border border-purple-300 dark:border-purple-500/30 text-right'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-500 font-medium px-1">
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
            title="پیوست فایل"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-500 mt-2">
          فایل‌های مجاز: PDF, JPG, PNG (حداکثر ۵ مگابایت)
        </p>
      </div>

    </div>
  );
};
