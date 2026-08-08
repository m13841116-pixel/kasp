const fs = require('fs');
let content = fs.readFileSync('src/server/apiHandler.ts', 'utf8');

content = content.replace(
  /router\.get\('\/customer\/dashboard', async \(req, res\) => \{\n  const userId = req\.cookies\.user_session;\n  if \(!userId\) return res\.status\(401\)\.json\(\{ error: 'Unauthorized' \}\);/g,
  `router.get('/customer/dashboard', async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = user.id;`
);

fs.writeFileSync('src/server/apiHandler.ts', content);
