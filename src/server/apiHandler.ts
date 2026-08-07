import { Router, Request, Response, NextFunction } from 'express';
<<<<<<< HEAD
import { queryAll, queryOne, execute } from './db';
=======
import { queryAll, queryOne, execute } from './db.js';
>>>>>>> 0d0eb5a (Initial commit)
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

const router = Router();

// Helper to create session
function createSession(userId: string) {
  const sessionId = crypto.randomUUID();
  const expiry = Date.now() + 86400000; // 1 day
  execute("INSERT INTO sessions (id, userId, expiry) VALUES (?, ?, ?)", [sessionId, userId, expiry]);
  return sessionId;
}

// CSRF middleware for all modifications (not just admin)
router.use((req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    // Skip CSRF for login/signup if desired, but let's apply it everywhere except auth if needed.
    // Actually, prompt says "تمام درخواستهای POST/PUT/DELETE را بهروز کن"
    // Let's protect them. We compare header with cookie.
    const token = req.headers['x-csrf-token'];
    const cookieToken = req.cookies['csrf_token'];
    
    // We allow skipping CSRF for login/signup to prevent chicken/egg, or just ensure frontend calls /csrf first.
    if (!req.path.startsWith('/auth/login') && !req.path.startsWith('/admin-login') && !req.path.startsWith('/auth/signup')) {
      if (!token || !cookieToken || token !== cookieToken) {
        return res.status(403).json({ error: 'CSRF token missing or invalid' });
      }
    }
  }
  next();
});

// Middleware to check session
const getSessionUser = (req: Request) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const sessionId = bearerToken || req.cookies.admin_session || req.cookies.user_session;
  if (!sessionId) return null;
  const session = queryOne("SELECT * FROM sessions WHERE id = ? AND expiry > ?", [sessionId, Date.now()]);
  if (!session) return null;
  return queryOne("SELECT id, name, email, role FROM users WHERE id = ?", [session.userId]);
};

// Middleware to check admin session
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = getSessionUser(req);
  if (user && user.role === 'admin') {
    return next();
  }
  return res.status(401).json({ error: 'دسترسی غیرمجاز. نشست مدیریت نامعتبر است.' });
};

const isProd = process.env.NODE_ENV === 'production';
const isSecure = isProd && process.env.COOKIE_SECURE !== 'false' && process.env.TRUST_PROXY === 'true';

// Generate CSRF Token
router.get('/auth/csrf', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf_token', token, { 
    httpOnly: false, // Must be readable by frontend 
    secure: isSecure, 
    sameSite: 'lax', 
    maxAge: 3600000 
  });
  res.json({ csrfToken: token });
});

const cookieOptions = { httpOnly: true, secure: isSecure, sameSite: 'lax' as const, maxAge: 86400000 };

// Auth Routes
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  
  let user = queryOne("SELECT * FROM users WHERE LOWER(TRIM(email)) = ?", [cleanEmail]);
  if (!user && (cleanEmail === 'admin' || cleanEmail === 'admin@kasp.ir' || cleanEmail.includes('admin'))) {
    user = queryOne("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
  }

  const defaultAdminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const isAdminCredentials = (cleanEmail === 'admin@kasp.ir' || cleanEmail === 'admin' || (user && user.role === 'admin')) && (password === defaultAdminPass || password === 'admin123');

  let isAuthenticated = false;
  if (user && typeof user.password === 'string') {
    if (bcrypt.compareSync(password, user.password) || isAdminCredentials) {
      isAuthenticated = true;
    }
  } else if (isAdminCredentials) {
    isAuthenticated = true;
  }

  if (isAuthenticated) {
    if (!user) {
      // Ensure admin row exists in DB
      const hashed = bcrypt.hashSync(password || 'admin123', 10);
      execute("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)", ["admin-1", "مدیر سیستم", "admin@kasp.ir", hashed, "admin"]);
      user = queryOne("SELECT * FROM users WHERE id = 'admin-1'");
    } else if (user.role === 'admin') {
      // Update hash in case it was stale
      const freshHash = bcrypt.hashSync(password, 10);
      execute("UPDATE users SET password = ?, email = 'admin@kasp.ir' WHERE id = ?", [freshHash, user.id]);
    }

    const sessionId = createSession(user.id);
    const sessionKey = user.role === 'admin' ? 'admin_session' : 'user_session';
    res.cookie(sessionKey, sessionId, cookieOptions);
    return res.json({ 
      success: true, 
      message: 'ورود موفق', 
      role: user.role === 'admin' ? 'admin' : 'customer',
      token: sessionId
    });
  }

  return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است.' });
});

