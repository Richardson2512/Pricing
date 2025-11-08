"""
API Connector for Backend Integration
Allows Node.js backend to trigger Python scraping jobs
"""

import asyncio
import json
from typing import Dict, List
from workflows.scraping_flow import scrape_market_data_flow
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()


class ScraperAPI:
    """API interface for triggering scraping jobs"""
    
    def __init__(self):
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    async def scrape_and_fetch(
        self,
        business_type: str,
        offering_type: str,
        query: str,
        region: str = 'global'
    ) -> List[Dict]:
        """
        Trigger scraping and return results
        
        Args:
            business_type: 'digital' or 'physical'
            offering_type: 'product' or 'service'
            query: Search query/niche
            region: Geographic region
            
        Returns:
            List of market listings
        """
        
        # Step 1: Trigger scraping flow
        print(f"Triggering scraping for {business_type} {offering_type}: {query}")
        flow_result = scrape_market_data_flow(
            business_type=business_type,
            offering_type=offering_type,
            query=query,
            region=region
        )
        
        # Step 2: Wait for scraping to complete (in production, use async/polling)
        await asyncio.sleep(5)
        
        # Step 3: Fetch results from Supabase
        result = self.supabase.table('market_listings')\
            .select('*')\
            .ilike('category', f'%{query}%')\
            .order('scraped_at', desc=True)\
            .limit(50)\
            .execute()
        
        return result.data if result.data else []
    
    def get_cached_market_data(
        self,
        business_type: str,
        offering_type: str,
        query: str,
        max_age_hours: int = 24
    ) -> List[Dict]:
        """
        Get cached market data from Supabase
        Returns existing data if fresh enough, otherwise triggers new scrape
        
        Args:
            business_type: 'digital' or 'physical'
            offering_type: 'product' or 'service'
            query: Search query
            max_age_hours: Maximum age of cached data in hours
            
        Returns:
            List of market listings
        """
        
        # Check for recent data
        result = self.supabase.table('market_listings')\
            .select('*')\
            .ilike('category', f'%{query}%')\
            .gte('scraped_at', f'now() - interval \'{max_age_hours} hours\'')\
            .order('scraped_at', desc=True)\
            .limit(50)\
            .execute()
        
        if result.data and len(result.data) >= 10:
            print(f"Using cached data ({len(result.data)} listings)")
            return result.data
        
        # No recent data, trigger new scrape
        print("No recent data found, triggering new scrape")
        return asyncio.run(self.scrape_and_fetch(
            business_type, offering_type, query
        ))


def main():
    """CLI interface for testing"""
    import sys
    
    if len(sys.argv) < 4:
        print("Usage: python api_connector.py <business_type> <offering_type> <query>")
        print("Example: python api_connector.py digital service 'ui design'")
        sys.exit(1)
    
    business_type = sys.argv[1]
    offering_type = sys.argv[2]
    query = sys.argv[3]
    
    api = ScraperAPI()
    results = api.get_cached_market_data(business_type, offering_type, query)
    
    print(f"\nFound {len(results)} listings:")
    for listing in results[:5]:
        print(f"  - {listing['title']}: {listing['currency']} {listing['price']}")


if __name__ == '__main__':
    main()

