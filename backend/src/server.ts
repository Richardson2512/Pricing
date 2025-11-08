import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import consultationsRouter from './routes/consultations.js';
import creditsRouter from './routes/credits.js';
import paymentsRouter from './routes/payments.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Security middleware
app.use(helmet());

// CORS configuration - Allow all production domains
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'http://localhost:5174', // Alternative local port
  'https://howmuchshouldiprice.com', // Production (non-www)
  'https://www.howmuchshouldiprice.com', // Production (www)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
}));

console.log('✅ CORS enabled for:', allowedOrigins);

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cors: allowedOrigins,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
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
  
  // Keep-alive logging to prevent Railway from thinking the app is idle
  setInterval(() => {
    console.log(`💓 Server heartbeat - ${new Date().toISOString()}`);
  }, 30000); // Every 30 seconds
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received, shutting down gracefully...');
  
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
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT received, shutting down gracefully...');
  
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
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;

