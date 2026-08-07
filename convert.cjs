const fs = require('fs');

let content = fs.readFileSync('src/server/apiHandler.ts', 'utf-8');

content = content.replace(/function createSession\(userId: string\) \{/g, "async function createSession(userId: string) {");
content = content.replace(/createSession\(user\.id\)/g, "await createSession(user.id)");
content = content.replace(/createSession\(id\)/g, "await createSession(id)");
content = content.replace(/await getSessionUser\(req\)\?\.id/g, "(await getSessionUser(req))?.id");

fs.writeFileSync('src/server/apiHandler.ts', content);
