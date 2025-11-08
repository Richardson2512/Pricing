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
 * In production, this would trigger actual web scraping jobs
 * For now, returns mock data structure
 */
export async function scrapeMarketData(config: ScrapingConfig): Promise<MarketListing[]> {
  // In production, this would:
  // 1. Trigger Scrapy spiders or Playwright scripts
  // 2. Store raw data in Supabase
  // 3. Clean and normalize data
  // 4. Return structured results
  
  // Mock data for demonstration
  const platforms = getRelevantPlatforms(config);
  const mockData: MarketListing[] = [];

  // Generate sample data based on business type
  const basePrice = config.businessType === 'digital' ? 500 : 1000;
  const variance = 0.5;

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

