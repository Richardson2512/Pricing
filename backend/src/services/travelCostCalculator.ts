import dotenv from 'dotenv';
import fetch from 'node-fetch';

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
  travel_time_hours: number;
  mode: string;
  frequency_multiplier: number;
  rationale: string;
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
 */
async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PriceWise-App/1.0',
      },
    });
    
    const data = await response.json() as any[];
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Calculate distance and travel time using OSRM (Open Source Routing Machine)
 */
async function calculateRoute(
  origin: string,
  destination: string,
  mode: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<{ distance_km: number; duration_hours: number } | null> {
  try {
    // Get coordinates
    const originCoords = await geocode(origin);
    const destCoords = await geocode(destination);
    
    if (!originCoords || !destCoords) {
      console.error('Could not geocode locations');
      return null;
    }
    
    // Use OSRM to calculate route
    const url = `http://router.project-osrm.org/route/v1/${mode}/${originCoords.lon},${originCoords.lat};${destCoords.lon},${destCoords.lat}?overview=false`;
    
    const response = await fetch(url);
    const data = await response.json() as any;
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance_km: route.distance / 1000, // Convert meters to km
        duration_hours: route.duration / 3600, // Convert seconds to hours
      };
    }
    
    return null;
  } catch (error) {
    console.error('Route calculation error:', error);
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
 * Main function to calculate travel costs
 */
export async function calculateTravelCost(
  travelReq: TravelRequirement,
  hourly_rate: number = 500, // Default hourly rate
  project_duration_months: number = 1
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
  
  // Calculate costs
  const fuel_cost = calculateFuelCost(distance_km, mode);
  const time_compensation = calculateTimeCompensation(travel_time_hours, hourly_rate);
  const single_trip_cost = fuel_cost + time_compensation;
  
  // Apply frequency multiplier
  const frequency_multiplier = getFrequencyMultiplier(frequency);
  const total_cost = single_trip_cost * frequency_multiplier * project_duration_months;
  
  // Build rationale
  let rationale = `Travel required for ${travelReq.purpose || 'service delivery'}. `;
  rationale += `${frequency === 'one_time' ? 'One-time' : frequency.replace('_', ' ')} trip${frequency_multiplier > 1 ? 's' : ''} `;
  rationale += `of ${distance_km.toFixed(0)} km (round trip) via ${mode}. `;
  rationale += `Fuel/transport cost: ₹${fuel_cost.toFixed(0)}, `;
  rationale += `Time compensation (${travel_time_hours.toFixed(1)} hrs @ ₹${hourly_rate}/hr × ${TRAVEL_TIME_FACTOR}): ₹${time_compensation.toFixed(0)}. `;
  
  if (frequency_multiplier > 1) {
    rationale += `Total for ${frequency_multiplier} trips: ₹${total_cost.toFixed(0)}.`;
  }
  
  if (travelReq.client_bears_cost) {
    rationale += ' (Client bears travel costs - can be billed separately)';
  }
  
  return {
    total_cost: Math.round(total_cost),
    fuel_cost: Math.round(fuel_cost * frequency_multiplier * project_duration_months),
    time_compensation: Math.round(time_compensation * frequency_multiplier * project_duration_months),
    distance_km,
    travel_time_hours,
    mode,
    frequency_multiplier: frequency_multiplier * project_duration_months,
    rationale,
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

