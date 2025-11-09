/**
 * Retry Utility
 * Provides exponential backoff retry logic for critical operations
 */

import { logger } from '../services/logger.js';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  backoffMultiplier?: number;
  retryableErrors?: string[]; // Error messages that should trigger retry
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'AbortError', '429', '500', '502', '503', '504'],
  onRetry: () => {},
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      const isRetryable = opts.retryableErrors.some(
        (retryableError) =>
          error.message?.includes(retryableError) ||
          error.code?.includes(retryableError) ||
          error.status?.toString() === retryableError ||
          error.name === retryableError
      );

      // Don't retry on client errors (4xx except 429)
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }

      // If this is the last attempt or error is not retryable, throw
      if (attempt === opts.maxAttempts || !isRetryable) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );

      // Call onRetry callback
      opts.onRetry(attempt, error);

      console.log(`⏳ Retry attempt ${attempt}/${opts.maxAttempts} after ${delay}ms...`);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Retry with timeout
 * Combines retry logic with a timeout for the entire operation
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await retryWithBackoff(fn, retryOptions);
    clearTimeout(timeout);
    return result;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error(`Operation timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Retry with fallback
 * Try primary function, then fallback to secondary if all retries fail
 */
export async function retryWithFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  retryOptions: RetryOptions = {}
): Promise<T> {
  try {
    return await retryWithBackoff(primaryFn, retryOptions);
  } catch (error: any) {
    console.log('⚠️ Primary function failed, using fallback...');
    logger.apiCallFailed('primary', 'unknown', error.message);
    return await fallbackFn();
  }
}

/**
 * Retry multiple functions in sequence until one succeeds
 */
export async function retryChain<T>(
  functions: Array<{ name: string; fn: () => Promise<T> }>,
  retryOptions: RetryOptions = {}
): Promise<T> {
  let lastError: Error;

  for (const { name, fn } of functions) {
    try {
      console.log(`🔄 Trying: ${name}...`);
      const result = await retryWithBackoff(fn, { ...retryOptions, maxAttempts: 2 });
      console.log(`✅ Success: ${name}`);
      return result;
    } catch (error: any) {
      console.log(`❌ Failed: ${name} - ${error.message}`);
      lastError = error;
      // Continue to next function
    }
  }

  throw new Error(`All functions in chain failed. Last error: ${lastError!.message}`);
}

