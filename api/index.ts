import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import apiRouter from '../src/server/apiHandler.js';
import { initDb } from '../src/server/db.js';

dotenv.config();

const app = express();

// Trust proxy for Vercel edge
app.set('trust proxy', 1);

app.use(helmet({
  frameguard: false,
  contentSecurityPolicy: false,
}));

// CORS setup
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()) : [];
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      origin.endsWith('.vercel.app') ||
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

const defaultLimit = process.env.BODY_SIZE_LIMIT || '10mb';
app.use(express.json({ limit: defaultLimit }));
app.use(express.urlencoded({ extended: true, limit: defaultLimit }));

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please try again later.'
});
app.use('/api', globalLimiter);

let isDbInitialized = false;

app.use(async (req, res, next) => {
  if (!isDbInitialized) {
    try {
      await initDb();
      isDbInitialized = true;
    } catch (err) {
      console.error('Error initializing DB in Vercel serverless function:', err);
    }
  }
  next();
});

// Handle both /api/... and root relative paths when Vercel rewrites /api/(.*) to /api/index.ts
app.use('/api', apiRouter);
app.use('/', apiRouter);



// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({ success: false, error: 'خطای سرور: ' + (err.message || 'نامشخص') });
});


export default app;
