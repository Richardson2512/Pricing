import fetch from 'node-fetch';

// ============================================================================
// TYPES
// ============================================================================

export interface FuelPrices {
  petrol_per_liter: number;
  diesel_per_liter: number;
  currency: string;
  location: string;
  source: string;
  last_updated: string;
}

// ============================================================================
// LOCATION-BASED FUEL PRICES (Fallback data)
// ============================================================================

const FUEL_PRICE_DATABASE: Record<string, FuelPrices> = {
  'india': {
    petrol_per_liter: 106.31,
    diesel_per_liter: 94.04,
    currency: 'INR',
    location: 'India (National Average)',
    source: 'Government of India',
    last_updated: '2025-11-08',
  },
  'usa': {
    petrol_per_liter: 0.95 * 3.785, // $0.95/gallon → per liter
    diesel_per_liter: 1.05 * 3.785,
    currency: 'USD',
    location: 'USA (National Average)',
    source: 'EIA',
    last_updated: '2025-11-08',
  },
  'uk': {
    petrol_per_liter: 1.45,
    diesel_per_liter: 1.52,
    currency: 'GBP',
    location: 'UK (National Average)',
    source: 'RAC',
    last_updated: '2025-11-08',
  },
  'europe': {
    petrol_per_liter: 1.65,
    diesel_per_liter: 1.55,
    currency: 'EUR',
    location: 'Europe (Average)',
    source: 'European Commission',
    last_updated: '2025-11-08',
  },
  'canada': {
    petrol_per_liter: 1.50,
    diesel_per_liter: 1.60,
    currency: 'CAD',
    location: 'Canada (National Average)',
    source: 'Statistics Canada',
    last_updated: '2025-11-08',
  },
  'australia': {
    petrol_per_liter: 1.80,
    diesel_per_liter: 1.90,
    currency: 'AUD',
    location: 'Australia (National Average)',
    source: 'ACCC',
    last_updated: '2025-11-08',
  },
  'uae': {
    petrol_per_liter: 3.05,
    diesel_per_liter: 3.15,
    currency: 'AED',
    location: 'UAE',
    source: 'UAE Ministry of Energy',
    last_updated: '2025-11-08',
  },
  'singapore': {
    petrol_per_liter: 2.80,
    diesel_per_liter: 2.50,
    currency: 'SGD',
    location: 'Singapore',
    source: 'Singapore Fuel Kaki',
    last_updated: '2025-11-08',
  },
  'china': {
    petrol_per_liter: 8.50,
    diesel_per_liter: 7.80,
    currency: 'CNY',
    location: 'China (National Average)',
    source: 'NDRC',
    last_updated: '2025-11-08',
  },
  'japan': {
    petrol_per_liter: 170,
    diesel_per_liter: 150,
    currency: 'JPY',
    location: 'Japan (National Average)',
    source: 'METI',
    last_updated: '2025-11-08',
  },
  'brazil': {
    petrol_per_liter: 5.80,
    diesel_per_liter: 5.50,
    currency: 'BRL',
    location: 'Brazil (National Average)',
    source: 'ANP',
    last_updated: '2025-11-08',
  },
  'mexico': {
    petrol_per_liter: 22.50,
    diesel_per_liter: 23.00,
    currency: 'MXN',
    location: 'Mexico (National Average)',
    source: 'CRE',
    last_updated: '2025-11-08',
  },
  'south africa': {
    petrol_per_liter: 22.50,
    diesel_per_liter: 21.80,
    currency: 'ZAR',
    location: 'South Africa (National Average)',
    source: 'Department of Energy',
    last_updated: '2025-11-08',
  },
};

// Default fallback
const DEFAULT_FUEL_PRICES: FuelPrices = {
  petrol_per_liter: 1.50,
  diesel_per_liter: 1.45,
  currency: 'USD',
  location: 'Global Average',
  source: 'Estimated',
  last_updated: '2025-11-08',
};

// ============================================================================
// FUEL PRICE FETCHING
// ============================================================================

/**
 * Get fuel prices for a specific location
 */
