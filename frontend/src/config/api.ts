/**
 * Centralized API Configuration
 * Single source of truth for backend URL
 */

// Get backend URL from environment variables
const getBackendUrl = (): string => {
  // Priority order:
  // 1. VITE_BACKEND_URL (production - set in Vercel)
  // 2. VITE_API_URL (legacy support)
  // 3. localhost:3001 (local development)
  let url = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  // Ensure URL has protocol
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  
  // Remove trailing slash
  url = url.replace(/\/$/, '');
  
  return url;
};

export const API_CONFIG = {
  BACKEND_URL: getBackendUrl(),
  ENDPOINTS: {
    // Consultations
    CONSULTATIONS: '/api/consultations',
    PRE_ANALYZE: '/api/consultations/pre-analyze',
    CONSULTATIONS_DOCUMENT: '/api/consultations/document',
    
    // Credits
    CREDITS: '/api/credits',
    
    // Payments
    CREATE_CHECKOUT: '/api/payments/create-checkout',
    PAYMENT_WEBHOOK: '/api/payments/webhook',
    VERIFY_PAYMENT: '/api/payments/verify',
    
    // Health
    HEALTH: '/health',
  },
  TIMEOUTS: {
    DEFAULT: 30000, // 30 seconds
    LONG_RUNNING: 120000, // 2 minutes for AI operations
    QUICK: 10000, // 10 seconds for health checks
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};

// Helper function for fetch with timeout
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = API_CONFIG.TIMEOUTS.DEFAULT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
};

// Log configuration on load (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    backendUrl: API_CONFIG.BACKEND_URL,
    environment: import.meta.env.MODE,
  });
}

