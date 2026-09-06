import fs from 'fs';
let code = fs.readFileSync('src/server/apiHandler.ts', 'utf8');

const chatRoute = `
// 4. Chat with Manager
router.post('/ai-team/chat', async (req, res) => {
  try {
    const { message, report, history } = req.body;
    
    // Auth Check
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!message || !report) {
      return res.status(400).json({ error: 'Message and report are required.' });
    }

    const prompt = \`
شما مدیر ارشد هوش مصنوعی KASP هستید. 
کاربر درباره یک ایده کسب‌وکار که گزارش آن پیش‌تر توسط تیم شما (KASP) تهیه شده سوال می‌پرسد.
بر اساس این گزارش تحلیلی پاسخ‌های دقیق، اجرایی و بدون حاشیه بدهید. اگر پاسخ در گزارش نیست، با توجه به تحلیل‌های بازار و به عنوان یک استراتژیست کسب‌وکار راهنمایی کنید.
از جملات عمومی بپرهیزید و مانند یک مشاور سطح بالا صحبت کنید.

-- اطلاعات گزارش کاربر --
هدف: \${report.businessGoal}
خلاصه اجرایی: \${report.executiveSummary}
برنامه اقدام 30 روزه: \${JSON.stringify(report.actionPlan30Days)}
نظر نهایی: \${report.kaspVerdict?.badge}
---------------------------

پرسش جدید کاربر: "\${message}"
\`;

    const reply = await generateWithGemini(prompt, 'شما مدیر ارشد استراتژی KASP هستید. بر اساس دیتای پروژه پاسخ دهید.');
    
    res.json({ reply });
  } catch (err: any) {
    console.error('Error in /api/ai-team/chat:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
`;

if (!code.includes('/api/ai-team/chat')) {
  code = code.replace(
    "router.post('/ai-team/run-stream', async (req, res) => {",
    chatRoute + "\nrouter.post('/ai-team/run-stream', async (req, res) => {"
  );
}

fs.writeFileSync('src/server/apiHandler.ts', code);
