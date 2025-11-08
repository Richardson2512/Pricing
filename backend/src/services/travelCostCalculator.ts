import dotenv from 'dotenv';
import fetch from 'node-fetch';
import axios from 'axios';
import { getDistance } from 'geolib';
import { getFuelPricesByLocation, getVehicleEfficiency, formatDistance, kmToMiles } from './fuelPriceService.js';
import { convertCurrency, formatCurrency, getCurrencyByLocation } from './currencyConverter.js';

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
 * Get coordinates for a location using Nominatim (OpenStreetMap)
 * Fallback 1: Nominatim (OSM) - Free, no API key
 * Fallback 2: OpenCage Geocoder - Free tier: 2500 requests/day
 * Fallback 3: Photon (Komoot) - Free, no API key
 * Fallback 4: LocationIQ - Free tier: 5000 requests/day
 */
async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  // Try Nominatim first (Primary)
  try {
    console.log('🌍 Geocoding with Nominatim (OSM)...');
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PriceWise-App/1.0',
      },
    });
    
    const data = await response.json() as any[];
    
    if (data && data.length > 0) {
      console.log('✅ Nominatim geocoding successful');
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.warn('⚠️ Nominatim failed, trying fallback...');
  }

  // Fallback 2: Photon (Komoot)
  try {
    console.log('🌍 Geocoding with Photon (Komoot)...');
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=1`;
    const response = await fetch(url);
    const data = await response.json() as any;
    
    if (data.features && data.features.length > 0) {
      const coords = data.features[0].geometry.coordinates;
      console.log('✅ Photon geocoding successful');
      return {
        lat: coords[1],
        lon: coords[0],
      };
    }
  } catch (error) {
    console.warn('⚠️ Photon failed, trying next fallback...');
  }

  // Fallback 3: OpenCage (requires API key but has free tier)
  const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;
  if (OPENCAGE_API_KEY) {
    try {
      console.log('🌍 Geocoding with OpenCage...');
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${OPENCAGE_API_KEY}&limit=1`;
      const response = await fetch(url);
      const data = await response.json() as any;
      
      if (data.results && data.results.length > 0) {
        console.log('✅ OpenCage geocoding successful');
        return {
          lat: data.results[0].geometry.lat,
          lon: data.results[0].geometry.lng,
        };
      }
    } catch (error) {
      console.warn('⚠️ OpenCage failed');
    }
  }

  // Fallback 4: LocationIQ (requires API key but has free tier)
  const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;
  if (LOCATIONIQ_API_KEY) {
    try {
      console.log('🌍 Geocoding with LocationIQ...');
      const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(location)}&format=json&limit=1`;
      const response = await fetch(url);
      const data = await response.json() as any[];
      
      if (data && data.length > 0) {
        console.log('✅ LocationIQ geocoding successful');
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
    } catch (error) {
      console.warn('⚠️ LocationIQ failed');
    }
  }

  console.error('❌ All geocoding services failed for:', location);
  return null;
}

/**
 * Calculate distance and travel time using multiple routing services
 * Primary: OSRM (Open Source Routing Machine) - Free, no API key
 * Fallback 1: GraphHopper - Free tier: 500 requests/day
 * Fallback 2: OpenRouteService - Free tier: 2000 requests/day
 * Fallback 3: Geolib (straight-line distance) - Always works
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

  // Try OSRM first (Primary)
  try {
    console.log('🗺️ Calculating route with OSRM...');
    const url = `http://router.project-osrm.org/route/v1/${mode}/${originCoords.lon},${originCoords.lat};${destCoords.lon},${destCoords.lat}?overview=false`;
    
    const response = await fetch(url, { timeout: 5000 } as any);
    const data = await response.json() as any;
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      console.log('✅ OSRM routing successful');
      return {
        distance_km: route.distance / 1000,
        duration_hours: route.duration / 3600,
      };
    }
  } catch (error) {
    console.warn('⚠️ OSRM failed, trying fallback...');
  }

  // Fallback 1: GraphHopper
  const GRAPHHOPPER_API_KEY = process.env.GRAPHHOPPER_API_KEY;
  if (GRAPHHOPPER_API_KEY) {
    try {
      console.log('🗺️ Calculating route with GraphHopper...');
      const url = `https://graphhopper.com/api/1/route?point=${originCoords.lat},${originCoords.lon}&point=${destCoords.lat},${destCoords.lon}&vehicle=${mode === 'driving' ? 'car' : mode}&key=${GRAPHHOPPER_API_KEY}`;
      
      const response = await axios.get(url, { timeout: 5000 });
      const data = response.data;
      
      if (data.paths && data.paths.length > 0) {
        const path = data.paths[0];
        console.log('✅ GraphHopper routing successful');
        return {
          distance_km: path.distance / 1000,
          duration_hours: path.time / 3600000,
        };
      }
    } catch (error) {
      console.warn('⚠️ GraphHopper failed, trying next fallback...');
    }
  }

  // Fallback 2: OpenRouteService
  const ORS_API_KEY = process.env.OPENROUTESERVICE_API_KEY;
  if (ORS_API_KEY) {
    try {
      console.log('🗺️ Calculating route with OpenRouteService...');
      const profile = mode === 'driving' ? 'driving-car' : mode === 'cycling' ? 'cycling-regular' : 'foot-walking';
      const url = `https://api.openrouteservice.org/v2/directions/${profile}?start=${originCoords.lon},${originCoords.lat}&end=${destCoords.lon},${destCoords.lat}`;
      
      const response = await axios.get(url, {
        headers: { 'Authorization': ORS_API_KEY },
        timeout: 5000,
      });
      const data = response.data;
      
      if (data.features && data.features.length > 0) {
        const route = data.features[0].properties.segments[0];
        console.log('✅ OpenRouteService routing successful');
        return {
          distance_km: route.distance / 1000,
          duration_hours: route.duration / 3600,
        };
      }
    } catch (error) {
      console.warn('⚠️ OpenRouteService failed, using straight-line distance...');
    }
  }

  // Fallback 3: Geolib (straight-line distance - always works)
  try {
    console.log('🗺️ Calculating straight-line distance with Geolib...');
    const distanceMeters = getDistance(
      { latitude: originCoords.lat, longitude: originCoords.lon },
      { latitude: destCoords.lat, longitude: destCoords.lon }
    );
    
    const distance_km = distanceMeters / 1000;
    
    // Estimate duration based on average speed
    const avg_speed_kmh = mode === 'driving' ? 60 : mode === 'cycling' ? 20 : 5;
    const duration_hours = distance_km / avg_speed_kmh;
    
    // Add 30% for road routing (straight-line is shorter than actual roads)
    const adjusted_distance_km = distance_km * 1.3;
    const adjusted_duration_hours = duration_hours * 1.3;
    
    console.log('✅ Geolib straight-line calculation successful (with 30% road adjustment)');
    return {
      distance_km: adjusted_distance_km,
      duration_hours: adjusted_duration_hours,
    };
  } catch (error) {
    console.error('❌ Even Geolib failed:', error);
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

