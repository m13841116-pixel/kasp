const fs = require('fs');
let content = fs.readFileSync('src/server/apiHandler.ts', 'utf8');

const replacement = `  if (user && typeof user.password === 'string') {
    if (bcrypt.compareSync(password, user.password) || isAdminCredentials) {
      isAuthenticated = true;
    }
  } else if (isAdminCredentials) {
    isAuthenticated = true;
  } else if (!user) {
    // Unified Login/Signup: User not found, so register them
    const id = \`usr-\${crypto.randomUUID()}\`;
    const hashed = bcrypt.hashSync(password, 10);
    const defaultName = cleanEmail.split('@')[0] || 'کاربر جدید';
    await execute("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)", [id, defaultName, cleanEmail, hashed, 'customer']);
    user = await queryOne("SELECT * FROM users WHERE id = ?", [id]);
    isAuthenticated = true;
  }`;

content = content.replace(/  if \(user && typeof user\.password === 'string'\) \{\n    if \(bcrypt\.compareSync\(password, user\.password\) \|\| isAdminCredentials\) \{\n      isAuthenticated = true;\n    \}\n  \} else if \(isAdminCredentials\) \{\n    isAuthenticated = true;\n  \}/, replacement);

fs.writeFileSync('src/server/apiHandler.ts', content);
