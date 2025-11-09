import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { rateLimitTracker } from './rateLimitTracker.js';

dotenv.config();

// ============================================================================
// TYPES
// ============================================================================

export interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface ConversionResult {
  amount: number;
  currency: string;
  original_amount: number;
  original_currency: string;
  rate: number;
}

// ============================================================================
// CURRENCY DATA
// ============================================================================

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  SGD: 'S$',
  AED: 'د.إ',
  SAR: '﷼',
  ZAR: 'R',
  BRL: 'R$',
  MXN: 'Mex$',
  RUB: '₽',
  KRW: '₩',
  IDR: 'Rp',
  MYR: 'RM',
  THB: '฿',
  PHP: '₱',
  VND: '₫',
  PKR: '₨',
  BDT: '৳',
  LKR: 'රු',
  NGN: '₦',
  EGP: 'E£',
  KES: 'KSh',
};

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
];

// Cache for exchange rates (refresh every hour)
let cachedRates: CurrencyRates | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// ============================================================================
// EXCHANGE RATE FETCHING
// ============================================================================

/**
 * Fetch latest exchange rates using chain fallback
 * ORDERED BY RATE LIMIT (Highest → Lowest):
 * 1. frankfurter.app - 10,000/day, Free, No API key, ECB data
 * 2. exchangerate-api.com - 1,500/month, Free, No API key
 * 3. exchangerate.host - 100/month, Free, No API key
 * 4. fixer.io - 100/month, Free tier, API key required
 * 5. Cached rates (1 hour stale)
 * 6. Approximate rates (last resort)
 */
async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<CurrencyRates | null> {
  // Check cache first
  const now = Date.now();
  if (cachedRates && cachedRates.base === baseCurrency && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('✅ Using cached exchange rates');
    return cachedRates;
  }

  // Define service chain (highest rate limit first)
  const services = [
    { name: 'frankfurter', requiresKey: false },
    { name: 'exchangerate-api', requiresKey: false },
    { name: 'exchangerate-host', requiresKey: false },
    { name: 'fixer', requiresKey: true },
  ];

  // Try each service in order
  for (const service of services) {
    // Check rate limit
    if (!rateLimitTracker.canUseService(service.name)) {
      console.log(`⏭️ ${service.name} rate limit reached, skipping to next service`);
      continue;
    }

    // Check if API key required and available
    if (service.requiresKey) {
      const apiKey = process.env[`${service.name.toUpperCase()}_API_KEY`];
      if (!apiKey) {
        console.log(`⏭️ ${service.name} requires API key (not configured), skipping`);
        continue;
      }
    }

    // Try the service
    try {
      console.log(`💱 Fetching rates from ${service.name}...`);
      const rates = await fetchFromCurrencyService(service.name, baseCurrency);
      
      if (rates) {
        cachedRates = rates;
        lastFetchTime = now;
        rateLimitTracker.recordUsage(service.name);
        console.log(`✅ ${service.name} rates fetched successfully`);
        return cachedRates;
      }
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error.message?.includes('rate limit') || error.message?.includes('429') || error.response?.status === 429) {
        console.warn(`⚠️ ${service.name} rate limit hit, marking and trying next...`);
        // Force mark as rate limited
        for (let i = 0; i < 1000; i++) {
          rateLimitTracker.recordUsage(service.name);
        }
      } else {
        console.warn(`⚠️ ${service.name} failed: ${error.message}, trying next...`);
      }
    }
  }

  // Fallback: Use stale cached rates
  if (cachedRates) {
    console.warn('⚠️ All APIs exhausted, using stale cached rates');
    return cachedRates;
  }

  // Last resort: Approximate rates
  console.warn('⚠️ No cache available, using approximate exchange rates (last resort)');
  return {
    base: 'USD',
    rates: {
      USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.12, JPY: 149.50,
      CNY: 7.24, AUD: 1.52, CAD: 1.36, SGD: 1.34, AED: 3.67,
      SAR: 3.75, ZAR: 18.50, BRL: 4.95, MXN: 17.20, RUB: 92.50,
      KRW: 1320, IDR: 15600, MYR: 4.72, THB: 35.50, PHP: 56.20,
      VND: 24500, PKR: 278, BDT: 110, LKR: 325, NGN: 790,
      EGP: 31, KES: 155,
    },
    timestamp: Date.now(),
  };
}

/**
 * Fetch from specific currency service
 */
