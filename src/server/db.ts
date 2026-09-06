import { Pool } from 'pg';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const isVercel = Boolean(process.env.VERCEL || process.env.NOW_REGION);
const dataDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'database.sqlite');

let pool: Pool | null = null;
let sqliteDb: any = null;
let SQL: any = null;

let isPostgres = Boolean(process.env.DATABASE_URL);

export async function initDb() {
  if (isPostgres) {
    try {
      if (!pool) {
        pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false
          }
        });
        await createTablesPg();
        
        // Seed default data if users table is empty
        const existingUsers = await pool.query("SELECT * FROM users LIMIT 1");
        if (existingUsers.rowCount === 0) {
          await seedDataPg();
        }
        
        const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
        const hashed = bcrypt.hashSync(adminPass, 10);
        const existingAdmin = await pool.query("SELECT * FROM users WHERE role = 'admin'");
        if (existingAdmin.rowCount && existingAdmin.rowCount > 0) {
          await pool.query("UPDATE users SET email = 'admin@kasp.ir', password = $1 WHERE role = 'admin'", [hashed]);
        } else {
          await pool.query("INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)", ["admin-1", "مدیر سیستم", "admin@kasp.ir", hashed, "admin"]);
        }

        // Ensure wheel settings table has default row
        try {
          await pool.query("ALTER TABLE wheel_settings ADD COLUMN prizesConfig TEXT");
        } catch (e) {}

        const defaultPrizesJson = JSON.stringify([
          { id: 0, shortLabel: '۱۰٪ تخفیف', fullTitle: '۱۰٪ تخفیف ویژه توسعه نرم‌افزار', pct: 10, codePrefix: 'OFF10', color: '#ec4899', textColor: '#ffffff', weight: 20 },
          { id: 1, shortLabel: '۲۰٪ تخفیف', fullTitle: '۲۰٪ تخفیف ویژه سفارش پروژه', pct: 20, codePrefix: 'OFF20', color: '#8b5cf6', textColor: '#ffffff', weight: 20 },
          { id: 2, shortLabel: '۳۰٪ تخفیف', fullTitle: '۳۰٪ تخفیف طلایی طراحی نرم‌افزار', pct: 30, codePrefix: 'OFF30', color: '#3b82f6', textColor: '#ffffff', weight: 15 },
          { id: 3, shortLabel: '۸۰٪ تخفیف', fullTitle: '🔥 ۸۰٪ تخفیف استثنایی ویژه شروع کار', pct: 80, codePrefix: 'OFF80', color: '#f43f5e', textColor: '#ffffff', weight: 5 },
          { id: 4, shortLabel: 'دامنه .ir', fullTitle: '🌐 ۱ سال دامنه .ir رایگان', pct: 100, codePrefix: 'FREE-IR', color: '#06b6d4', textColor: '#ffffff', weight: 15 },
          { id: 5, shortLabel: 'اکانت زوپیت', fullTitle: '🛍️ اکانت فروشگاهی رایگان زوپیت (Zoopit.ir)', pct: 100, codePrefix: 'ZOOPIT', color: '#10b981', textColor: '#ffffff', weight: 10 },
          { id: 6, shortLabel: 'لوگو رایگان', fullTitle: '🎨 طراحی لوگو اختصاصی رایگان', pct: 100, codePrefix: 'FREE-LOGO', color: '#f59e0b', textColor: '#ffffff', weight: 10 },
          { id: 7, shortLabel: 'پشتیبانی', fullTitle: '🛡️ ۲ ماه پشتیبانی و نگهداری رایگان', pct: 100, codePrefix: 'FREE-SUP', color: '#6366f1', textColor: '#ffffff', weight: 5 },
          { id: 8, shortLabel: '۲ میلیون تومان', fullTitle: '💰 ۲,۰۰۰,۰۰۰ تومان اعتبار هدیه نقدی', pct: 100, codePrefix: 'CASH2M', color: '#eab308', textColor: '#ffffff', weight: 0 }
        ]);

        const wheelSetting = await pool.query("SELECT * FROM wheel_settings WHERE id = 1");
        if (wheelSetting.rowCount === 0) {
          await pool.query("INSERT INTO wheel_settings (id, maxSpins, prizesConfig) VALUES (1, 1, $1)", [defaultPrizesJson]);
        } else if (!wheelSetting.rows[0].prizesconfig && !wheelSetting.rows[0].prizesConfig) {
          await pool.query("UPDATE wheel_settings SET prizesConfig = $1 WHERE id = 1", [defaultPrizesJson]);
        }

        try {
          await pool.query("ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS assignedUserId TEXT;");
          await pool.query("ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS expiresAt TEXT;");
          await pool.query("ALTER TABLE ai_team_projects ADD COLUMN IF NOT EXISTS isPublic INTEGER DEFAULT 0;");
          await pool.query("ALTER TABLE ai_orders ADD COLUMN IF NOT EXISTS trackId TEXT;");
          await pool.query("ALTER TABLE ai_orders ADD COLUMN IF NOT EXISTS refNumber TEXT;");
          await pool.query("ALTER TABLE ai_orders ADD COLUMN IF NOT EXISTS gateway TEXT;");
          await pool.query("ALTER TABLE ai_orders ADD COLUMN IF NOT EXISTS cardNumber TEXT;");
          await pool.query("ALTER TABLE ai_orders ADD COLUMN IF NOT EXISTS errorMessage TEXT;");
        } catch (e) {}
      }
      return pool;
    } catch (pgErr) {
      console.warn('PostgreSQL connection failed, falling back to SQLite/in-memory DB:', pgErr);
      isPostgres = false;
      pool = null;
    }
  }

  if (sqliteDb) return sqliteDb;

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    SQL = await initSqlJs({
      locateFile: file => {
        const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file);
        if (fs.existsSync(wasmPath)) return wasmPath;
        return file;
      }
    });

    if (fs.existsSync(dbPath)) {
      try {
        const filebuffer = fs.readFileSync(dbPath);
        sqliteDb = new SQL.Database(filebuffer);
      } catch (error) {
        console.error('CRITICAL ERROR: Failed to load existing database.', error);
        sqliteDb = new SQL.Database();
      }
    } else {
      sqliteDb = new SQL.Database();
    }

    try {
      createTablesSqlite();
    } catch (error) {
      console.error('Error creating tables on existing DB:', error);
      sqliteDb = new SQL.Database();
      createTablesSqlite();
    }

    const existingUsers = sqliteDb.exec("SELECT * FROM users");
    if (existingUsers.length === 0) {
      seedDataSqlite();
    }
    
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    const hashed = bcrypt.hashSync(adminPass, 10);
    const existingAdmin = sqliteDb.exec("SELECT * FROM users WHERE email = 'admin@kasp.ir'");
    if (existingAdmin.length > 0 && existingAdmin[0].values.length > 0) {
      sqliteDb.run("UPDATE users SET password = ? WHERE email = 'admin@kasp.ir'", [hashed]);
    } else {
      sqliteDb.run("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)", ["admin-1", "مدیر سیستم", "admin@kasp.ir", hashed, "admin"]);
    }

    try {
      sqliteDb.run("ALTER TABLE wheel_settings ADD COLUMN prizesConfig TEXT");
    } catch (e) {}
    try {
      sqliteDb.run("ALTER TABLE discount_codes ADD COLUMN assignedUserId TEXT");
    } catch (e) {}
    try {
      sqliteDb.run("ALTER TABLE discount_codes ADD COLUMN expiresAt TEXT");
    } catch (e) {}
    try {
      sqliteDb.run("ALTER TABLE ai_team_projects ADD COLUMN isPublic INTEGER DEFAULT 0");
    } catch (e) {}
    try {
      sqliteDb.run("ALTER TABLE ai_orders ADD COLUMN trackId TEXT");
    } catch (e) {}
    try {
      sqliteDb.run("ALTER TABLE ai_orders ADD COLUMN refNumber TEXT");
    } catch (e) {}
    try {
      sqliteDb.run("ALTER TABLE ai_orders ADD COLUMN gateway TEXT");
    } catch (e) {}
    try {
      sqliteDb.run("ALTER TABLE ai_orders ADD COLUMN cardNumber TEXT");
    } catch (e) {}
    try {
      sqliteDb.run("ALTER TABLE ai_orders ADD COLUMN errorMessage TEXT");
    } catch (e) {}

        const defaultPrizesJson = JSON.stringify([
      { id: 0, shortLabel: '۱۰٪ تخفیف', fullTitle: '۱۰٪ تخفیف ویژه توسعه نرم‌افزار', pct: 10, codePrefix: 'OFF10', color: '#ec4899', textColor: '#ffffff', weight: 20 },
      { id: 1, shortLabel: '۲۰٪ تخفیف', fullTitle: '۲۰٪ تخفیف ویژه سفارش پروژه', pct: 20, codePrefix: 'OFF20', color: '#8b5cf6', textColor: '#ffffff', weight: 20 },
      { id: 2, shortLabel: '۳۰٪ تخفیف', fullTitle: '۳۰٪ تخفیف طلایی طراحی نرم‌افزار', pct: 30, codePrefix: 'OFF30', color: '#3b82f6', textColor: '#ffffff', weight: 15 },
      { id: 3, shortLabel: '۸۰٪ تخفیف', fullTitle: '🔥 ۸۰٪ تخفیف استثنایی ویژه شروع کار', pct: 80, codePrefix: 'OFF80', color: '#f43f5e', textColor: '#ffffff', weight: 5 },
      { id: 4, shortLabel: 'دامنه .ir', fullTitle: '🌐 ۱ سال دامنه .ir رایگان', pct: 100, codePrefix: 'FREE-IR', color: '#06b6d4', textColor: '#ffffff', weight: 15 },
      { id: 5, shortLabel: 'اکانت زوپیت', fullTitle: '🛍️ اکانت فروشگاهی رایگان زوپیت (Zoopit.ir)', pct: 100, codePrefix: 'ZOOPIT', color: '#10b981', textColor: '#ffffff', weight: 10 },
      { id: 6, shortLabel: 'لوگو رایگان', fullTitle: '🎨 طراحی لوگو اختصاصی رایگان', pct: 100, codePrefix: 'FREE-LOGO', color: '#f59e0b', textColor: '#ffffff', weight: 10 },
      { id: 7, shortLabel: 'پشتیبانی', fullTitle: '🛡️ ۲ ماه پشتیبانی و نگهداری رایگان', pct: 100, codePrefix: 'FREE-SUP', color: '#6366f1', textColor: '#ffffff', weight: 5 },
      { id: 8, shortLabel: '۲ میلیون تومان', fullTitle: '💰 ۲,۰۰۰,۰۰۰ تومان اعتبار هدیه نقدی', pct: 100, codePrefix: 'CASH2M', color: '#eab308', textColor: '#ffffff', weight: 0 },
    ]);

    const wheelSetting = sqliteDb.exec("SELECT * FROM wheel_settings WHERE id = 1");
    if (wheelSetting.length === 0) {
      sqliteDb.run("INSERT INTO wheel_settings (id, maxSpins, prizesConfig) VALUES (1, 1, ?)", [defaultPrizesJson]);
    } else {
      const currentConfigStr = wheelSetting[0]?.values?.[0]?.[2] || '';
      if (typeof currentConfigStr === 'string' && (currentConfigStr.includes('۲M') || currentConfigStr.includes('جایزه نقدی'))) {
        sqliteDb.run("UPDATE wheel_settings SET prizesConfig = ? WHERE id = 1", [defaultPrizesJson]);
      }
    }
    
    saveDb();
    return sqliteDb;
}

