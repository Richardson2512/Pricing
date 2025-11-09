/**
 * Structured Logging Service
 * Provides consistent logging across the application
 */

import { supabaseAdmin } from '../config/supabase.js';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

export enum LogCategory {
  USER_ACTION = 'user_action',
  PAYMENT = 'payment',
  API_CALL = 'api_call',
  SCRAPING = 'scraping',
  AUTH = 'auth',
  SYSTEM = 'system',
}

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * Log to console and optionally to database
 */
export async function log(
  level: LogLevel,
  category: LogCategory,
  message: string,
  metadata?: Record<string, any>,
  userId?: string
) {
  const entry: LogEntry = {
    level,
    category,
    message,
    userId,
    metadata,
    timestamp: new Date().toISOString(),
  };

  // Console logging with emoji indicators
  const emoji = {
    [LogLevel.INFO]: 'ℹ️',
    [LogLevel.WARN]: '⚠️',
    [LogLevel.ERROR]: '❌',
    [LogLevel.DEBUG]: '🔍',
  };

  const categoryEmoji = {
    [LogCategory.USER_ACTION]: '👤',
    [LogCategory.PAYMENT]: '💳',
    [LogCategory.API_CALL]: '🌐',
    [LogCategory.SCRAPING]: '🕷️',
    [LogCategory.AUTH]: '🔐',
    [LogCategory.SYSTEM]: '⚙️',
  };

  const prefix = `${emoji[level]} ${categoryEmoji[category]}`;
  const logMessage = `${prefix} [${category}] ${message}`;

  switch (level) {
    case LogLevel.ERROR:
      console.error(logMessage, metadata || '');
      break;
    case LogLevel.WARN:
      console.warn(logMessage, metadata || '');
      break;
    case LogLevel.DEBUG:
      if (process.env.NODE_ENV === 'development') {
        console.log(logMessage, metadata || '');
      }
      break;
    default:
      console.log(logMessage, metadata || '');
  }

  // Store critical logs in database (async, non-blocking)
  if (level === LogLevel.ERROR || category === LogCategory.PAYMENT) {
    try {
      // Don't await - fire and forget
      supabaseAdmin.from('system_logs').insert({
        level,
        category,
        message,
        user_id: userId,
        metadata: metadata || {},
        created_at: entry.timestamp,
      }).then(() => {
        // Silently succeed
      }).catch((error) => {
        // Silently fail - don't crash on logging errors
        console.error('Failed to store log in database:', error.message);
      });
    } catch (error) {
      // Ignore logging errors
    }
  }
}

// Convenience methods
export const logger = {
  // User actions
  userSignUp: (userId: string, email: string) =>
    log(LogLevel.INFO, LogCategory.USER_ACTION, `User signed up: ${email}`, { email }, userId),

  userSignIn: (userId: string, email: string) =>
    log(LogLevel.INFO, LogCategory.USER_ACTION, `User signed in: ${email}`, { email }, userId),

  userSignOut: (userId: string) =>
    log(LogLevel.INFO, LogCategory.USER_ACTION, 'User signed out', {}, userId),

  consultationStarted: (userId: string, businessType: string, offeringType: string) =>
    log(LogLevel.INFO, LogCategory.USER_ACTION, 'Consultation started', { businessType, offeringType }, userId),

  consultationCompleted: (userId: string, consultationId: string) =>
    log(LogLevel.INFO, LogCategory.USER_ACTION, 'Consultation completed', { consultationId }, userId),

  // Payment events
  paymentAttempt: (userId: string, credits: number, amount: number) =>
    log(LogLevel.INFO, LogCategory.PAYMENT, `Payment attempt: ${credits} credits for $${amount}`, { credits, amount }, userId),

  paymentSuccess: (userId: string, paymentId: string, credits: number, amount: number) =>
    log(LogLevel.INFO, LogCategory.PAYMENT, `Payment succeeded: ${paymentId}`, { paymentId, credits, amount }, userId),

  paymentFailed: (userId: string, paymentId: string, errorCode: string, errorMessage: string) =>
    log(LogLevel.ERROR, LogCategory.PAYMENT, `Payment failed: ${errorCode}`, { paymentId, errorCode, errorMessage }, userId),

  paymentCancelled: (userId: string, paymentId: string) =>
    log(LogLevel.WARN, LogCategory.PAYMENT, `Payment cancelled: ${paymentId}`, { paymentId }, userId),

  // API calls
  apiCallStarted: (service: string, endpoint: string, userId?: string) =>
    log(LogLevel.DEBUG, LogCategory.API_CALL, `API call started: ${service}${endpoint}`, { service, endpoint }, userId),

  apiCallSuccess: (service: string, endpoint: string, duration: number, userId?: string) =>
    log(LogLevel.INFO, LogCategory.API_CALL, `API call succeeded: ${service} (${duration}ms)`, { service, endpoint, duration }, userId),

  apiCallFailed: (service: string, endpoint: string, error: string, userId?: string) =>
    log(LogLevel.ERROR, LogCategory.API_CALL, `API call failed: ${service}`, { service, endpoint, error }, userId),

  apiCallTimeout: (service: string, endpoint: string, timeout: number, userId?: string) =>
    log(LogLevel.WARN, LogCategory.API_CALL, `API call timeout: ${service} (${timeout}ms)`, { service, endpoint, timeout }, userId),

  // Scraping
  scrapingStarted: (source: string, query: string) =>
    log(LogLevel.INFO, LogCategory.SCRAPING, `Scraping started: ${source}`, { source, query }),

  scrapingCompleted: (source: string, count: number, duration: number) =>
    log(LogLevel.INFO, LogCategory.SCRAPING, `Scraping completed: ${source} (${count} listings, ${duration}ms)`, { source, count, duration }),

  scrapingFailed: (source: string, error: string) =>
    log(LogLevel.ERROR, LogCategory.SCRAPING, `Scraping failed: ${source}`, { source, error }),

  // Auth
  authFailed: (reason: string, email?: string) =>
    log(LogLevel.WARN, LogCategory.AUTH, `Authentication failed: ${reason}`, { reason, email }),

  // System
  systemStartup: (port: number, environment: string) =>
    log(LogLevel.INFO, LogCategory.SYSTEM, `Server started on port ${port}`, { port, environment }),

  systemShutdown: (reason: string) =>
    log(LogLevel.WARN, LogCategory.SYSTEM, `Server shutting down: ${reason}`, { reason }),

  systemError: (error: string, stack?: string) =>
    log(LogLevel.ERROR, LogCategory.SYSTEM, `System error: ${error}`, { error, stack }),
};

