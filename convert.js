const fs = require('fs');

let content = fs.readFileSync('src/server/apiHandler.ts', 'utf-8');

// Replace standard route handlers: router.get('/path', (req, res) => ...) to async (req, res)
content = content.replace(/router\.(get|post|put|delete)\('([^']+)',\s*(isAdmin, )?\s*\((req,\s*res)\)\s*=>/g, "router.$1('$2', $3async ($4) =>");

// Replace standard route handlers: router.get('/path', (req, res) => { ... })
content = content.replace(/router\.(get|post|put|delete)\('([^']+)',\s*(isAdmin, )?\s*\((req,\s*res)\)\s*=>\s*\{/g, "router.$1('$2', $3async ($4) => {");

// Add await to queries
content = content.replace(/queryOne\(/g, "await queryOne(");
content = content.replace(/queryAll\(/g, "await queryAll(");
content = content.replace(/execute\(/g, "await execute(");

fs.writeFileSync('src/server/apiHandler.ts', content);
