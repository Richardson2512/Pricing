import dotenv from 'dotenv';
import fetch from 'node-fetch';
import axios from 'axios';
import { getDistance } from 'geolib';
import { getFuelPricesByLocation, getVehicleEfficiency, formatDistance, kmToMiles } from './fuelPriceService.js';
import { convertCurrency, formatCurrency, getCurrencyByLocation } from './currencyConverter.js';
import { rateLimitTracker } from './rateLimitTracker.js';

dotenv.config();

// ============================================================================
// TYPES
// ============================================================================

export interface TravelRequirement {
  required: boolean;
  frequency?: 'one_time' | 'weekly' | 'daily' | 'per_project' | 'monthly';
  scope?: 'local' | 'regional' | 'inter_city' | 'interstate' | 'international';
  mode?: 'bike' | 'car' | 'public_transport' | 'train' | 'flight' | 'mixed';
  distance_km?: number;
  travel_time_hours?: number;
  client_bears_cost?: boolean;
  origin?: string;
  destination?: string;
  purpose?: string;
}

export interface TravelCostBreakdown {
  total_cost: number;
  fuel_cost: number;
  time_compensation: number;
  distance_km: number;
  distance_miles: number;
  travel_time_hours: number;
  mode: string;
  frequency_multiplier: number;
  currency: string;
  rationale: string;
  fuel_price_per_liter: number;
  vehicle_efficiency_kmpl: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Fuel prices (can be updated via API)
const FUEL_PRICES = {
  petrol_per_liter: 110, // INR
  diesel_per_liter: 95,  // INR
};

// Vehicle efficiency (km per liter)
const VEHICLE_EFFICIENCY = {
  bike: 40,
  car: 15,
  public_transport: 0, // Fixed fare
};

// Base costs for different modes
const BASE_COSTS = {
  bike: 5, // per km
  car: 8,  // per km
  public_transport: 20, // per trip
  train: 2, // per km
  flight: 5000, // base cost
};

// Travel time compensation factor (multiplier of hourly rate)
const TRAVEL_TIME_FACTOR = 0.5; // 50% of hourly rate for travel time

// ============================================================================
// GEOCODING & DISTANCE CALCULATION
// ============================================================================

/**
 * Get coordinates for a location using geocoding chain
 * ORDERED BY RATE LIMIT (Highest → Lowest):
 * 1. Photon (Komoot) - 10,000/day, Free, No API key
 * 2. LocationIQ - 5,000/day, Free tier, API key required
 * 3. OpenCage - 2,500/day, Free tier, API key required
 * 4. Nominatim (OSM) - ~3,600/hour (1/sec), Free, No API key
 */
async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  // Define service chain (highest rate limit first)
  const services = [
    { name: 'photon', requiresKey: false },
    { name: 'locationiq', requiresKey: true },
    { name: 'opencage', requiresKey: true },
    { name: 'nominatim', requiresKey: false },
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
      console.log(`🌍 Geocoding with ${service.name}...`);
      const result = await geocodeWithService(service.name, location);
      
      if (result) {
        rateLimitTracker.recordUsage(service.name);
        console.log(`✅ ${service.name} geocoding successful`);
        return result;
      }
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
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

  console.error('❌ All geocoding services exhausted for:', location);
  return null;
}

/**
 * Geocode with specific service
 */
async function geocodeWithService(service: string, location: string): Promise<{ lat: number; lon: number } | null> {
  switch (service) {
    case 'photon':
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=1`;
      const photonRes = await fetch(photonUrl, { timeout: 5000 } as any);
      const photonData = await photonRes.json() as any;
      if (photonData.features && photonData.features.length > 0) {
        const coords = photonData.features[0].geometry.coordinates;
        return { lat: coords[1], lon: coords[0] };
      }
      return null;

    case 'locationiq':
      const locationiqKey = process.env.LOCATIONIQ_API_KEY;
      const locationiqUrl = `https://us1.locationiq.com/v1/search.php?key=${locationiqKey}&q=${encodeURIComponent(location)}&format=json&limit=1`;
      const locationiqRes = await fetch(locationiqUrl, { timeout: 5000 } as any);
      const locationiqData = await locationiqRes.json() as any[];
      if (locationiqData && locationiqData.length > 0) {
        return { lat: parseFloat(locationiqData[0].lat), lon: parseFloat(locationiqData[0].lon) };
      }
      return null;

    case 'opencage':
      const opencageKey = process.env.OPENCAGE_API_KEY;
      const opencageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${opencageKey}&limit=1`;
      const opencageRes = await fetch(opencageUrl, { timeout: 5000 } as any);
      const opencageData = await opencageRes.json() as any;
      if (opencageData.results && opencageData.results.length > 0) {
        return { lat: opencageData.results[0].geometry.lat, lon: opencageData.results[0].geometry.lng };
      }
      return null;

    case 'nominatim':
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
      const nominatimRes = await fetch(nominatimUrl, {
        headers: { 'User-Agent': 'PriceWise-App/1.0' },
        timeout: 5000,
      } as any);
      const nominatimData = await nominatimRes.json() as any[];
      if (nominatimData && nominatimData.length > 0) {
        return { lat: parseFloat(nominatimData[0].lat), lon: parseFloat(nominatimData[0].lon) };
      }
      return null;

    default:
      return null;
  }
}

/**
 * Calculate distance and travel time using routing chain
 * ORDERED BY RATE LIMIT (Highest → Lowest):
 * 1. OSRM - 10,000/day, Free, No API key
 * 2. OpenRouteService - 2,000/day, Free tier, API key required
 * 3. GraphHopper - 500/day, Free tier, API key required
 * 4. Geolib - Unlimited (local calculation), Always works
 */
async function calculateRoute(
  origin: string,
  destination: string,
  mode: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<{ distance_km: number; duration_hours: number } | null> {
  // Get coordinates first
  const originCoords = await geocode(origin);
  const destCoords = await geocode(destination);
  
  if (!originCoords || !destCoords) {
    console.error('❌ Could not geocode locations');
    return null;
  }

  // Define service chain (highest rate limit first)
  const services = [
    { name: 'osrm', requiresKey: false },
    { name: 'openrouteservice', requiresKey: true },
    { name: 'graphhopper', requiresKey: true },
    { name: 'geolib', requiresKey: false }, // Always works
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
      console.log(`🗺️ Calculating route with ${service.name}...`);
      const result = await routeWithService(service.name, originCoords, destCoords, mode);
      
      if (result) {
        rateLimitTracker.recordUsage(service.name);
        console.log(`✅ ${service.name} routing successful`);
        return result;
      }
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
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

  console.error('❌ All routing services exhausted (should not happen - Geolib always works)');
  return null;
}

/**
 * Route with specific service
 */
async function routeWithService(
  service: string,
  originCoords: { lat: number; lon: number },
  destCoords: { lat: number; lon: number },
  mode: 'driving' | 'walking' | 'cycling'
): Promise<{ distance_km: number; duration_hours: number } | null> {
  switch (service) {
    case 'osrm':
      const osrmUrl = `http://router.project-osrm.org/route/v1/${mode}/${originCoords.lon},${originCoords.lat};${destCoords.lon},${destCoords.lat}?overview=false`;
      const osrmRes = await fetch(osrmUrl, { timeout: 5000 } as any);
      const osrmData = await osrmRes.json() as any;
      if (osrmData.routes && osrmData.routes.length > 0) {
        const route = osrmData.routes[0];
        return {
          distance_km: route.distance / 1000,
          duration_hours: route.duration / 3600,
        };
      }
      return null;

    case 'openrouteservice':
      const orsKey = process.env.OPENROUTESERVICE_API_KEY;
      const profile = mode === 'driving' ? 'driving-car' : mode === 'cycling' ? 'cycling-regular' : 'foot-walking';
      const orsUrl = `https://api.openrouteservice.org/v2/directions/${profile}?start=${originCoords.lon},${originCoords.lat}&end=${destCoords.lon},${destCoords.lat}`;
      const orsRes = await axios.get(orsUrl, {
        headers: { 'Authorization': orsKey },
        timeout: 5000,
      });
      if (orsRes.data.features && orsRes.data.features.length > 0) {
        const route = orsRes.data.features[0].properties.segments[0];
        return {
          distance_km: route.distance / 1000,
          duration_hours: route.duration / 3600,
        };
      }
      return null;

    case 'graphhopper':
      const ghKey = process.env.GRAPHHOPPER_API_KEY;
      const ghUrl = `https://graphhopper.com/api/1/route?point=${originCoords.lat},${originCoords.lon}&point=${destCoords.lat},${destCoords.lon}&vehicle=${mode === 'driving' ? 'car' : mode}&key=${ghKey}`;
      const ghRes = await axios.get(ghUrl, { timeout: 5000 });
      if (ghRes.data.paths && ghRes.data.paths.length > 0) {
        const path = ghRes.data.paths[0];
        return {
          distance_km: path.distance / 1000,
          duration_hours: path.time / 3600000,
        };
      }
      return null;

    case 'geolib':
      // Straight-line distance (always works)
      const distanceMeters = getDistance(
        { latitude: originCoords.lat, longitude: originCoords.lon },
        { latitude: destCoords.lat, longitude: destCoords.lon }
      );
      const distance_km = distanceMeters / 1000;
      const avg_speed_kmh = mode === 'driving' ? 60 : mode === 'cycling' ? 20 : 5;
      const duration_hours = distance_km / avg_speed_kmh;
      // Add 30% for road routing
      return {
        distance_km: distance_km * 1.3,
        duration_hours: duration_hours * 1.3,
      };

    default:
      return null;
  }
}

// ============================================================================
// TRAVEL COST CALCULATION
// ============================================================================

/**
 * Calculate fuel cost based on distance and vehicle type
 */
function calculateFuelCost(distance_km: number, mode: string): number {
  if (mode === 'bike') {
    const liters = distance_km / VEHICLE_EFFICIENCY.bike;
    return liters * FUEL_PRICES.petrol_per_liter;
  } else if (mode === 'car') {
    const liters = distance_km / VEHICLE_EFFICIENCY.car;
    return liters * FUEL_PRICES.petrol_per_liter;
  } else if (mode === 'public_transport') {
    return BASE_COSTS.public_transport;
  } else if (mode === 'train') {
    return distance_km * BASE_COSTS.train;
  } else if (mode === 'flight') {
    return BASE_COSTS.flight;
  }
  
  return 0;
}

/**
 * Calculate time compensation for travel
 */
function calculateTimeCompensation(
  travel_time_hours: number,
  hourly_rate: number
): number {
  return travel_time_hours * hourly_rate * TRAVEL_TIME_FACTOR;
}

/**
 * Get frequency multiplier
 */
function getFrequencyMultiplier(frequency: string): number {
  switch (frequency) {
    case 'daily': return 22; // ~22 working days per month
    case 'weekly': return 4;
    case 'monthly': return 1;
    case 'per_project': return 1;
    case 'one_time': return 1;
    default: return 1;
  }
}

/**
 * Main function to calculate travel costs (location-aware, currency-aware)
 */
export async function calculateTravelCost(
  travelReq: TravelRequirement,
  hourly_rate: number = 500, // Default hourly rate
  project_duration_months: number = 1,
  user_location: string = 'Global',
  preferred_currency: string = 'USD'
): Promise<TravelCostBreakdown | null> {
  if (!travelReq.required) {
    return null;
  }
  
  let distance_km = travelReq.distance_km || 0;
  let travel_time_hours = travelReq.travel_time_hours || 0;
  
  // If origin and destination provided, calculate route
  if (travelReq.origin && travelReq.destination && (!distance_km || !travel_time_hours)) {
    const route = await calculateRoute(travelReq.origin, travelReq.destination);
    if (route) {
      distance_km = route.distance_km * 2; // Round trip
      travel_time_hours = route.duration_hours * 2; // Round trip
    }
  }
  
  // If still no distance, estimate based on scope
  if (!distance_km) {
    switch (travelReq.scope) {
      case 'local': distance_km = 20; break;
      case 'regional': distance_km = 100; break;
      case 'inter_city': distance_km = 300; break;
      case 'interstate': distance_km = 600; break;
      case 'international': distance_km = 2000; break;
      default: distance_km = 50;
    }
  }
  
  // Estimate travel time if not provided
  if (!travel_time_hours) {
    const avg_speed = travelReq.mode === 'flight' ? 500 : travelReq.mode === 'train' ? 80 : 60;
    travel_time_hours = distance_km / avg_speed;
  }
  
  const mode = travelReq.mode || 'car';
  const frequency = travelReq.frequency || 'one_time';
  
  // Get location-specific fuel prices
  const fuelPrices = await getFuelPricesByLocation(user_location);
  const vehicleEfficiency = getVehicleEfficiency(user_location, mode === 'bike' ? 'bike' : 'car');
  
  // Calculate fuel cost with location-specific prices
  let fuel_cost = 0;
  if (mode === 'bike' || mode === 'car') {
    const liters = distance_km / vehicleEfficiency;
    fuel_cost = liters * (mode === 'bike' ? fuelPrices.petrol_per_liter : fuelPrices.petrol_per_liter);
  } else if (mode === 'public_transport') {
    fuel_cost = BASE_COSTS.public_transport;
  } else if (mode === 'train') {
    fuel_cost = distance_km * BASE_COSTS.train;
  } else if (mode === 'flight') {
    fuel_cost = BASE_COSTS.flight;
  }
  
  // Calculate time compensation
  const time_compensation = calculateTimeCompensation(travel_time_hours, hourly_rate);
  const single_trip_cost = fuel_cost + time_compensation;
  
  // Apply frequency multiplier
  const frequency_multiplier = getFrequencyMultiplier(frequency);
  const total_cost_base_currency = single_trip_cost * frequency_multiplier * project_duration_months;
  
  // Convert to preferred currency if different
  const localCurrency = fuelPrices.currency;
  let total_cost = total_cost_base_currency;
  let final_currency = localCurrency;
  
  if (preferred_currency !== localCurrency) {
    const converted = await convertCurrency(total_cost_base_currency, localCurrency, preferred_currency);
    total_cost = converted.amount;
    final_currency = preferred_currency;
  }
  
  // Convert distance to miles
  const distance_miles = kmToMiles(distance_km);
  
  // Build rationale with both units
  const currencySymbol = formatCurrency(0, final_currency).replace('0', '').trim();
  let rationale = `Travel required for ${travelReq.purpose || 'service delivery'}. `;
  rationale += `${frequency === 'one_time' ? 'One-time' : frequency.replace('_', ' ')} trip${frequency_multiplier > 1 ? 's' : ''} `;
  rationale += `of ${formatDistance(distance_km)} via ${mode}. `;
  rationale += `Fuel/transport cost: ${formatCurrency(fuel_cost, localCurrency)}, `;
  rationale += `Time compensation (${travel_time_hours.toFixed(1)} hrs @ ${formatCurrency(hourly_rate, localCurrency)}/hr × ${TRAVEL_TIME_FACTOR}): ${formatCurrency(time_compensation, localCurrency)}. `;
  
  if (frequency_multiplier > 1) {
    rationale += `Total for ${frequency_multiplier} trips: ${formatCurrency(total_cost, final_currency)}.`;
  }
  
  if (travelReq.client_bears_cost) {
    rationale += ' (Client bears travel costs - can be billed separately)';
  }
  
  rationale += ` Fuel price: ${formatCurrency(fuelPrices.petrol_per_liter, localCurrency)}/L, Vehicle efficiency: ${vehicleEfficiency} km/L.`;
  
  return {
    total_cost: Math.round(total_cost),
    fuel_cost: Math.round(fuel_cost * frequency_multiplier * project_duration_months),
    time_compensation: Math.round(time_compensation * frequency_multiplier * project_duration_months),
    distance_km,
    distance_miles,
    travel_time_hours,
    mode,
    frequency_multiplier: frequency_multiplier * project_duration_months,
    currency: final_currency,
    rationale,
    fuel_price_per_liter: fuelPrices.petrol_per_liter,
    vehicle_efficiency_kmpl: vehicleEfficiency,
  };
}

// ============================================================================
// TRAVEL DETECTION FROM TEXT
// ============================================================================

/**
 * Detect if travel is required from document text
 */
export function detectTravelFromText(text: string): Partial<TravelRequirement> {
  const lowerText = text.toLowerCase();
  
  // Keywords that indicate travel
  const travelKeywords = [
    'onsite', 'on-site', 'on site',
    'visit', 'site visit', 'client location',
    'inspection', 'survey', 'field',
    'installation', 'setup', 'delivery',
    'travel to', 'travel allowance',
    'commute', 'transportation',
    'meeting at', 'physical presence',
  ];
  
  const hasTravelKeyword = travelKeywords.some(keyword => lowerText.includes(keyword));
  
  if (!hasTravelKeyword) {
    return { required: false };
  }
  
  // Detect frequency
  let frequency: TravelRequirement['frequency'] = 'one_time';
  if (lowerText.includes('daily') || lowerText.includes('every day')) {
    frequency = 'daily';
  } else if (lowerText.includes('weekly') || lowerText.includes('every week')) {
    frequency = 'weekly';
  } else if (lowerText.includes('monthly') || lowerText.includes('every month')) {
    frequency = 'monthly';
  }
  
  // Detect scope
  let scope: TravelRequirement['scope'] = 'local';
  if (lowerText.includes('international') || lowerText.includes('abroad') || lowerText.includes('overseas')) {
    scope = 'international';
  } else if (lowerText.includes('interstate') || lowerText.includes('across state')) {
    scope = 'interstate';
  } else if (lowerText.includes('inter-city') || lowerText.includes('different city')) {
    scope = 'inter_city';
  } else if (lowerText.includes('regional') || lowerText.includes('nearby cit')) {
    scope = 'regional';
  }
  
  // Detect mode
  let mode: TravelRequirement['mode'] = 'car';
  if (lowerText.includes('flight') || lowerText.includes('air travel')) {
    mode = 'flight';
  } else if (lowerText.includes('train') || lowerText.includes('railway')) {
    mode = 'train';
  } else if (lowerText.includes('bike') || lowerText.includes('motorcycle')) {
    mode = 'bike';
  } else if (lowerText.includes('public transport') || lowerText.includes('bus')) {
    mode = 'public_transport';
  }
  
  // Detect purpose
  let purpose = 'service delivery';
  if (lowerText.includes('inspection')) purpose = 'inspection';
  else if (lowerText.includes('installation')) purpose = 'installation';
  else if (lowerText.includes('meeting')) purpose = 'client meeting';
  else if (lowerText.includes('delivery')) purpose = 'delivery';
  else if (lowerText.includes('survey')) purpose = 'site survey';
  
  // Check if client bears cost
  const client_bears_cost = lowerText.includes('client bears') || 
                           lowerText.includes('reimbursable') ||
                           lowerText.includes('travel allowance');
  
  return {
    required: true,
    frequency,
    scope,
    mode,
    purpose,
    client_bears_cost,
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  calculateTravelCost,
  detectTravelFromText,
  geocode,
  calculateRoute,
};

