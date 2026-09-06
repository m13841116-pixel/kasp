import fs from 'fs';
let code = fs.readFileSync('src/components/CustomerProjectConversation.tsx', 'utf8');

code = code.replace("تیم فنی KASP", "مدیر هوش مصنوعی KASP");
code = code.replace("در حال بررسی نیازمندی‌های فنی آن هستیم.", "گزارش ۱۴ بخشی هوش تجاری آماده شد. اکنون اگر درباره فازهای اجرا، رقبا، یا جزئیات برنامه اقدام سوالی دارید، بپرسید.");

fs.writeFileSync('src/components/CustomerProjectConversation.tsx', code);
