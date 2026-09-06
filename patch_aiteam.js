import fs from 'fs';
let code = fs.readFileSync('src/components/AIBusinessTeam/AITeamSection.tsx', 'utf8');

if (!code.includes('import { CustomerProjectConversation }')) {
  code = code.replace(
    "import { PaymentModal } from '../PaymentModal';",
    "import { PaymentModal } from '../PaymentModal';\nimport { CustomerProjectConversation } from '../CustomerProjectConversation';"
  );
}

// add the conversation component right before the "Bottom Reset / Re-run"
const convoInsertion = `
            {/* MANAGER CONVERSATION (Post-Report Q&A) */}
            <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-500" />
                  <span>گفتگو با مدیر هوش مصنوعی KASP</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  می‌توانید درباره جزئیات این گزارش، رقبا، و قدم‌های بعدی از مدیر استراتژی سوال بپرسید.
                </p>
              </div>
              <CustomerProjectConversation />
            </div>

            {/* Bottom Reset / Re-run */}`;

code = code.replace("{/* Bottom Reset / Re-run */}", convoInsertion);

fs.writeFileSync('src/components/AIBusinessTeam/AITeamSection.tsx', code);
