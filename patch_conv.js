import fs from 'fs';
let code = fs.readFileSync('src/components/CustomerProjectConversation.tsx', 'utf8');

// Replace export definition
code = code.replace(
  "export const CustomerProjectConversation: React.FC = () => {",
  `export const CustomerProjectConversation: React.FC<{ report?: any }> = ({ report }) => {
  const [isLoading, setIsLoading] = useState(false);`
);

// Update messages state
code = code.replace(
  /const \[messages, setMessages\] = useState\(\[[\s\S]*?\]\);/,
  `const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'admin',
      text: 'گزارش ۱۴ بخشی هوش تجاری KASP آماده شد. اکنون اگر درباره فازهای اجرا، رقبا، یا جزئیات برنامه اقدام سوالی دارید، بپرسید.',
      time: 'همین الان',
      attachments: []
    }
  ]);`
);

// Update handleSendMessage to call API
const sendMsg = `  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;
    
    const userText = newMessage.trim();
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
          text: data.reply || 'مشکلی پیش آمد.',
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
        text: 'خطا در برقراری ارتباط با سرور. لطفاً دوباره تلاش کنید.',
        time: 'همین الان',
        attachments: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };`;

code = code.replace(/const handleSendMessage = \([\s\S]*?\};/, sendMsg);

// Disable input and button while loading
code = code.replace(
  'className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"',
  'disabled={isLoading} className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"'
);

code = code.replace(
  'className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shrink-0 shadow-sm shadow-blue-500/20"',
  'disabled={isLoading} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shrink-0 shadow-sm shadow-blue-500/20 disabled:opacity-50"'
);

fs.writeFileSync('src/components/CustomerProjectConversation.tsx', code);