async function fetchFromCurrencyService(service: string, baseCurrency: string): Promise<CurrencyRates | null> {
  const now = Date.now();
  
  switch (service) {
    case 'frankfurter':
      const frankfurterUrl = `https://api.frankfurter.app/latest?from=${baseCurrency}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const frankfurterRes = await fetch(frankfurterUrl, { signal: controller.signal });
      clearTimeout(timeout);
      const frankfurterData = await frankfurterRes.json() as any;
      if (frankfurterData && frankfurterData.rates) {
        return {
          base: baseCurrency,
          rates: { [baseCurrency]: 1, ...frankfurterData.rates },
          timestamp: now,
        };
      }
      return null;

    case 'exchangerate-api':
      const exchangerateUrl = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 5000);
      const exchangerateRes = await fetch(exchangerateUrl, { signal: controller2.signal });
      clearTimeout(timeout2);
      const exchangerateData = await exchangerateRes.json() as any;
      if (exchangerateData && exchangerateData.rates) {
        return {
          base: baseCurrency,
          rates: exchangerateData.rates,
          timestamp: now,
        };
      }
      return null;

    case 'exchangerate-host':
      const hostUrl = `https://api.exchangerate.host/latest?base=${baseCurrency}`;
      const controller3 = new AbortController();
      const timeout3 = setTimeout(() => controller3.abort(), 5000);
      const hostRes = await fetch(hostUrl, { signal: controller3.signal });
      clearTimeout(timeout3);
      const hostData = await hostRes.json() as any;
      if (hostData && hostData.rates) {
        return {
          base: baseCurrency,
          rates: hostData.rates,
          timestamp: now,
        };
      }
      return null;

    case 'fixer':
      const fixerKey = process.env.FIXER_API_KEY;
      const fixerUrl = `http://data.fixer.io/api/latest?access_key=${fixerKey}&base=${baseCurrency}`;
      const controller4 = new AbortController();
      const timeout4 = setTimeout(() => controller4.abort(), 5000);
      const fixerRes = await fetch(fixerUrl, { signal: controller4.signal });
      clearTimeout(timeout4);
      const fixerData = await fixerRes.json() as any;
      if (fixerData && fixerData.rates) {
        return {
          base: baseCurrency,
          rates: fixerData.rates,
          timestamp: now,
        };
      }
      return null;

    default:
      return null;
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<ConversionResult> {
  if (fromCurrency === toCurrency) {
    return {
      amount,
      currency: toCurrency,
      original_amount: amount,
      original_currency: fromCurrency,
      rate: 1,
    };
  }

  const rates = await fetchExchangeRates(fromCurrency);
  
  if (!rates || !rates.rates[toCurrency]) {
    console.warn(`Could not convert ${fromCurrency} to ${toCurrency}, using original amount`);
    return {
      amount,
      currency: fromCurrency,
      original_amount: amount,
      original_currency: fromCurrency,
      rate: 1,
    };
  }

  const rate = rates.rates[toCurrency];
  const convertedAmount = amount * rate;

  return {
    amount: convertedAmount,
    currency: toCurrency,
    original_amount: amount,
    original_currency: fromCurrency,
    rate,
  };
}

/**
 * Format currency with proper symbol and decimals
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  
  // Different currencies have different decimal conventions
  const decimals = ['JPY', 'KRW', 'VND', 'IDR'].includes(currency) ? 0 : 2;
  
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol}${formatted}`;
}

/**
 * Get currency based on country/location
 */
export function getCurrencyByLocation(location: string): string {
  const lowerLocation = location.toLowerCase();
  
  const currencyMap: Record<string, string> = {
    'india': 'INR',
    'usa': 'USD',
    'united states': 'USD',
    'us': 'USD',
    'uk': 'GBP',
    'united kingdom': 'GBP',
    'england': 'GBP',
    'europe': 'EUR',
    'germany': 'EUR',
    'france': 'EUR',
    'spain': 'EUR',
    'italy': 'EUR',
    'japan': 'JPY',
    'china': 'CNY',
    'australia': 'AUD',
    'canada': 'CAD',
    'singapore': 'SGD',
    'uae': 'AED',
    'dubai': 'AED',
    'saudi': 'SAR',
    'south africa': 'ZAR',
    'brazil': 'BRL',
    'mexico': 'MXN',
    'russia': 'RUB',
    'korea': 'KRW',
    'indonesia': 'IDR',
    'malaysia': 'MYR',
    'thailand': 'THB',
    'philippines': 'PHP',
    'vietnam': 'VND',
    'pakistan': 'PKR',
    'bangladesh': 'BDT',
    'sri lanka': 'LKR',
    'nigeria': 'NGN',
    'egypt': 'EGP',
    'kenya': 'KES',
  };

  for (const [country, currency] of Object.entries(currencyMap)) {
    if (lowerLocation.includes(country)) {
      return currency;
    }
  }

  return 'USD'; // Default to USD
}

/**
 * Convert multiple amounts at once
 */
export async function convertMultipleCurrencies(
  amounts: Record<string, number>,
  fromCurrency: string,
  toCurrency: string
): Promise<Record<string, ConversionResult>> {
  const results: Record<string, ConversionResult> = {};
  
  for (const [key, amount] of Object.entries(amounts)) {
    results[key] = await convertCurrency(amount, fromCurrency, toCurrency);
  }
  
  return results;
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  convertCurrency,
  formatCurrency,
  getCurrencyByLocation,
  convertMultipleCurrencies,
  POPULAR_CURRENCIES,
  CURRENCY_SYMBOLS,
};