export function saveDb() {
  if (!isPostgres && sqliteDb) {
    try {
      const data = sqliteDb.export();
      const buffer = Buffer.from(data);
      const tempPath = dbPath + '.tmp';
      fs.writeFileSync(tempPath, buffer);
      fs.renameSync(tempPath, dbPath);
    } catch (err) {
      console.warn('Warning: Failed to save database to disk:', err);
    }
  }
}

async function createTablesPg() {
  await pool!.query(`
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
      expiry BIGINT
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
      id SERIAL PRIMARY KEY,
      bankName TEXT,
      cardNumber TEXT,
      accountHolder TEXT,
      iban TEXT,
      isOnlineGatewayActive INTEGER,
      provider TEXT,
      mode TEXT,
      apiKey TEXT
    );
    CREATE TABLE IF NOT EXISTS banner_config (
      id SERIAL PRIMARY KEY,
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
      assignedUserId TEXT,
      expiresAt TEXT,
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS wheel_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      maxSpins INTEGER DEFAULT 3,
      prizesConfig TEXT
    );
    CREATE TABLE IF NOT EXISTS ai_team_projects (
      id TEXT PRIMARY KEY,
      userId TEXT,
      businessGoal TEXT,
      reportData TEXT,
      isPublic INTEGER DEFAULT 0,
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS ai_entitlements (
      id TEXT PRIMARY KEY,
      userId TEXT,
      productCode TEXT,
      creditsTotal INTEGER DEFAULT 0,
      creditsRemaining INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      createdAt TEXT,
      expiresAt TEXT
    );
    CREATE TABLE IF NOT EXISTS ai_orders (
      id TEXT PRIMARY KEY,
      userId TEXT,
      productCode TEXT,
      amount REAL,
      status TEXT DEFAULT 'PENDING',
      credits INTEGER DEFAULT 1,
      createdAt TEXT,
      paidAt TEXT,
      receiptId TEXT,
      trackId TEXT,
      refNumber TEXT,
      gateway TEXT,
      cardNumber TEXT,
      errorMessage TEXT
    );
  `);
}

