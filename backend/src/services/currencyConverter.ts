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
 * Fetch latest exchange rates from multiple free APIs
 * Primary: exchangerate-api.com - Free tier: 1500 requests/month
 * Fallback 1: frankfurter.app - Free, no API key, ECB data
 * Fallback 2: exchangerate.host - Free tier: 100 requests/month
 * Fallback 3: fixer.io - Free tier: 100 requests/month (requires key)
 */
async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<CurrencyRates | null> {
  // Check cache first
  const now = Date.now();
  if (cachedRates && cachedRates.base === baseCurrency && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('✅ Using cached exchange rates');
    return cachedRates;
  }

  // Try exchangerate-api.com (Primary)
  try {
    console.log('💱 Fetching rates from exchangerate-api.com...');
    const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
    const response = await fetch(url, { timeout: 5000 } as any);
    const data = await response.json() as any;

    if (data && data.rates) {
      cachedRates = {
        base: baseCurrency,
        rates: data.rates,
        timestamp: now,
      };
      lastFetchTime = now;
      console.log('✅ Exchange rates fetched successfully');
      return cachedRates;
    }
  } catch (error) {
    console.warn('⚠️ exchangerate-api.com failed, trying fallback...');
  }

  // Fallback 1: frankfurter.app (ECB data)
  try {
    console.log('💱 Fetching rates from frankfurter.app...');
    const url = `https://api.frankfurter.app/latest?from=${baseCurrency}`;
    const response = await fetch(url, { timeout: 5000 } as any);
    const data = await response.json() as any;

    if (data && data.rates) {
      cachedRates = {
        base: baseCurrency,
        rates: { [baseCurrency]: 1, ...data.rates },
        timestamp: now,
      };
      lastFetchTime = now;
      console.log('✅ Frankfurter rates fetched successfully');
      return cachedRates;
    }
  } catch (error) {
    console.warn('⚠️ frankfurter.app failed, trying next fallback...');
  }

  // Fallback 2: exchangerate.host
  try {
    console.log('💱 Fetching rates from exchangerate.host...');
    const url = `https://api.exchangerate.host/latest?base=${baseCurrency}`;
    const response = await fetch(url, { timeout: 5000 } as any);
    const data = await response.json() as any;

    if (data && data.rates) {
      cachedRates = {
        base: baseCurrency,
        rates: data.rates,
        timestamp: now,
      };
      lastFetchTime = now;
      console.log('✅ exchangerate.host rates fetched successfully');
      return cachedRates;
    }
  } catch (error) {
    console.warn('⚠️ exchangerate.host failed, trying next fallback...');
  }

  // Fallback 3: fixer.io (requires API key)
  const FIXER_API_KEY = process.env.FIXER_API_KEY;
  if (FIXER_API_KEY) {
    try {
      console.log('💱 Fetching rates from fixer.io...');
      const url = `http://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&base=${baseCurrency}`;
      const response = await fetch(url, { timeout: 5000 } as any);
      const data = await response.json() as any;

      if (data && data.rates) {
        cachedRates = {
          base: baseCurrency,
          rates: data.rates,
          timestamp: now,
        };
        lastFetchTime = now;
        console.log('✅ Fixer.io rates fetched successfully');
        return cachedRates;
      }
    } catch (error) {
      console.warn('⚠️ fixer.io failed');
    }
  }

  // Final fallback: Use last known rates or approximate rates
  console.warn('⚠️ All exchange rate APIs failed, using fallback rates');
  
  if (cachedRates) {
    console.log('✅ Using stale cached rates (better than nothing)');
    return cachedRates;
  }

  // Last resort: Approximate rates (updated periodically)
  console.log('⚠️ Using approximate exchange rates (last resort)');
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
      SAR: 3.75,
      ZAR: 18.50,
      BRL: 4.95,
      MXN: 17.20,
      RUB: 92.50,
      KRW: 1320,
      IDR: 15600,
      MYR: 4.72,
      THB: 35.50,
      PHP: 56.20,
      VND: 24500,
      PKR: 278,
      BDT: 110,
      LKR: 325,
      NGN: 790,
      EGP: 31,
      KES: 155,
    },
    timestamp: Date.now(),
  };
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

