const fs = require('fs');
let content = fs.readFileSync('src/components/CustomAppSection.tsx', 'utf8');

// Replace Step 8 content
content = content.replace(
  `<textarea
                          value={formData.description}`,
  `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">نام شما *</label>
                            <input
                              type="text"
                              required
                              value={formData.customerName}
                              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                              placeholder="علی رضایی"
                              className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none text-sm text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">شماره تماس *</label>
                            <input
                              type="text"
                              required
                              value={formData.customerPhone}
                              onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                              placeholder="09123456789"
                              className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none text-sm text-slate-900 dark:text-white dir-ltr text-left"
                            />
                          </div>
                        </div>
                        <textarea
                          value={formData.description}`
);

// Update step 8 next check
content = content.replace(
  "(step === 2 && !formData.businessName.trim())",
  "(step === 2 && !formData.businessName.trim()) ||\n                      (step === 8 && (!formData.customerName.trim() || !formData.customerPhone.trim()))"
);

fs.writeFileSync('src/components/CustomAppSection.tsx', content);