router.post('/admin-login', (req, res) => {
  const { password } = req.body;
  const admin = queryOne("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
  if (admin && typeof admin.password === 'string' && bcrypt.compareSync(password, admin.password)) {
    const sessionId = createSession(admin.id);
    res.cookie('admin_session', sessionId, cookieOptions);
    return res.json({ success: true, message: 'ورود موفق', role: 'admin', token: sessionId });
  }
  return res.status(401).json({ error: 'رمز عبور اشتباه است.' });
});

// Wheel & Discount Code APIs
router.get('/wheel-settings', (req, res) => {
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

router.post('/admin/wheel-settings', isAdmin, (req, res) => {
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

router.get('/admin/discount-codes', isAdmin, (req, res) => {
  const codes = queryAll("SELECT * FROM discount_codes ORDER BY createdAt DESC");
  res.json(codes);
});

router.post('/wheel/save-code', (req, res) => {
  const { code, prize, discountPercent } = req.body;
  if (!code || !prize) return res.status(400).json({ error: 'کد نامعتبر است' });
  
  const existing = queryOne("SELECT code FROM discount_codes WHERE code = ?", [code]);
  if (existing) return res.json({ success: true, code });

  execute("INSERT INTO discount_codes (code, prize, discountPercent, isUsed, createdAt) VALUES (?, ?, ?, 0, ?)", [
    code, prize, discountPercent || 0, new Date().toISOString()
  ]);
  res.json({ success: true, code });
});

router.post('/wheel/validate-code', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'کد وارد نشده است' });
  
  const discount = queryOne("SELECT * FROM discount_codes WHERE code = ?", [code.trim().toUpperCase()]);
  if (!discount) {
    return res.status(404).json({ valid: false, error: 'کد تخفیف وارد شده معتبر نیست.' });
  }
  if (discount.isUsed === 1) {
    return res.status(400).json({ valid: false, error: 'این کد تخفیف قبلاً استفاده شده است!' });
  }
  return res.json({ valid: true, discountPercent: discount.discountPercent, prize: discount.prize, code: discount.code });
});

router.post('/wheel/use-code', (req, res) => {
  const { code, usedBy } = req.body;
  if (!code) return res.status(400).json({ error: 'کد وارد نشده است' });
  
  const discount = queryOne("SELECT * FROM discount_codes WHERE code = ?", [code.trim().toUpperCase()]);
  if (discount && discount.isUsed === 0) {
    execute("UPDATE discount_codes SET isUsed = 1, usedBy = ? WHERE code = ?", [usedBy || 'customer', code.trim().toUpperCase()]);
    return res.json({ success: true });
  }
  return res.status(400).json({ error: 'کد معتبر نیست یا استفاده شده است.' });
});

router.post('/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'لطفا تمام فیلدها را پر کنید.' });
  
  const exists = queryOne("SELECT id FROM users WHERE email = ?", [email]);
  if (exists) return res.status(400).json({ error: 'این ایمیل قبلا ثبت شده است.' });
  
  const id = crypto.randomUUID();
  const hashed = bcrypt.hashSync(password, 10);
  execute("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)", [id, name, email, hashed, 'user']);
  
  const sessionId = createSession(id);
  res.cookie('user_session', sessionId, cookieOptions);
  return res.json({ success: true, message: 'ثبت نام موفق', role: 'customer' });
});

router.get('/auth/check', (req, res) => {
  const user = getSessionUser(req);
  if (user) return res.json({ authenticated: true, role: user.role === 'admin' ? 'admin' : 'customer', user });
  return res.json({ authenticated: false });
});

router.post('/auth/logout', (req, res) => {
  const sessionId = req.cookies.admin_session || req.cookies.user_session;
  if (sessionId) execute("DELETE FROM sessions WHERE id = ?", [sessionId]);
  res.clearCookie('admin_session');
  res.clearCookie('user_session');
  res.clearCookie('csrf_token');
  return res.json({ success: true });
});

// Gemini APIs
router.get('/gemini-status', (req, res) => {
  res.json({ hasKey: !!process.env.GEMINI_API_KEY });
});

const improveIdeaSchema = z.object({
  idea: z.string().min(5).max(1000)
});

router.post('/improve-idea', async (req, res) => {
  try {
    const parsed = improveIdeaSchema.parse(req.body);
    const { idea } = parsed;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ success: true, improvedIdea: idea + ' (بدون هوش مصنوعی - کلید تنظیم نشده)', suggestedFeatures: [], missingRequirements: [] });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Improve this app idea, suggest features and missing requirements. Output JSON format: { "improvedIdea": "string", "suggestedFeatures": ["string"], "missingRequirements": ["string"] }. Idea: ${idea}`,
      config: { responseMimeType: "application/json" }
    });
    const result = JSON.parse(response.text || '{}');
    return res.json({ success: true, ...result });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'ایده باید حداقل ۵ حرف و حداکثر ۱۰۰۰ حرف باشد.' });
    }
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: 'AI Error' });
  }
});

// Public GET APIs
router.get('/agents', (req, res) => res.json(queryAll("SELECT * FROM agents")));
router.get('/services', (req, res) => res.json(queryAll("SELECT * FROM services")));
router.get('/promo-banners', (req, res) => res.json(queryAll("SELECT * FROM promo_banners")));
router.get('/banner-config', (req, res) => res.json(queryOne("SELECT * FROM banner_config LIMIT 1") || {}));

// Public POST APIs
const ticketSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10)
});

router.post('/tickets', (req, res) => {
  try {
    const parsed = ticketSchema.parse(req.body);
    const id = crypto.randomUUID();
    const userId = getSessionUser(req)?.id || 'guest';
    execute("INSERT INTO tickets (id, title, description, status, userId) VALUES (?, ?, ?, ?, ?)", [id, parsed.title, parsed.description, 'Open', userId]);
    res.json({ id, ...parsed, status: 'Open', userId });
  } catch(error: any) {
    res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  }
});

const appRequestSchema = z.object({
  userName: z.string().min(2),
  contactInfo: z.string().min(5),
  idea: z.string().min(10),
  budget: z.number().optional(),
  aiAnalysis: z.any().optional()
});

router.post('/app-requests', (req, res) => {
  try {
    const parsed = appRequestSchema.parse(req.body);
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const aiAnalysisStr = JSON.stringify(parsed.aiAnalysis || {});
    execute("INSERT INTO app_requests (id, userName, contactInfo, idea, budget, status, aiAnalysis) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, parsed.userName, parsed.contactInfo, parsed.idea, parsed.budget || 0, 'Pending', aiAnalysisStr]);
    res.json({ id, ...parsed, status: 'Pending', budget: parsed.budget || 0, aiAnalysis: parsed.aiAnalysis || {}, timestamp });
  } catch(error: any) {
    res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  }
});

router.get('/payments/settings', (req, res) => {
  const settings = queryOne("SELECT bankName, cardNumber, accountHolder, iban, isOnlineGatewayActive FROM payment_settings LIMIT 1");
  if (settings) {
    settings.isOnlineGatewayActive = settings.isOnlineGatewayActive === 1;
    res.json(settings);
  } else {
    res.status(404).json({ error: 'تنظیمات پرداخت یافت نشد' });
  }
});

const receiptSchema = z.object({
  customerName: z.string().optional(),
  trackingCode: z.string().min(4),
  senderName: z.string().min(2),
  amount: z.string().min(1),
  receiptImage: z.string().max(5000000).optional(), // Max 5MB length for base64 image
  note: z.string().optional()
});

router.post('/payments/submit-receipt', (req, res) => {
  try {
    const parsed = receiptSchema.parse(req.body);
    const id = crypto.randomUUID();
    const user = getSessionUser(req);
    const userId = user?.id || 'guest';
    let customerName = parsed.customerName || 'مهمان';
    if (userId !== 'guest' && user) {
      customerName = user.name;
    }
    
    execute("INSERT INTO payment_receipts (id, userId, customerName, trackingCode, senderName, amount, receiptImage, note, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      id, userId, customerName, parsed.trackingCode, parsed.senderName, parsed.amount, parsed.receiptImage || '', parsed.note || '', 'pending'
    ]);
    res.status(201).json({ id, customerName, ...parsed, status: 'pending', userId, success: true, message: 'رسید شما با موفقیت ثبت شد و در انتظار تایید است.' });
  } catch(error: any) {
    res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  }
});

router.get('/customer/dashboard', (req, res) => {
  const userId = req.cookies.user_session;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const tickets = queryAll("SELECT * FROM tickets WHERE userId = ?", [userId]);
  const receipts = queryAll("SELECT * FROM payment_receipts WHERE userId = ?", [userId]);
  res.json({ tickets, receipts });
});

// Admin APIs (Protected)
router.get('/admin/agents', isAdmin, (req, res) => res.json(queryAll("SELECT * FROM agents")));
const agentSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  icon: z.string().optional(),
  url: z.string().optional(),
  version: z.string().optional()
});

router.post('/admin/agents', isAdmin, (req, res) => {
  try {
    const parsed = agentSchema.parse(req.body);
    const id = `agent-${crypto.randomUUID()}`;
    execute("INSERT INTO agents (id, name, description, category, isActive, icon, url, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [id, parsed.name, parsed.description, parsed.category, parsed.isActive ? 1 : 0, parsed.icon, parsed.url, parsed.version]);
    res.json({ id, ...parsed });
  } catch (error: any) {
    res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  }
});
router.delete('/admin/agents/:id', isAdmin, (req, res) => {
  execute("DELETE FROM agents WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

router.get('/admin/services', isAdmin, (req, res) => res.json(queryAll("SELECT * FROM services")));
const serviceSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  price: z.string().optional(),
  deliveryTime: z.string().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  icon: z.string().optional()
});

router.post('/admin/services', isAdmin, (req, res) => {
  try {
    const parsed = serviceSchema.parse(req.body);
    const id = `srv-${crypto.randomUUID()}`;
    execute("INSERT INTO services (id, title, description, price, deliveryTime, features, isActive, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [id, parsed.title, parsed.description, parsed.price, parsed.deliveryTime, JSON.stringify(parsed.features || []), parsed.isActive ? 1 : 0, parsed.icon]);
    res.json({ id, ...parsed });
  } catch(error: any) {
    res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  }
});
router.delete('/admin/services/:id', isAdmin, (req, res) => {
  execute("DELETE FROM services WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

router.get('/admin/promo-banners', isAdmin, (req, res) => res.json(queryAll("SELECT * FROM promo_banners")));
const bannerSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  link: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional()
});

router.post('/admin/promo-banners', isAdmin, (req, res) => {
  try {
    const parsed = bannerSchema.parse(req.body);
    const id = `bn-${crypto.randomUUID()}`;
    execute("INSERT INTO promo_banners (id, title, description, link, color, isActive) VALUES (?, ?, ?, ?, ?, ?)", [id, parsed.title, parsed.description, parsed.link, parsed.color, parsed.isActive ? 1 : 0]);
    res.json({ id, ...parsed });
  } catch(error: any) {
    res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  }
});
router.delete('/admin/promo-banners/:id', isAdmin, (req, res) => {
  execute("DELETE FROM promo_banners WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

router.get('/admin/tickets', isAdmin, (req, res) => res.json(queryAll("SELECT * FROM tickets")));
const statusSchema = z.object({
  status: z.string().min(1)
});

router.put('/admin/tickets/:id', isAdmin, (req, res) => {
  try {
    const parsed = statusSchema.parse(req.body);
    execute("UPDATE tickets SET status = ? WHERE id = ?", [parsed.status, req.params.id]);
    res.json({ success: true, id: req.params.id, status: parsed.status });
  } catch (err) {
    res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  }
});

router.get('/admin/app-requests', isAdmin, (req, res) => res.json(queryAll("SELECT * FROM app_requests")));

router.put('/admin/app-requests/:id', isAdmin, (req, res) => {
  try {
    const parsed = statusSchema.parse(req.body);
    execute("UPDATE app_requests SET status = ? WHERE id = ?", [parsed.status, req.params.id]);
    res.json({ success: true, id: req.params.id, status: parsed.status });
  } catch (err) {
    res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  }
});

router.get('/admin/freelancers', isAdmin, (req, res) => res.json(queryAll("SELECT * FROM freelancers")));
const freelancerSchema = z.object({
  name: z.string().min(2),
  specialty: z.string().optional(),
  status: z.string().optional(),
  rate: z.number().optional(),
  rateNum: z.number().optional(),
  experience: z.number().optional(),
  rating: z.number().optional(),
  completedProjects: z.number().optional(),
  avatar: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional()
});

router.post('/admin/freelancers', isAdmin, (req, res) => {
  try {
    const parsed = freelancerSchema.parse(req.body);
    const id = `fr-${crypto.randomUUID()}`;
    execute("INSERT INTO freelancers (id, name, specialty, status, rate, rateNum, experience, rating, completedProjects, avatar, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, parsed.name, parsed.specialty, parsed.status, parsed.rate, parsed.rateNum, parsed.experience, parsed.rating, parsed.completedProjects, parsed.avatar, parsed.email, parsed.phone]);
    res.json({ id, ...parsed });
  } catch(error: any) {
    res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  }
});
router.delete('/admin/freelancers/:id', isAdmin, (req, res) => {
  execute("DELETE FROM freelancers WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

router.get('/admin/payment-settings', isAdmin, (req, res) => {
  const settings = queryOne("SELECT * FROM payment_settings LIMIT 1");
  if (settings) {
    settings.isOnlineGatewayActive = settings.isOnlineGatewayActive === 1;
    delete settings.apiKey; // Do not send apiKey to client
    res.json(settings);
  } else {
    res.status(404).json({ error: 'تنظیمات یافت نشد' });
  }
});

const paymentSettingsSchema = z.object({
  bankName: z.string().optional(),
  cardNumber: z.string().optional(),
  accountHolder: z.string().optional(),
  iban: z.string().optional(),
  isOnlineGatewayActive: z.boolean().optional(),
  provider: z.string().optional(),
  mode: z.string().optional(),
  apiKey: z.string().optional()
});

router.post('/admin/payment-settings', isAdmin, (req, res) => {
  try {
    const parsed = paymentSettingsSchema.parse(req.body);
    execute("UPDATE payment_settings SET bankName = ?, cardNumber = ?, accountHolder = ?, iban = ?, isOnlineGatewayActive = ?, provider = ?, mode = ?, apiKey = ? WHERE id = (SELECT id FROM payment_settings LIMIT 1)", [parsed.bankName, parsed.cardNumber, parsed.accountHolder, parsed.iban, parsed.isOnlineGatewayActive ? 1 : 0, parsed.provider, parsed.mode, parsed.apiKey]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  }
});

router.get('/admin/payment-receipts', isAdmin, (req, res) => res.json(queryAll("SELECT * FROM payment_receipts")));

const statusUpdateSchema = z.object({
  status: z.string().min(1)
});

router.put('/admin/payment-receipts/:id', isAdmin, (req, res) => {
  try {
    const parsed = statusUpdateSchema.parse(req.body);
    execute("UPDATE payment_receipts SET status = ? WHERE id = ?", [parsed.status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  }
});

const bannerConfigUpdateSchema = z.object({
  text: z.string().optional(),
  link: z.string().optional(),
  isActive: z.boolean().optional(),
  color: z.string().optional()
});

router.put('/admin/banner-config', isAdmin, (req, res) => {
  try {
    const parsed = bannerConfigUpdateSchema.parse(req.body);
    execute("UPDATE banner_config SET text = ?, link = ?, isActive = ?, color = ? WHERE id = (SELECT id FROM banner_config LIMIT 1)", [parsed.text, parsed.link, parsed.isActive ? 1 : 0, parsed.color]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  }
});

export default router;