export async function getFuelPricesByLocation(location: string): Promise<FuelPrices> {
  const lowerLocation = location.toLowerCase();
  
  // Try to match location to database
  for (const [key, prices] of Object.entries(FUEL_PRICE_DATABASE)) {
    if (lowerLocation.includes(key)) {
      return prices;
    }
  }
  
  // Try to fetch from API (if available)
  // For now, return default
  console.log(`No specific fuel prices for ${location}, using global average`);
  return DEFAULT_FUEL_PRICES;
}

/**
 * Get fuel prices for India by city (more granular)
 */
export async function getIndiaFuelPrices(city?: string): Promise<FuelPrices> {
  // City-specific prices for major Indian cities
  const cityPrices: Record<string, { petrol: number; diesel: number }> = {
    'mumbai': { petrol: 106.31, diesel: 94.27 },
    'delhi': { petrol: 96.72, diesel: 89.62 },
    'bangalore': { petrol: 101.94, diesel: 87.89 },
    'chennai': { petrol: 102.63, diesel: 94.24 },
    'kolkata': { petrol: 104.67, diesel: 89.79 },
    'hyderabad': { petrol: 109.66, diesel: 97.82 },
    'pune': { petrol: 105.70, diesel: 93.26 },
    'ahmedabad': { petrol: 96.46, diesel: 92.61 },
  };

  if (city) {
    const lowerCity = city.toLowerCase();
    for (const [key, prices] of Object.entries(cityPrices)) {
      if (lowerCity.includes(key)) {
        return {
          petrol_per_liter: prices.petrol,
          diesel_per_liter: prices.diesel,
          currency: 'INR',
          location: `${key.charAt(0).toUpperCase() + key.slice(1)}, India`,
          source: 'Indian Oil Corporation',
          last_updated: '2025-11-08',
        };
      }
    }
  }

  // Return national average
  return FUEL_PRICE_DATABASE['india'];
}

// ============================================================================
// DISTANCE CONVERSION
// ============================================================================

/**
 * Convert kilometers to miles
 */
export function kmToMiles(km: number): number {
  return km * 0.621371;
}

/**
 * Convert miles to kilometers
 */
export function milesToKm(miles: number): number {
  return miles * 1.60934;
}

/**
 * Format distance with both units
 */
export function formatDistance(km: number): string {
  const miles = kmToMiles(km);
  return `${km.toFixed(1)} km (${miles.toFixed(1)} miles)`;
}

// ============================================================================
// VEHICLE EFFICIENCY BY LOCATION
// ============================================================================

/**
 * Get typical vehicle efficiency for a location
 * (Different regions have different vehicle types and efficiency standards)
 */
export function getVehicleEfficiency(location: string, vehicleType: 'bike' | 'car'): number {
  const lowerLocation = location.toLowerCase();
  
  // India - smaller vehicles, better efficiency
  if (lowerLocation.includes('india')) {
    return vehicleType === 'bike' ? 45 : 18; // km/L
  }
  
  // USA - larger vehicles, measured in MPG
  if (lowerLocation.includes('usa') || lowerLocation.includes('united states')) {
    return vehicleType === 'bike' ? 50 : 12; // km/L (converted from MPG)
  }
  
  // Europe - efficient vehicles
  if (lowerLocation.includes('europe') || lowerLocation.includes('uk') || 
      lowerLocation.includes('germany') || lowerLocation.includes('france')) {
    return vehicleType === 'bike' ? 40 : 16; // km/L
  }
  
  // Middle East - less efficient due to larger vehicles
  if (lowerLocation.includes('uae') || lowerLocation.includes('saudi') || 
      lowerLocation.includes('dubai')) {
    return vehicleType === 'bike' ? 35 : 10; // km/L
  }
  
  // Asia Pacific
  if (lowerLocation.includes('singapore') || lowerLocation.includes('japan') || 
      lowerLocation.includes('korea')) {
    return vehicleType === 'bike' ? 42 : 15; // km/L
  }
  
  // Default
  return vehicleType === 'bike' ? 40 : 15; // km/L
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getFuelPricesByLocation,
  getIndiaFuelPrices,
  convertCurrency,
  formatCurrency,
  getCurrencyByLocation,
  kmToMiles,
  milesToKm,
  formatDistance,
  getVehicleEfficiency,
  POPULAR_CURRENCIES,
};

