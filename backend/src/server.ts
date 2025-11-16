import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import consultationsRouter from './routes/consultations.js';
import creditsRouter from './routes/credits.js';
import paymentsRouter from './routes/payments.js';
import { logStartupStatus } from './services/startupValidation.js';
import { logger } from './services/logger.js';

dotenv.config();

// Validate all services before starting server
logStartupStatus();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Security middleware
app.use(helmet());

// CORS configuration - allow specific production domains
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://howmuchshouldiprice.com',
  'https://www.howmuchshouldiprice.com',
  // Railway preview URLs (optional wildcards are not supported directly, add known domains if needed)
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or tools with no Origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Ensure preflight responses include headers
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin as string | undefined;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

console.log('✅ CORS enabled for allowed origins');
console.log('📋 Allowed origins:', allowedOrigins);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

// Body parser
// Note: Webhook route uses express.raw() middleware directly
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint - must respond quickly
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cors: allowedOrigins,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

// Additional health check routes Railway might use
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'HowMuchShouldIPrice Backend API',
    status: 'running',
    health: '/health',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/consultations', consultationsRouter);
app.use('/api/credits', creditsRouter);
app.use('/api/payments', paymentsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Listening on 0.0.0.0:${PORT}`);
  console.log(`✅ Server is ready to accept connections`);
  
  // Log startup to database
  logger.systemStartup(PORT, process.env.NODE_ENV || 'development');
  
  // Keep-alive logging to prevent Railway from thinking the app is idle
  setInterval(() => {
    console.log(`💓 Server heartbeat - ${new Date().toISOString()}`);
  }, 30000); // Every 30 seconds
});

// Handle graceful shutdown - but log and investigate first
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received at:', new Date().toISOString());
  console.log('📊 Server uptime:', process.uptime(), 'seconds');
  console.log('📊 Memory usage:', process.memoryUsage());
  console.log('🔍 This should NOT happen immediately after start!');
  logger.systemShutdown('SIGTERM received');
  
  // Don't exit immediately - log and wait
  console.log('⏳ Waiting 5 seconds before shutdown...');
  
  setTimeout(() => {
    console.log('⚠️ Proceeding with graceful shutdown...');
    
    // Force exit after 10 seconds if graceful shutdown hangs
    const forceExitTimer = setTimeout(() => {
      console.error('❌ Graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, 10000);
    
    server.close(() => {
      clearTimeout(forceExitTimer);
      console.log('✅ Server closed gracefully');
      process.exit(0);
    });
    
    // Immediately stop accepting new connections
    server.closeAllConnections?.();
  }, 5000);
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT received, shutting down gracefully...');
  logger.systemShutdown('SIGINT received');
  
  const forceExitTimer = setTimeout(() => {
    console.error('❌ Graceful shutdown timeout, forcing exit');
    process.exit(1);
  }, 10000);
  
  server.close(() => {
    clearTimeout(forceExitTimer);
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
  
  server.closeAllConnections?.();
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  logger.systemError(error.message, error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  logger.systemError(`Unhandled rejection: ${reason}`);
  process.exit(1);
});

export default app;

