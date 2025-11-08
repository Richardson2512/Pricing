import dotenv from 'dotenv';
import fetch from 'node-fetch';

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
 * Fetch latest exchange rates from free API
 * Using exchangerate-api.com (free tier: 1500 requests/month)
 */
async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<CurrencyRates | null> {
  try {
    // Check cache
    const now = Date.now();
    if (cachedRates && cachedRates.base === baseCurrency && (now - lastFetchTime) < CACHE_DURATION) {
      return cachedRates;
    }

    // Fetch from API
    const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data && data.rates) {
      cachedRates = {
        base: baseCurrency,
        rates: data.rates,
        timestamp: now,
      };
      lastFetchTime = now;
      return cachedRates;
    }

    return null;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Fallback to approximate rates if API fails
    return {
      base: 'USD',
      rates: {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        INR: 83.12,
        JPY: 149.50,
        CNY: 7.24,
        AUD: 1.52,
        CAD: 1.36,
        SGD: 1.34,
        AED: 3.67,
      },
      timestamp: Date.now(),
    };
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

