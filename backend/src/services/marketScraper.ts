// Market data scraping service
// Integrates with Python scraper service on Render

const SCRAPER_URL = process.env.SCRAPER_SERVICE_URL || process.env.RENDER_SCRAPER_URL;

export interface MarketListing {
  source: string;
  title: string;
  price: number;
  currency: string;
  rating?: number;
  reviews?: number;
  delivery?: number;
}

interface ScrapingConfig {
  businessType: 'digital' | 'physical';
  offeringType: 'product' | 'service';
  region: string;
  query?: string;
  niche?: string;
  sources?: string[];
}

// Map business types to relevant platforms
const platformMapping = {
  digital_service: ['Fiverr', 'Upwork', 'Freelancer.com'],
  digital_product: ['Etsy', 'AppSumo', 'ProductHunt', 'Gumroad'],
  physical_product: ['IndiaMART', 'eBay', 'Amazon'],
  physical_service: ['Justdial', 'IndiaMART', 'UrbanClap', 'Thumbtack'],
};

/**
 * Get relevant platforms for scraping based on business type
 */
export function getRelevantPlatforms(config: ScrapingConfig): string[] {
  const key = `${config.businessType}_${config.offeringType}` as keyof typeof platformMapping;
  return platformMapping[key] || [];
}

/**
 * Scrape market data from relevant platforms
 * Calls Python scraper service on Render
 */
export async function scrapeMarketData(config: ScrapingConfig): Promise<MarketListing[]> {
  try {
    // Step 1: Try calling scraper service if configured
    if (SCRAPER_URL) {
      console.log(`🔄 Calling scraper service: ${SCRAPER_URL}`);
      
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        const response = await fetch(`${SCRAPER_URL}/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            business_type: config.businessType,
            offering_type: config.offeringType,
            query: config.query || config.offeringType,
            region: config.region || 'global',
            use_cache: true, // Use cached data if available
            max_age_hours: 24,
          }),
        });
        
        clearTimeout(timeout);
        
        if (response.ok) {
          const result: any = await response.json();
          console.log(`✅ Scraper returned ${result.count} listings`);
          
          if (result.data && result.data.length > 0) {
            return result.data.map((item: any) => ({
              source: item.source || 'Unknown',
              title: item.title || '',
              price: Number(item.price) || 0,
              currency: item.currency || 'USD',
              rating: item.rating ? Number(item.rating) : undefined,
              reviews: item.reviews || undefined,
              delivery: item.delivery_time || undefined,
            }));
          }
        } else {
          console.warn(`⚠️ Scraper service returned ${response.status}`);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn('⏱️ Scraper service timeout (30s)');
        } else {
          console.warn('⚠️ Scraper service unavailable:', error.message);
        }
      }
    } else {
      console.log('ℹ️ RENDER_SCRAPER_URL not configured, using cached/mock data');
    }
    
    // Step 2: Fallback - Check Supabase for cached data
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const query = `${config.offeringType}`;
    
    const { data, error } = await supabase
      .from('market_listings')
      .select('*')
      .ilike('category', `%${query}%`)
      .gte('scraped_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50);
    
    if (data && data.length > 0) {
      console.log(`✅ Found ${data.length} cached listings from Supabase`);
      return data.map(item => ({
        source: item.source,
        title: item.title,
        price: Number(item.price),
        currency: item.currency,
        rating: item.rating ? Number(item.rating) : undefined,
        reviews: item.reviews || undefined,
        delivery: item.delivery_time || undefined,
      }));
    }
    
    // Step 3: Final fallback - Use mock data
    console.log('⚠️ No market data available, using mock data');
    return generateMockData(config);
    
  } catch (error) {
    console.error('❌ Error in scrapeMarketData:', error);
    return generateMockData(config);
  }
}

/**
 * Generate mock market data as fallback
 */
function generateMockData(config: ScrapingConfig): MarketListing[] {
  const platforms = getRelevantPlatforms(config);
  const mockData: MarketListing[] = [];

  const basePrice = config.businessType === 'digital' ? 500 : 1000;

  for (let i = 0; i < 20; i++) {
    const platform = platforms[i % platforms.length];
    const priceMultiplier = 0.5 + Math.random() * 1.5;
    
    mockData.push({
      source: platform,
      title: `${config.offeringType} offering ${i + 1}`,
      price: Math.round(basePrice * priceMultiplier),
      currency: config.region.toLowerCase().includes('india') ? 'INR' : 'USD',
      rating: 4 + Math.random(),
      reviews: Math.floor(Math.random() * 500),
      delivery: Math.floor(3 + Math.random() * 14),
    });
  }

  return mockData;
}

/**
 * Clean and normalize scraped data
 */
export function cleanMarketData(rawData: MarketListing[]): MarketListing[] {
  return rawData
    .filter(item => item.price > 0) // Remove invalid prices
    .map(item => ({
      ...item,
      price: Math.round(item.price), // Normalize to integers
      rating: item.rating ? Math.round(item.rating * 10) / 10 : undefined, // Round ratings
    }))
    .sort((a, b) => a.price - b.price); // Sort by price
}

/**
 * Calculate market statistics
 */
export function calculateMarketStats(data: MarketListing[]) {
  const prices = data.map(d => d.price).sort((a, b) => a - b);
  const sum = prices.reduce((acc, price) => acc + price, 0);
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: Math.round(sum / prices.length),
    median: prices[Math.floor(prices.length / 2)],
    top10: prices[Math.floor(prices.length * 0.9)],
    bottom10: prices[Math.floor(prices.length * 0.1)],
    count: prices.length,
  };
}

/**
 * Enrich market data with additional context
 */
export function enrichMarketData(data: MarketListing[]): MarketListing[] {
  return data.map(item => {
    // Add quality score based on rating and reviews
    const qualityScore = item.rating && item.reviews 
      ? (item.rating / 5) * Math.min(item.reviews / 100, 1)
      : 0.5;

    return {
      ...item,
      qualityScore,
    };
  });
}

