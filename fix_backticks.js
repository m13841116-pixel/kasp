import fs from 'fs';

for (const file of ['src/server/agents/competitor.ts', 'src/server/agents/customer.ts']) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/\\\`/g, '`');
  code = code.replace(/\\\$/g, '$');
  fs.writeFileSync(file, code);
}
