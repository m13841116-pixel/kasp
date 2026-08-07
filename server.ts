import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import apiRouter from './src/server/apiHandler';
import { initDb } from './src/server/db';

dotenv.config();

async function startServer() {
  await initDb();
  const app = express();
  
  // NOTE: In AI Studio, the PORT MUST remain 3000. 
  // However, we allow process.env.PORT as a fallback for cPanel/standard deployments.
  const PORT = Number(process.env.PORT) || 3000;

  // Enable trust proxy for reverse proxies in Cloud Run / container ingress
  app.set('trust proxy', 1);

  // Content Security Policy & Frame Options
  app.use(helmet({
    frameguard: false, // Allow embedding in AI Studio preview iframe
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Vite dev and React
        styleSrc: ["'self'", "'unsafe-inline'"], // Needed for Tailwind/React
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:", "wss:", "ws:", process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).join(' ') : ''],
        fontSrc: ["'self'", "data:", "https:"],
        frameAncestors: ["*"], // Allow embedding in AI Studio preview iframe
      },
    },
  }));

  // CORS with allowlist
  const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()) : [];
  app.use(cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        origin.endsWith('.run.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }));

  app.use(hpp());
  app.use(cookieParser());
  
  // Body size limits
  const defaultLimit = process.env.BODY_SIZE_LIMIT || '2mb';
  app.use(express.json({ limit: defaultLimit }));
  app.use(express.urlencoded({ extended: true, limit: defaultLimit }));

  // Global Rate Limiting
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests, please try again later.'
  });
  app.use('/api', globalLimiter);

  // Strict Rate Limiting for Auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعدا تلاش کنید.' }
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/admin-login', authLimiter);
  app.use('/api/auth/signup', authLimiter);

  // Strict Rate Limiting for AI & Uploads
  const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: { success: false, error: 'محدودیت درخواست. لطفاً ساعتی دیگر امتحان کنید.' }
  });
  app.use('/api/improve-idea', strictLimiter);
  app.use('/api/payments/submit-receipt', strictLimiter);

  // Express API Router
  app.use('/api', apiRouter);

  // Vite Middleware in dev vs Static Assets serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/admin', (req, res) => {
      res.sendFile(path.join(distPath, 'admin.html'));
    });
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical failure during server startup:", err);
  process.exit(1);
});
