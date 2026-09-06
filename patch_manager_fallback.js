import fs from 'fs';
let code = fs.readFileSync('src/server/agents/manager.ts', 'utf8');

code = code.replace(
/targetCustomers: \{\s+summary: `شناسایی \$\{research\.targetAudience\.length\} دسته مخاطب هدف کلیدی با اولویت‌بندی خریداران زودهنگام و ارزش‌محور\.`,\s+personas: research\.targetAudience\s+\}/,
`targetCustomers: {
        summary: \`شناسایی \${(customer?.targetAudience || []).length} دسته مخاطب هدف کلیدی.\`,
        personas: customer?.targetAudience || []
      }`
);

code = code.replace(
/competitors: \{\s+summary: 'بررسی مهم‌ترین بازیگران بازار و تعیین حفره‌های خدماتی آنها برای تصاحب سهم بازار\.',\s+list: research\.competitors\s+\}/,
`competitors: {
        summary: 'بررسی مهم‌ترین بازیگران بازار و تعیین حفره‌های خدماتی آنها برای تصاحب سهم بازار.',
        list: competitor?.competitors || []
      }`
);

fs.writeFileSync('src/server/agents/manager.ts', code);