function createTablesSqlite() {
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT);
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, userId TEXT, expiry INTEGER);
    CREATE TABLE IF NOT EXISTS agents (id TEXT PRIMARY KEY, name TEXT, description TEXT, category TEXT, isActive INTEGER, icon TEXT, url TEXT, version TEXT);
    CREATE TABLE IF NOT EXISTS services (id TEXT PRIMARY KEY, title TEXT, description TEXT, price TEXT, deliveryTime TEXT, features TEXT, isActive INTEGER, icon TEXT);
    CREATE TABLE IF NOT EXISTS promo_banners (id TEXT PRIMARY KEY, title TEXT, description TEXT, link TEXT, color TEXT, isActive INTEGER);
    CREATE TABLE IF NOT EXISTS tickets (id TEXT PRIMARY KEY, title TEXT, description TEXT, status TEXT, userId TEXT);
    CREATE TABLE IF NOT EXISTS freelancers (id TEXT PRIMARY KEY, name TEXT, specialty TEXT, status TEXT, rate REAL, rateNum INTEGER, experience INTEGER, rating REAL, completedProjects INTEGER, avatar TEXT, email TEXT, phone TEXT);
    CREATE TABLE IF NOT EXISTS app_requests (id TEXT PRIMARY KEY, userName TEXT, contactInfo TEXT, idea TEXT, budget REAL, status TEXT, aiAnalysis TEXT);
    CREATE TABLE IF NOT EXISTS payment_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, bankName TEXT, cardNumber TEXT, accountHolder TEXT, iban TEXT, isOnlineGatewayActive INTEGER, provider TEXT, mode TEXT, apiKey TEXT);
    CREATE TABLE IF NOT EXISTS banner_config (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, link TEXT, isActive INTEGER, color TEXT);
    CREATE TABLE IF NOT EXISTS discount_codes (code TEXT PRIMARY KEY, prize TEXT, discountPercent INTEGER, isUsed INTEGER DEFAULT 0, usedBy TEXT, assignedUserId TEXT, expiresAt TEXT, createdAt TEXT);
    CREATE TABLE IF NOT EXISTS wheel_settings (id INTEGER PRIMARY KEY DEFAULT 1, maxSpins INTEGER DEFAULT 3);
    CREATE TABLE IF NOT EXISTS ai_team_projects (id TEXT PRIMARY KEY, userId TEXT, businessGoal TEXT, reportData TEXT, isPublic INTEGER DEFAULT 0, createdAt TEXT);
    CREATE TABLE IF NOT EXISTS ai_entitlements (id TEXT PRIMARY KEY, userId TEXT, productCode TEXT, creditsTotal INTEGER DEFAULT 0, creditsRemaining INTEGER DEFAULT 0, status TEXT DEFAULT 'active', createdAt TEXT, expiresAt TEXT);
    CREATE TABLE IF NOT EXISTS ai_orders (id TEXT PRIMARY KEY, userId TEXT, productCode TEXT, amount REAL, status TEXT DEFAULT 'PENDING', credits INTEGER DEFAULT 1, createdAt TEXT, paidAt TEXT, receiptId TEXT, trackId TEXT, refNumber TEXT, gateway TEXT, cardNumber TEXT, errorMessage TEXT);
  `);
}

async function seedDataPg() {
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const hashed = bcrypt.hashSync(adminPass, 10);
  await pool!.query("INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)", ["admin-1", "مدیر", "admin@kasp.ir", hashed, "admin"]);
  await pool!.query("INSERT INTO payment_settings (bankName, cardNumber, accountHolder, iban, isOnlineGatewayActive) VALUES ($1, $2, $3, $4, $5)", ["بانک ملت", "۶۱۰۴۳۳۷۹۰۰۰۰۰۰۰۰", "مدیر سایت", "IR000000000000000000000000", 0]);
  await pool!.query("INSERT INTO banner_config (text, link, isActive, color) VALUES ($1, $2, $3, $4)", ["خوش آمدید", "#", 1, "blue"]);
}

function seedDataSqlite() {
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const hashed = bcrypt.hashSync(adminPass, 10);
  sqliteDb.run("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)", ["admin-1", "مدیر", "admin@kasp.ir", hashed, "admin"]);
  sqliteDb.run("INSERT INTO payment_settings (bankName, cardNumber, accountHolder, iban, isOnlineGatewayActive) VALUES (?, ?, ?, ?, ?)", ["بانک ملت", "۶۱۰۴۳۳۷۹۰۰۰۰۰۰۰۰", "مدیر سایت", "IR000000000000000000000000", 0]);
  sqliteDb.run("INSERT INTO banner_config (text, link, isActive, color) VALUES (?, ?, ?, ?)", ["خوش آمدید", "#", 1, "blue"]);
}

function convertQueryToPg(sql: string) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}


const keyMap: Record<string, string> = {
  userid: 'userId',
  isactive: 'isActive',
  deliverytime: 'deliveryTime',
  ratenum: 'rateNum',
  completedprojects: 'completedProjects',
  username: 'userName',
  contactinfo: 'contactInfo',
  aianalysis: 'aiAnalysis',
  bankname: 'bankName',
  cardnumber: 'cardNumber',
  accountholder: 'accountHolder',
  isonlinegatewayactive: 'isOnlineGatewayActive',
  customername: 'customerName',
  trackingcode: 'trackingCode',
  sendername: 'senderName',
  receiptimage: 'receiptImage',
  discountpercent: 'discountPercent',
  isused: 'isUsed',
  usedby: 'usedBy',
  createdat: 'createdAt',
  maxspins: 'maxSpins',
  prizesconfig: 'prizesConfig',
  apikey: 'apiKey',
  ispublic: 'isPublic',
  productcode: 'productCode',
  creditstotal: 'creditsTotal',
  creditsremaining: 'creditsRemaining',
  expiresat: 'expiresAt',
  paidat: 'paidAt',
  receiptid: 'receiptId',
  orderid: 'orderId',
  producttype: 'productType'
};

function mapKeys(row: any) {
  if (!row) return row;
  const newRow: any = {};
  for (const key in row) {
    const mapped = keyMap[key] || key;
    newRow[mapped] = row[key];
  }
  return newRow;
}

export async function queryAll(sql: string, params: any[] = []) {
  try {
    if (isPostgres && pool) {
      const res = await pool.query(convertQueryToPg(sql), params);
      return res.rows.map(mapKeys);
    } else if (sqliteDb) {
      const stmt = sqliteDb.prepare(sql);
      stmt.bind(params);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    }
    return [];
  } catch (err) {
    console.error('Error in queryAll:', err);
    return [];
  }
}

export async function queryOne(sql: string, params: any[] = []) {
  try {
    if (isPostgres && pool) {
      const res = await pool.query(convertQueryToPg(sql), params);
      return res.rows.length ? mapKeys(res.rows[0]) : null;
    } else if (sqliteDb) {
      const stmt = sqliteDb.prepare(sql);
      stmt.bind(params);
      let result = null;
      if (stmt.step()) {
        result = stmt.getAsObject();
      }
      stmt.free();
      return result;
    }
    return null;
  } catch (err) {
    console.error('Error in queryOne:', err);
    return null;
  }
}

export async function execute(sql: string, params: any[] = []) {
  try {
    if (isPostgres && pool) {
      await pool.query(convertQueryToPg(sql), params);
    } else if (sqliteDb) {
      sqliteDb.run(sql, params);
      saveDb();
    }
  } catch (err) {
    console.error('Error in execute:', err);
  }
}
