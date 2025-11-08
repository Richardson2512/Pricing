// Market data scraping service
// In production, this would use Scrapy/Playwright for real scraping
// For now, we'll provide mock data structure and API endpoints

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
 * Integrates with Python Scrapy spiders via subprocess or API
 */
export async function scrapeMarketData(config: ScrapingConfig): Promise<MarketListing[]> {
  try {
    // In production, trigger Python scraping workflow:
    // Option 1: Call Python API connector
    // Option 2: Use child_process to run scrapy spiders
    // Option 3: Use message queue (Redis/RabbitMQ)
    
    // For now, fetch from Supabase (assuming scrapers have run)
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Build query based on business type
    const query = `${config.offeringType}`;
    
    // Fetch recent market data from Supabase
    const { data, error } = await supabase
      .from('market_listings')
      .select('*')
      .ilike('category', `%${query}%`)
      .gte('scraped_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50);
    
    if (error) {
      console.error('Error fetching market data:', error);
      // Fallback to mock data
      return generateMockData(config);
    }
    
    if (data && data.length > 0) {
      console.log(`Found ${data.length} market listings from database`);
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
    
    // No data found, use mock data
    console.log('No market data found, using mock data');
    return generateMockData(config);
    
  } catch (error) {
    console.error('Error in scrapeMarketData:', error);
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

