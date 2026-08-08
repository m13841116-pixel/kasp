const fs = require('fs');
let content = fs.readFileSync('src/server/db.ts', 'utf8');

const fullPrizesStr = `    const defaultPrizesJson = JSON.stringify([
      { id: 0, shortLabel: '۱۰٪ تخفیف', fullTitle: '۱۰٪ تخفیف ویژه توسعه نرم‌افزار', pct: 10, codePrefix: 'OFF10', color: '#ec4899', textColor: '#ffffff', weight: 20 },
      { id: 1, shortLabel: '۲۰٪ تخفیف', fullTitle: '۲۰٪ تخفیف ویژه سفارش پروژه', pct: 20, codePrefix: 'OFF20', color: '#8b5cf6', textColor: '#ffffff', weight: 20 },
      { id: 2, shortLabel: '۳۰٪ تخفیف', fullTitle: '۳۰٪ تخفیف طلایی طراحی نرم‌افزار', pct: 30, codePrefix: 'OFF30', color: '#3b82f6', textColor: '#ffffff', weight: 15 },
      { id: 3, shortLabel: '۸۰٪ تخفیف', fullTitle: '🔥 ۸۰٪ تخفیف استثنایی ویژه شروع کار', pct: 80, codePrefix: 'OFF80', color: '#f43f5e', textColor: '#ffffff', weight: 5 },
      { id: 4, shortLabel: 'دامنه .ir', fullTitle: '🌐 ۱ سال دامنه .ir رایگان', pct: 100, codePrefix: 'FREE-IR', color: '#06b6d4', textColor: '#ffffff', weight: 15 },
      { id: 5, shortLabel: 'اکانت زوپیت', fullTitle: '🛍️ اکانت فروشگاهی رایگان زوپیت (Zoopit.ir)', pct: 100, codePrefix: 'ZOOPIT', color: '#10b981', textColor: '#ffffff', weight: 10 },
      { id: 6, shortLabel: 'لوگو رایگان', fullTitle: '🎨 طراحی لوگو اختصاصی رایگان', pct: 100, codePrefix: 'FREE-LOGO', color: '#f59e0b', textColor: '#ffffff', weight: 10 },
      { id: 7, shortLabel: 'پشتیبانی', fullTitle: '🛡️ ۲ ماه پشتیبانی و نگهداری رایگان', pct: 100, codePrefix: 'FREE-SUP', color: '#6366f1', textColor: '#ffffff', weight: 5 },
      { id: 8, shortLabel: '۲M نقدی', fullTitle: '💵 ۲,۰۰۰,۰۰۰ تومان جایزه نقدی', pct: 100, codePrefix: 'CASH2M', color: '#eab308', textColor: '#ffffff', weight: 0 },
    ]);`;

// Fix sqlite default prizes
content = content.replace(
  /const defaultPrizesJson = JSON\.stringify\(\[\s+\{ id: 0, shortLabel: '۱۰٪ تخفیف'.*?\s+\{ id: 1, shortLabel: '۲۰٪ تخفیف'.*?\s+\]\);/g,
  fullPrizesStr
);

fs.writeFileSync('src/server/db.ts', content);
