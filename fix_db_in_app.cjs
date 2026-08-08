const fs = require('fs');
let content = fs.readFileSync('src/server/db.ts', 'utf8');

content = content.replace(
  'const wheelSetting = sqliteDb.exec("SELECT * FROM wheel_settings WHERE id = 1");',
  'sqliteDb.exec("DROP TABLE IF EXISTS wheel_settings; CREATE TABLE IF NOT EXISTS wheel_settings (id INTEGER PRIMARY KEY DEFAULT 1, maxSpins INTEGER DEFAULT 3, prizesConfig TEXT);");\n    const wheelSetting = [];'
);

fs.writeFileSync('src/server/db.ts', content);
