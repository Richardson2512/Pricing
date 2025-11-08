/**
 * Rate Limit Tracker for External Services
 * Tracks usage and automatically switches to next service when limit reached
 */

interface ServiceUsage {
  count: number;
  resetTime: number;
  limit: number;
  period: 'hour' | 'day' | 'month';
}

class RateLimitTracker {
  private usage: Map<string, ServiceUsage> = new Map();

  /**
   * Define rate limits for each service (requests per period)
   */
  private readonly SERVICE_LIMITS: Record<string, { limit: number; period: 'hour' | 'day' | 'month' }> = {
    // Geocoding services (ordered by limit - highest first)
    'locationiq': { limit: 5000, period: 'day' },
    'opencage': { limit: 2500, period: 'day' },
    'photon': { limit: 10000, period: 'day' }, // No official limit, but fair use
    'nominatim': { limit: 1, period: 'hour' }, // 1 request per second = ~3600/hour, but we'll be conservative
    
    // Routing services (ordered by limit - highest first)
    'openrouteservice': { limit: 2000, period: 'day' },
    'graphhopper': { limit: 500, period: 'day' },
    'osrm': { limit: 10000, period: 'day' }, // Public server, fair use
    'geolib': { limit: Infinity, period: 'day' }, // Local calculation, no limit
    
    // Currency services (ordered by limit - highest first)
    'exchangerate-api': { limit: 1500, period: 'month' },
    'exchangerate-host': { limit: 100, period: 'month' },
    'fixer': { limit: 100, period: 'month' },
    'frankfurter': { limit: 10000, period: 'day' }, // No official limit
    
    // Fuel price services
    'fuel-database': { limit: Infinity, period: 'day' }, // Local database
  };

  /**
   * Check if service is available (not rate limited)
   */
  canUseService(serviceName: string): boolean {
    const limits = this.SERVICE_LIMITS[serviceName];
    if (!limits) return true; // Unknown service, allow
    
    const usage = this.usage.get(serviceName);
    if (!usage) return true; // First use
    
    const now = Date.now();
    
    // Check if reset time has passed
    if (now >= usage.resetTime) {
      // Reset counter
      this.usage.delete(serviceName);
      return true;
    }
    
    // Check if under limit
    return usage.count < usage.limit;
  }

  /**
   * Record service usage
   */
  recordUsage(serviceName: string): void {
    const limits = this.SERVICE_LIMITS[serviceName];
    if (!limits || limits.limit === Infinity) return; // No tracking needed
    
    const now = Date.now();
    let usage = this.usage.get(serviceName);
    
    if (!usage) {
      // First use - set reset time based on period
      const resetTime = this.getResetTime(limits.period);
      usage = {
        count: 1,
        resetTime,
        limit: limits.limit,
        period: limits.period,
      };
      this.usage.set(serviceName, usage);
    } else if (now >= usage.resetTime) {
      // Period expired, reset
      const resetTime = this.getResetTime(limits.period);
      usage.count = 1;
      usage.resetTime = resetTime;
    } else {
      // Increment counter
      usage.count++;
    }
    
    console.log(`📊 ${serviceName}: ${usage.count}/${usage.limit} (resets in ${Math.round((usage.resetTime - now) / 1000 / 60)} min)`);
  }

  /**
   * Get reset time based on period
   */
  private getResetTime(period: 'hour' | 'day' | 'month'): number {
    const now = Date.now();
    switch (period) {
      case 'hour':
        return now + 3600000; // 1 hour
      case 'day':
        return now + 86400000; // 24 hours
      case 'month':
        return now + 2592000000; // 30 days
    }
  }

  /**
   * Get remaining requests for a service
   */
  getRemainingRequests(serviceName: string): number {
    const limits = this.SERVICE_LIMITS[serviceName];
    if (!limits || limits.limit === Infinity) return Infinity;
    
    const usage = this.usage.get(serviceName);
    if (!usage) return limits.limit;
    
    const now = Date.now();
    if (now >= usage.resetTime) return limits.limit;
    
    return Math.max(0, usage.limit - usage.count);
  }

  /**
   * Get service order by available capacity
   */
  getServicesByAvailability(serviceNames: string[]): string[] {
    return serviceNames.sort((a, b) => {
      const remainingA = this.getRemainingRequests(a);
      const remainingB = this.getRemainingRequests(b);
      return remainingB - remainingA; // Highest remaining first
    });
  }
}

// Singleton instance
export const rateLimitTracker = new RateLimitTracker();

export default rateLimitTracker;

