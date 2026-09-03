const fs = require('fs');
let content = fs.readFileSync('src/components/PaymentModal.tsx', 'utf8');

// Add states
content = content.replace(
  "const [senderName, setSenderName] = useState('');",
  "const [senderName, setSenderName] = useState('');\n  const [customerNameInput, setCustomerNameInput] = useState('');\n  const [customerPhoneInput, setCustomerPhoneInput] = useState('');"
);

// Update payload
content = content.replace(
  "          trackingCode,\n          senderName,",
  "          trackingCode,\n          senderName,\n          customerName: customerNameInput ? `${customerNameInput} (${customerPhoneInput})` : undefined,"
);

// Add fields to form
const fieldsToAdd = `
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام شما *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerNameInput}
                    onChange={(e) => setCustomerNameInput(e.target.value)}
                    placeholder="علی رضایی"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شماره موبایل *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerPhoneInput}
                    onChange={(e) => setCustomerPhoneInput(e.target.value)}
                    placeholder="09123456789"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs dir-ltr text-left focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
`;

content = content.replace(
  `<h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">\n                <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />\n                <span>ثبت اطلاعات فیش واریزی</span>\n              </h4>`,
  `<h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">\n                <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />\n                <span>ثبت اطلاعات فیش واریزی</span>\n              </h4>\n${fieldsToAdd}`
);

fs.writeFileSync('src/components/PaymentModal.tsx', content);
