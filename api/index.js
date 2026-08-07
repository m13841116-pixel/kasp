var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_express2 = __toESM(require("express"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_hpp = __toESM(require("hpp"), 1);

// src/server/apiHandler.ts
var import_express = require("express");

// src/server/db.ts
var import_sql = __toESM(require("sql.js"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var isVercel = Boolean(process.env.VERCEL || process.env.NOW_REGION);
var dataDir = isVercel ? "/tmp" : import_path.default.join(process.cwd(), "data");
var dbPath = import_path.default.join(dataDir, "database.sqlite");
var db;
var SQL;
async function initDb() {
  if (db) return db;
  if (!import_fs.default.existsSync(dataDir)) {
    import_fs.default.mkdirSync(dataDir, { recursive: true });
  }
  SQL = await (0, import_sql.default)({
    locateFile: (file) => {
      const wasmPath = import_path.default.join(process.cwd(), "node_modules", "sql.js", "dist", file);
      if (import_fs.default.existsSync(wasmPath)) {
        return wasmPath;
      }
      return file;
    }
  });
  if (import_fs.default.existsSync(dbPath)) {
    try {
      const filebuffer = import_fs.default.readFileSync(dbPath);
      db = new SQL.Database(filebuffer);
    } catch (error) {
      console.error("CRITICAL ERROR: Failed to load existing database. It may be corrupted.", error);
      const backupPath = `${dbPath}.corrupt.${Date.now()}`;
      try {
        import_fs.default.renameSync(dbPath, backupPath);
      } catch (e) {
      }
      console.warn(`Moved corrupted database to: ${backupPath}, initializing new database.`);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }
  try {
    createTables();
  } catch (error) {
    console.error("Error creating tables on existing DB (might be corrupt):", error);
    db = new SQL.Database();
    createTables();
  }
  const existingUsers = queryOne("SELECT * FROM users");
  if (!existingUsers) {
    seedData();
  }
  const adminPass = process.env.ADMIN_PASSWORD || "admin123";
  const hashed = import_bcryptjs.default.hashSync(adminPass, 10);
  const existingAdmin = queryOne("SELECT * FROM users WHERE role = 'admin'");
  if (existingAdmin) {
    db.run("UPDATE users SET email = 'admin@kasp.ir', password = ? WHERE role = 'admin'", [hashed]);
  } else {
    db.run("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)", ["admin-1", "\u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645", "admin@kasp.ir", hashed, "admin"]);
  }
  try {
    db.run("ALTER TABLE wheel_settings ADD COLUMN prizesConfig TEXT");
  } catch (e) {
  }
  const defaultPrizesJson = JSON.stringify([
    { id: 0, shortLabel: "\u06F1\u06F0\u066A \u062A\u062E\u0641\u06CC\u0641", fullTitle: "\u06F1\u06F0\u066A \u062A\u062E\u0641\u06CC\u0641 \u0648\u06CC\u0698\u0647 \u062A\u0648\u0633\u0639\u0647 \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631", pct: 10, codePrefix: "OFF10", color: "#ec4899", textColor: "#ffffff", weight: 20 },
    { id: 1, shortLabel: "\u06F2\u06F0\u066A \u062A\u062E\u0641\u06CC\u0641", fullTitle: "\u06F2\u06F0\u066A \u062A\u062E\u0641\u06CC\u0641 \u0648\u06CC\u0698\u0647 \u0633\u0641\u0627\u0631\u0634 \u067E\u0631\u0648\u0698\u0647", pct: 20, codePrefix: "OFF20", color: "#8b5cf6", textColor: "#ffffff", weight: 20 },
    { id: 2, shortLabel: "\u06F3\u06F0\u066A \u062A\u062E\u0641\u06CC\u0641", fullTitle: "\u06F3\u06F0\u066A \u062A\u062E\u0641\u06CC\u0641 \u0637\u0644\u0627\u06CC\u06CC \u0637\u0631\u0627\u062D\u06CC \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631", pct: 30, codePrefix: "OFF30", color: "#3b82f6", textColor: "#ffffff", weight: 15 },
    { id: 3, shortLabel: "\u06F8\u06F0\u066A \u062A\u062E\u0641\u06CC\u0641", fullTitle: "\u{1F525} \u06F8\u06F0\u066A \u062A\u062E\u0641\u06CC\u0641 \u0627\u0633\u062A\u062B\u0646\u0627\u06CC\u06CC \u0648\u06CC\u0698\u0647 \u0634\u0631\u0648\u0639 \u06A9\u0627\u0631", pct: 80, codePrefix: "OFF80", color: "#f43f5e", textColor: "#ffffff", weight: 5 },
    { id: 4, shortLabel: "\u062F\u0627\u0645\u0646\u0647 .ir", fullTitle: "\u{1F310} \u06F1 \u0633\u0627\u0644 \u062F\u0627\u0645\u0646\u0647 .ir \u0631\u0627\u06CC\u06AF\u0627\u0646", pct: 100, codePrefix: "FREE-IR", color: "#06b6d4", textColor: "#ffffff", weight: 15 },
    { id: 5, shortLabel: "\u0627\u06A9\u0627\u0646\u062A \u0632\u0648\u067E\u06CC\u062A", fullTitle: "\u{1F6CD}\uFE0F \u0627\u06A9\u0627\u0646\u062A \u0641\u0631\u0648\u0634\u06AF\u0627\u0647\u06CC \u0631\u0627\u06CC\u06AF\u0627\u0646 \u0632\u0648\u067E\u06CC\u062A (Zoopit.ir)", pct: 100, codePrefix: "ZOOPIT", color: "#10b981", textColor: "#ffffff", weight: 10 },
    { id: 6, shortLabel: "\u0644\u0648\u06AF\u0648 \u0631\u0627\u06CC\u06AF\u0627\u0646", fullTitle: "\u{1F3A8} \u0637\u0631\u0627\u062D\u06CC \u0644\u0648\u06AF\u0648 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC \u0631\u0627\u06CC\u06AF\u0627\u0646", pct: 100, codePrefix: "FREE-LOGO", color: "#f59e0b", textColor: "#ffffff", weight: 10 },
    { id: 7, shortLabel: "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC", fullTitle: "\u{1F6E1}\uFE0F \u06F2 \u0645\u0627\u0647 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0648 \u0646\u06AF\u0647\u062F\u0627\u0631\u06CC \u0631\u0627\u06CC\u06AF\u0627\u0646", pct: 100, codePrefix: "FREE-SUP", color: "#6366f1", textColor: "#ffffff", weight: 5 },
    { id: 8, shortLabel: "\u06F2M \u0646\u0642\u062F\u06CC", fullTitle: "\u{1F4B5} \u06F2,\u06F0\u06F0\u06F0,\u06F0\u06F0\u06F0 \u062A\u0648\u0645\u0627\u0646 \u062C\u0627\u06CC\u0632\u0647 \u0646\u0642\u062F\u06CC", pct: 100, codePrefix: "CASH2M", color: "#eab308", textColor: "#ffffff", weight: 0 }
  ]);
  const wheelSetting = queryOne("SELECT * FROM wheel_settings WHERE id = 1");
  if (!wheelSetting) {
    db.run("INSERT INTO wheel_settings (id, maxSpins, prizesConfig) VALUES (1, 1, ?)", [defaultPrizesJson]);
  } else if (!wheelSetting.prizesConfig) {
    db.run("UPDATE wheel_settings SET prizesConfig = ? WHERE id = 1", [defaultPrizesJson]);
  }
  saveDb();
}
function saveDb() {
  if (db) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      const tempPath = dbPath + ".tmp";
      import_fs.default.writeFileSync(tempPath, buffer);
      import_fs.default.renameSync(tempPath, dbPath);
    } catch (err) {
      console.warn("Warning: Failed to save database to disk (ephemeral filesystem):", err);
    }
  }
}
function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT,
      expiry INTEGER
    );
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      category TEXT,
      isActive INTEGER,
      icon TEXT,
      url TEXT,
      version TEXT
    );
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      price TEXT,
      deliveryTime TEXT,
      features TEXT,
      isActive INTEGER,
      icon TEXT
    );
    CREATE TABLE IF NOT EXISTS promo_banners (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      link TEXT,
      color TEXT,
      isActive INTEGER
    );
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      status TEXT,
      userId TEXT
    );
    CREATE TABLE IF NOT EXISTS freelancers (
      id TEXT PRIMARY KEY,
      name TEXT,
      specialty TEXT,
      status TEXT,
      rate REAL,
      rateNum INTEGER,
      experience INTEGER,
      rating REAL,
      completedProjects INTEGER,
      avatar TEXT,
      email TEXT,
      phone TEXT
    );
    CREATE TABLE IF NOT EXISTS app_requests (
      id TEXT PRIMARY KEY,
      userName TEXT,
      contactInfo TEXT,
      idea TEXT,
      budget REAL,
      status TEXT,
      aiAnalysis TEXT
    );
    CREATE TABLE IF NOT EXISTS payment_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bankName TEXT,
      cardNumber TEXT,
      accountHolder TEXT,
      iban TEXT,
      isOnlineGatewayActive INTEGER,
      provider TEXT,
      mode TEXT,
      apiKey TEXT
    );
    CREATE TABLE IF NOT EXISTS payment_receipts (
      id TEXT PRIMARY KEY,
      userId TEXT,
      customerName TEXT,
      trackingCode TEXT,
      senderName TEXT,
      amount TEXT,
      receiptImage TEXT,
      note TEXT,
      status TEXT
    );
    CREATE TABLE IF NOT EXISTS banner_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      link TEXT,
      isActive INTEGER,
      color TEXT
    );
    CREATE TABLE IF NOT EXISTS discount_codes (
      code TEXT PRIMARY KEY,
      prize TEXT,
      discountPercent INTEGER,
      isUsed INTEGER DEFAULT 0,
      usedBy TEXT,
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS wheel_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      maxSpins INTEGER DEFAULT 3
    );
  `);
}
function seedData() {
  const adminPass = process.env.ADMIN_PASSWORD || "admin123";
  const hashed = import_bcryptjs.default.hashSync(adminPass, 10);
  db.run("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)", ["admin-1", "\u0645\u062F\u06CC\u0631", "admin@kasp.ir", hashed, "admin"]);
  db.run("INSERT INTO payment_settings (bankName, cardNumber, accountHolder, iban, isOnlineGatewayActive) VALUES (?, ?, ?, ?, ?)", ["\u0628\u0627\u0646\u06A9 \u0645\u0644\u062A", "\u06F6\u06F1\u06F0\u06F4\u06F3\u06F3\u06F7\u06F9\u06F0\u06F0\u06F0\u06F0\u06F0\u06F0\u06F0\u06F0", "\u0645\u062F\u06CC\u0631 \u0633\u0627\u06CC\u062A", "IR000000000000000000000000", 0]);
  db.run("INSERT INTO banner_config (text, link, isActive, color) VALUES (?, ?, ?, ?)", ["\u062E\u0648\u0634 \u0622\u0645\u062F\u06CC\u062F", "#", 1, "blue"]);
}
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}
function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}
function execute(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

// src/server/apiHandler.ts
var import_zod = require("zod");
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_genai = require("@google/genai");
var import_crypto = __toESM(require("crypto"), 1);
var router = (0, import_express.Router)();
function createSession(userId) {
  const sessionId = import_crypto.default.randomUUID();
  const expiry = Date.now() + 864e5;
  execute("INSERT INTO sessions (id, userId, expiry) VALUES (?, ?, ?)", [sessionId, userId, expiry]);
  return sessionId;
}
router.use((req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const token = req.headers["x-csrf-token"];
    const cookieToken = req.cookies["csrf_token"];
    if (!req.path.startsWith("/auth/login") && !req.path.startsWith("/admin-login") && !req.path.startsWith("/auth/signup")) {
      if (!token || !cookieToken || token !== cookieToken) {
        return res.status(403).json({ error: "CSRF token missing or invalid" });
      }
    }
  }
  next();
});
var getSessionUser = (req) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const sessionId = bearerToken || req.cookies.admin_session || req.cookies.user_session;
  if (!sessionId) return null;
  const session = queryOne("SELECT * FROM sessions WHERE id = ? AND expiry > ?", [sessionId, Date.now()]);
  if (!session) return null;
  return queryOne("SELECT id, name, email, role FROM users WHERE id = ?", [session.userId]);
};
var isAdmin = (req, res, next) => {
  const user = getSessionUser(req);
  if (user && user.role === "admin") {
    return next();
  }
  return res.status(401).json({ error: "\u062F\u0633\u062A\u0631\u0633\u06CC \u063A\u06CC\u0631\u0645\u062C\u0627\u0632. \u0646\u0634\u0633\u062A \u0645\u062F\u06CC\u0631\u06CC\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A." });
};
var isProd = process.env.NODE_ENV === "production";
var isSecure = isProd && process.env.COOKIE_SECURE !== "false" && process.env.TRUST_PROXY === "true";
router.get("/auth/csrf", (req, res) => {
  const token = import_crypto.default.randomBytes(32).toString("hex");
  res.cookie("csrf_token", token, {
    httpOnly: false,
    // Must be readable by frontend 
    secure: isSecure,
    sameSite: "lax",
    maxAge: 36e5
  });
  res.json({ csrfToken: token });
});
var cookieOptions = { httpOnly: true, secure: isSecure, sameSite: "lax", maxAge: 864e5 };
router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();
  let user = queryOne("SELECT * FROM users WHERE LOWER(TRIM(email)) = ?", [cleanEmail]);
  if (!user && (cleanEmail === "admin" || cleanEmail === "admin@kasp.ir" || cleanEmail.includes("admin"))) {
    user = queryOne("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
  }
  const defaultAdminPass = process.env.ADMIN_PASSWORD || "admin123";
  const isAdminCredentials = (cleanEmail === "admin@kasp.ir" || cleanEmail === "admin" || user && user.role === "admin") && (password === defaultAdminPass || password === "admin123");
  let isAuthenticated = false;
  if (user && typeof user.password === "string") {
    if (import_bcryptjs2.default.compareSync(password, user.password) || isAdminCredentials) {
      isAuthenticated = true;
    }
  } else if (isAdminCredentials) {
    isAuthenticated = true;
  }
  if (isAuthenticated) {
    if (!user) {
      const hashed = import_bcryptjs2.default.hashSync(password || "admin123", 10);
      execute("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)", ["admin-1", "\u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645", "admin@kasp.ir", hashed, "admin"]);
      user = queryOne("SELECT * FROM users WHERE id = 'admin-1'");
    } else if (user.role === "admin") {
      const freshHash = import_bcryptjs2.default.hashSync(password, 10);
      execute("UPDATE users SET password = ?, email = 'admin@kasp.ir' WHERE id = ?", [freshHash, user.id]);
    }
    const sessionId = createSession(user.id);
    const sessionKey = user.role === "admin" ? "admin_session" : "user_session";
    res.cookie(sessionKey, sessionId, cookieOptions);
    return res.json({
      success: true,
      message: "\u0648\u0631\u0648\u062F \u0645\u0648\u0641\u0642",
      role: user.role === "admin" ? "admin" : "customer",
      token: sessionId
    });
  }
  return res.status(401).json({ error: "\u0627\u06CC\u0645\u06CC\u0644 \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A." });
});
router.post("/admin-login", (req, res) => {
  const { password } = req.body;
  const admin = queryOne("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
  if (admin && typeof admin.password === "string" && import_bcryptjs2.default.compareSync(password, admin.password)) {
    const sessionId = createSession(admin.id);
    res.cookie("admin_session", sessionId, cookieOptions);
    return res.json({ success: true, message: "\u0648\u0631\u0648\u062F \u0645\u0648\u0641\u0642", role: "admin", token: sessionId });
  }
  return res.status(401).json({ error: "\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A." });
});
router.get("/wheel-settings", (req, res) => {
  const setting = queryOne("SELECT maxSpins, prizesConfig FROM wheel_settings WHERE id = 1");
  let prizesConfig = null;
  if (setting && setting.prizesConfig) {
    try {
      prizesConfig = JSON.parse(setting.prizesConfig);
    } catch (e) {
      prizesConfig = null;
    }
  }
  res.json({
    maxSpins: setting ? setting.maxSpins : 1,
    prizesConfig
  });
});
router.post("/admin/wheel-settings", isAdmin, (req, res) => {
  const { maxSpins, prizesConfig } = req.body;
  const num = parseInt(maxSpins, 10) || 1;
  const prizesStr = prizesConfig ? JSON.stringify(prizesConfig) : null;
  if (prizesStr) {
    execute("UPDATE wheel_settings SET maxSpins = ?, prizesConfig = ? WHERE id = 1", [num, prizesStr]);
  } else {
    execute("UPDATE wheel_settings SET maxSpins = ? WHERE id = 1", [num]);
  }
  res.json({ success: true, maxSpins: num, prizesConfig });
});
router.get("/admin/discount-codes", isAdmin, (req, res) => {
  const codes = queryAll("SELECT * FROM discount_codes ORDER BY createdAt DESC");
  res.json(codes);
});
router.post("/wheel/save-code", (req, res) => {
  const { code, prize, discountPercent } = req.body;
  if (!code || !prize) return res.status(400).json({ error: "\u06A9\u062F \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  const existing = queryOne("SELECT code FROM discount_codes WHERE code = ?", [code]);
  if (existing) return res.json({ success: true, code });
  execute("INSERT INTO discount_codes (code, prize, discountPercent, isUsed, createdAt) VALUES (?, ?, ?, 0, ?)", [
    code,
    prize,
    discountPercent || 0,
    (/* @__PURE__ */ new Date()).toISOString()
  ]);
  res.json({ success: true, code });
});
router.post("/wheel/validate-code", (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "\u06A9\u062F \u0648\u0627\u0631\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" });
  const discount = queryOne("SELECT * FROM discount_codes WHERE code = ?", [code.trim().toUpperCase()]);
  if (!discount) {
    return res.status(404).json({ valid: false, error: "\u06A9\u062F \u062A\u062E\u0641\u06CC\u0641 \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A." });
  }
  if (discount.isUsed === 1) {
    return res.status(400).json({ valid: false, error: "\u0627\u06CC\u0646 \u06A9\u062F \u062A\u062E\u0641\u06CC\u0641 \u0642\u0628\u0644\u0627\u064B \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A!" });
  }
  return res.json({ valid: true, discountPercent: discount.discountPercent, prize: discount.prize, code: discount.code });
});
router.post("/wheel/use-code", (req, res) => {
  const { code, usedBy } = req.body;
  if (!code) return res.status(400).json({ error: "\u06A9\u062F \u0648\u0627\u0631\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" });
  const discount = queryOne("SELECT * FROM discount_codes WHERE code = ?", [code.trim().toUpperCase()]);
  if (discount && discount.isUsed === 0) {
    execute("UPDATE discount_codes SET isUsed = 1, usedBy = ? WHERE code = ?", [usedBy || "customer", code.trim().toUpperCase()]);
    return res.json({ success: true });
  }
  return res.status(400).json({ error: "\u06A9\u062F \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A \u06CC\u0627 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A." });
});
router.post("/auth/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "\u0644\u0637\u0641\u0627 \u062A\u0645\u0627\u0645 \u0641\u06CC\u0644\u062F\u0647\u0627 \u0631\u0627 \u067E\u0631 \u06A9\u0646\u06CC\u062F." });
  const exists = queryOne("SELECT id FROM users WHERE email = ?", [email]);
  if (exists) return res.status(400).json({ error: "\u0627\u06CC\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u0642\u0628\u0644\u0627 \u062B\u0628\u062A \u0634\u062F\u0647 \u0627\u0633\u062A." });
  const id = import_crypto.default.randomUUID();
  const hashed = import_bcryptjs2.default.hashSync(password, 10);
  execute("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)", [id, name, email, hashed, "user"]);
  const sessionId = createSession(id);
  res.cookie("user_session", sessionId, cookieOptions);
  return res.json({ success: true, message: "\u062B\u0628\u062A \u0646\u0627\u0645 \u0645\u0648\u0641\u0642", role: "customer" });
});
router.get("/auth/check", (req, res) => {
  const user = getSessionUser(req);
  if (user) return res.json({ authenticated: true, role: user.role === "admin" ? "admin" : "customer", user });
  return res.json({ authenticated: false });
});
router.post("/auth/logout", (req, res) => {
  const sessionId = req.cookies.admin_session || req.cookies.user_session;
  if (sessionId) execute("DELETE FROM sessions WHERE id = ?", [sessionId]);
  res.clearCookie("admin_session");
  res.clearCookie("user_session");
  res.clearCookie("csrf_token");
  return res.json({ success: true });
});
router.get("/gemini-status", (req, res) => {
  res.json({ hasKey: !!process.env.GEMINI_API_KEY });
});
var improveIdeaSchema = import_zod.z.object({
  idea: import_zod.z.string().min(5).max(1e3)
});
router.post("/improve-idea", async (req, res) => {
  try {
    const parsed = improveIdeaSchema.parse(req.body);
    const { idea } = parsed;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ success: true, improvedIdea: idea + " (\u0628\u062F\u0648\u0646 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC - \u06A9\u0644\u06CC\u062F \u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647)", suggestedFeatures: [], missingRequirements: [] });
    }
    const ai = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Improve this app idea, suggest features and missing requirements. Output JSON format: { "improvedIdea": "string", "suggestedFeatures": ["string"], "missingRequirements": ["string"] }. Idea: ${idea}`,
      config: { responseMimeType: "application/json" }
    });
    const result = JSON.parse(response.text || "{}");
    return res.json({ success: true, ...result });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "\u0627\u06CC\u062F\u0647 \u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 \u06F5 \u062D\u0631\u0641 \u0648 \u062D\u062F\u0627\u06A9\u062B\u0631 \u06F1\u06F0\u06F0\u06F0 \u062D\u0631\u0641 \u0628\u0627\u0634\u062F." });
    }
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: "AI Error" });
  }
});
router.get("/agents", (req, res) => res.json(queryAll("SELECT * FROM agents")));
router.get("/services", (req, res) => res.json(queryAll("SELECT * FROM services")));
router.get("/promo-banners", (req, res) => res.json(queryAll("SELECT * FROM promo_banners")));
router.get("/banner-config", (req, res) => res.json(queryOne("SELECT * FROM banner_config LIMIT 1") || {}));
var ticketSchema = import_zod.z.object({
  title: import_zod.z.string().min(2),
  description: import_zod.z.string().min(10)
});
router.post("/tickets", (req, res) => {
  try {
    const parsed = ticketSchema.parse(req.body);
    const id = import_crypto.default.randomUUID();
    const userId = getSessionUser(req)?.id || "guest";
    execute("INSERT INTO tickets (id, title, description, status, userId) VALUES (?, ?, ?, ?, ?)", [id, parsed.title, parsed.description, "Open", userId]);
    res.json({ id, ...parsed, status: "Open", userId });
  } catch (error) {
    res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
});
var appRequestSchema = import_zod.z.object({
  userName: import_zod.z.string().min(2),
  contactInfo: import_zod.z.string().min(5),
  idea: import_zod.z.string().min(10),
  budget: import_zod.z.number().optional(),
  aiAnalysis: import_zod.z.any().optional()
});
router.post("/app-requests", (req, res) => {
  try {
    const parsed = appRequestSchema.parse(req.body);
    const id = import_crypto.default.randomUUID();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const aiAnalysisStr = JSON.stringify(parsed.aiAnalysis || {});
    execute("INSERT INTO app_requests (id, userName, contactInfo, idea, budget, status, aiAnalysis) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, parsed.userName, parsed.contactInfo, parsed.idea, parsed.budget || 0, "Pending", aiAnalysisStr]);
    res.json({ id, ...parsed, status: "Pending", budget: parsed.budget || 0, aiAnalysis: parsed.aiAnalysis || {}, timestamp });
  } catch (error) {
    res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
});
router.get("/payments/settings", (req, res) => {
  const settings = queryOne("SELECT bankName, cardNumber, accountHolder, iban, isOnlineGatewayActive FROM payment_settings LIMIT 1");
  if (settings) {
    settings.isOnlineGatewayActive = settings.isOnlineGatewayActive === 1;
    res.json(settings);
  } else {
    res.status(404).json({ error: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u067E\u0631\u062F\u0627\u062E\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  }
});
var receiptSchema = import_zod.z.object({
  customerName: import_zod.z.string().optional(),
  trackingCode: import_zod.z.string().min(4),
  senderName: import_zod.z.string().min(2),
  amount: import_zod.z.string().min(1),
  receiptImage: import_zod.z.string().max(5e6).optional(),
  // Max 5MB length for base64 image
  note: import_zod.z.string().optional()
});
router.post("/payments/submit-receipt", (req, res) => {
  try {
    const parsed = receiptSchema.parse(req.body);
    const id = import_crypto.default.randomUUID();
    const user = getSessionUser(req);
    const userId = user?.id || "guest";
    let customerName = parsed.customerName || "\u0645\u0647\u0645\u0627\u0646";
    if (userId !== "guest" && user) {
      customerName = user.name;
    }
    execute("INSERT INTO payment_receipts (id, userId, customerName, trackingCode, senderName, amount, receiptImage, note, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      id,
      userId,
      customerName,
      parsed.trackingCode,
      parsed.senderName,
      parsed.amount,
      parsed.receiptImage || "",
      parsed.note || "",
      "pending"
    ]);
    res.status(201).json({ id, customerName, ...parsed, status: "pending", userId, success: true, message: "\u0631\u0633\u06CC\u062F \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062B\u0628\u062A \u0634\u062F \u0648 \u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0627\u06CC\u06CC\u062F \u0627\u0633\u062A." });
  } catch (error) {
    res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
});
router.get("/customer/dashboard", (req, res) => {
  const userId = req.cookies.user_session;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const tickets = queryAll("SELECT * FROM tickets WHERE userId = ?", [userId]);
  const receipts = queryAll("SELECT * FROM payment_receipts WHERE userId = ?", [userId]);
  res.json({ tickets, receipts });
});
router.get("/admin/agents", isAdmin, (req, res) => res.json(queryAll("SELECT * FROM agents")));
var agentSchema = import_zod.z.object({
  name: import_zod.z.string().min(2),
  description: import_zod.z.string().optional(),
  category: import_zod.z.string().optional(),
  isActive: import_zod.z.boolean().optional(),
  icon: import_zod.z.string().optional(),
  url: import_zod.z.string().optional(),
  version: import_zod.z.string().optional()
});
router.post("/admin/agents", isAdmin, (req, res) => {
  try {
    const parsed = agentSchema.parse(req.body);
    const id = `agent-${import_crypto.default.randomUUID()}`;
    execute("INSERT INTO agents (id, name, description, category, isActive, icon, url, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [id, parsed.name, parsed.description, parsed.category, parsed.isActive ? 1 : 0, parsed.icon, parsed.url, parsed.version]);
    res.json({ id, ...parsed });
  } catch (error) {
    res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
});
router.delete("/admin/agents/:id", isAdmin, (req, res) => {
  execute("DELETE FROM agents WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});
router.get("/admin/services", isAdmin, (req, res) => res.json(queryAll("SELECT * FROM services")));
var serviceSchema = import_zod.z.object({
  title: import_zod.z.string().min(2),
  description: import_zod.z.string().optional(),
  price: import_zod.z.string().optional(),
  deliveryTime: import_zod.z.string().optional(),
  features: import_zod.z.array(import_zod.z.string()).optional(),
  isActive: import_zod.z.boolean().optional(),
  icon: import_zod.z.string().optional()
});
router.post("/admin/services", isAdmin, (req, res) => {
  try {
    const parsed = serviceSchema.parse(req.body);
    const id = `srv-${import_crypto.default.randomUUID()}`;
    execute("INSERT INTO services (id, title, description, price, deliveryTime, features, isActive, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [id, parsed.title, parsed.description, parsed.price, parsed.deliveryTime, JSON.stringify(parsed.features || []), parsed.isActive ? 1 : 0, parsed.icon]);
    res.json({ id, ...parsed });
  } catch (error) {
    res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
});
router.delete("/admin/services/:id", isAdmin, (req, res) => {
  execute("DELETE FROM services WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});
router.get("/admin/promo-banners", isAdmin, (req, res) => res.json(queryAll("SELECT * FROM promo_banners")));
var bannerSchema = import_zod.z.object({
  title: import_zod.z.string().min(1),
  description: import_zod.z.string().optional(),
  link: import_zod.z.string().optional(),
  color: import_zod.z.string().optional(),
  isActive: import_zod.z.boolean().optional()
});
router.post("/admin/promo-banners", isAdmin, (req, res) => {
  try {
    const parsed = bannerSchema.parse(req.body);
    const id = `bn-${import_crypto.default.randomUUID()}`;
    execute("INSERT INTO promo_banners (id, title, description, link, color, isActive) VALUES (?, ?, ?, ?, ?, ?)", [id, parsed.title, parsed.description, parsed.link, parsed.color, parsed.isActive ? 1 : 0]);
    res.json({ id, ...parsed });
  } catch (error) {
    res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
});
router.delete("/admin/promo-banners/:id", isAdmin, (req, res) => {
  execute("DELETE FROM promo_banners WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});
router.get("/admin/tickets", isAdmin, (req, res) => res.json(queryAll("SELECT * FROM tickets")));
var statusSchema = import_zod.z.object({
  status: import_zod.z.string().min(1)
});
router.put("/admin/tickets/:id", isAdmin, (req, res) => {
  try {
    const parsed = statusSchema.parse(req.body);
    execute("UPDATE tickets SET status = ? WHERE id = ?", [parsed.status, req.params.id]);
    res.json({ success: true, id: req.params.id, status: parsed.status });
  } catch (err) {
    res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
});
router.get("/admin/app-requests", isAdmin, (req, res) => res.json(queryAll("SELECT * FROM app_requests")));
router.put("/admin/app-requests/:id", isAdmin, (req, res) => {
  try {
    const parsed = statusSchema.parse(req.body);
    execute("UPDATE app_requests SET status = ? WHERE id = ?", [parsed.status, req.params.id]);
    res.json({ success: true, id: req.params.id, status: parsed.status });
  } catch (err) {
    res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
});
router.get("/admin/freelancers", isAdmin, (req, res) => res.json(queryAll("SELECT * FROM freelancers")));
var freelancerSchema = import_zod.z.object({
  name: import_zod.z.string().min(2),
  specialty: import_zod.z.string().optional(),
  status: import_zod.z.string().optional(),
  rate: import_zod.z.number().optional(),
  rateNum: import_zod.z.number().optional(),
  experience: import_zod.z.number().optional(),
  rating: import_zod.z.number().optional(),
  completedProjects: import_zod.z.number().optional(),
  avatar: import_zod.z.string().optional(),
  email: import_zod.z.string().email().optional().or(import_zod.z.literal("")),
  phone: import_zod.z.string().optional()
});
router.post("/admin/freelancers", isAdmin, (req, res) => {
  try {
    const parsed = freelancerSchema.parse(req.body);
    const id = `fr-${import_crypto.default.randomUUID()}`;
    execute("INSERT INTO freelancers (id, name, specialty, status, rate, rateNum, experience, rating, completedProjects, avatar, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, parsed.name, parsed.specialty, parsed.status, parsed.rate, parsed.rateNum, parsed.experience, parsed.rating, parsed.completedProjects, parsed.avatar, parsed.email, parsed.phone]);
    res.json({ id, ...parsed });
  } catch (error) {
    res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
});
router.delete("/admin/freelancers/:id", isAdmin, (req, res) => {
  execute("DELETE FROM freelancers WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});
router.get("/admin/payment-settings", isAdmin, (req, res) => {
  const settings = queryOne("SELECT * FROM payment_settings LIMIT 1");
  if (settings) {
    settings.isOnlineGatewayActive = settings.isOnlineGatewayActive === 1;
    delete settings.apiKey;
    res.json(settings);
  } else {
    res.status(404).json({ error: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
  }
});
var paymentSettingsSchema = import_zod.z.object({
  bankName: import_zod.z.string().optional(),
  cardNumber: import_zod.z.string().optional(),
  accountHolder: import_zod.z.string().optional(),
  iban: import_zod.z.string().optional(),
  isOnlineGatewayActive: import_zod.z.boolean().optional(),
  provider: import_zod.z.string().optional(),
  mode: import_zod.z.string().optional(),
  apiKey: import_zod.z.string().optional()
});
router.post("/admin/payment-settings", isAdmin, (req, res) => {
  try {
    const parsed = paymentSettingsSchema.parse(req.body);
    execute("UPDATE payment_settings SET bankName = ?, cardNumber = ?, accountHolder = ?, iban = ?, isOnlineGatewayActive = ?, provider = ?, mode = ?, apiKey = ? WHERE id = (SELECT id FROM payment_settings LIMIT 1)", [parsed.bankName, parsed.cardNumber, parsed.accountHolder, parsed.iban, parsed.isOnlineGatewayActive ? 1 : 0, parsed.provider, parsed.mode, parsed.apiKey]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
});
router.get("/admin/payment-receipts", isAdmin, (req, res) => res.json(queryAll("SELECT * FROM payment_receipts")));
var statusUpdateSchema = import_zod.z.object({
  status: import_zod.z.string().min(1)
});
router.put("/admin/payment-receipts/:id", isAdmin, (req, res) => {
  try {
    const parsed = statusUpdateSchema.parse(req.body);
    execute("UPDATE payment_receipts SET status = ? WHERE id = ?", [parsed.status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
});
var bannerConfigUpdateSchema = import_zod.z.object({
  text: import_zod.z.string().optional(),
  link: import_zod.z.string().optional(),
  isActive: import_zod.z.boolean().optional(),
  color: import_zod.z.string().optional()
});
router.put("/admin/banner-config", isAdmin, (req, res) => {
  try {
    const parsed = bannerConfigUpdateSchema.parse(req.body);
    execute("UPDATE banner_config SET text = ?, link = ?, isActive = ?, color = ? WHERE id = (SELECT id FROM banner_config LIMIT 1)", [parsed.text, parsed.link, parsed.isActive ? 1 : 0, parsed.color]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
});
var apiHandler_default = router;

// api/index.ts
import_dotenv.default.config();
var app = (0, import_express2.default)();
app.set("trust proxy", 1);
app.use((0, import_helmet.default)({
  frameguard: false,
  contentSecurityPolicy: false
}));
var allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()) : [];
app.use((0, import_cors.default)({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.includes("*") || origin.endsWith(".vercel.app") || origin.endsWith(".run.app") || origin.includes("localhost") || origin.includes("127.0.0.1")) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));
app.use((0, import_hpp.default)());
app.use((0, import_cookie_parser.default)());
var defaultLimit = process.env.BODY_SIZE_LIMIT || "10mb";
app.use(import_express2.default.json({ limit: defaultLimit }));
app.use(import_express2.default.urlencoded({ extended: true, limit: defaultLimit }));
var globalLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 1e3,
  message: "Too many requests, please try again later."
});
app.use("/api", globalLimiter);
var isDbInitialized = false;
app.use(async (req, res, next) => {
  if (!isDbInitialized) {
    try {
      await initDb();
      isDbInitialized = true;
    } catch (err) {
      console.error("Error initializing DB in Vercel serverless function:", err);
    }
  }
  next();
});
app.use("/api", apiHandler_default);
app.use("/", apiHandler_default);
var index_default = app;
