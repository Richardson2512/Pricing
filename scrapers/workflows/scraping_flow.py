"""
Prefect workflow for orchestrating scraping jobs
Schedules and manages data collection from multiple platforms
"""

from prefect import flow, task
from prefect.tasks import task_input_hash
from datetime import timedelta
import subprocess
import os
from typing import List, Dict


@task(cache_key_fn=task_input_hash, cache_expiration=timedelta(hours=1))
def run_spider(spider_name: str, query: str) -> Dict:
    """
    Run a Scrapy spider with given parameters
    
    Args:
        spider_name: Name of the spider (fiverr, upwork, etc.)
        query: Search query for the spider
        
    Returns:
        Dict with spider results metadata
    """
    try:
        # Run spider using scrapy command
        result = subprocess.run(
            ['scrapy', 'crawl', spider_name, '-a', f'query={query}'],
            cwd=os.path.join(os.path.dirname(__file__), '..'),
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        return {
            'spider': spider_name,
            'query': query,
            'success': result.returncode == 0,
            'output': result.stdout,
            'errors': result.stderr,
        }
    except Exception as e:
        return {
            'spider': spider_name,
            'query': query,
            'success': False,
            'errors': str(e),
        }


@task
def aggregate_results(spider_results: List[Dict]) -> Dict:
    """
    Aggregate results from multiple spiders
    
    Args:
        spider_results: List of spider execution results
        
    Returns:
        Aggregated statistics
    """
    successful = sum(1 for r in spider_results if r['success'])
    failed = len(spider_results) - successful
    
    return {
        'total_spiders': len(spider_results),
        'successful': successful,
        'failed': failed,
        'results': spider_results,
    }


@flow(name="scrape-market-data")
def scrape_market_data_flow(
    business_type: str,
    offering_type: str,
    query: str,
    region: str = 'global'
) -> Dict:
    """
    Main flow for scraping market data based on business parameters
    
    Args:
        business_type: 'digital' or 'physical'
        offering_type: 'product' or 'service'
        query: Search query/niche
        region: Geographic region
        
    Returns:
        Aggregated scraping results
    """
    
    # Determine which spiders to run based on business type
    spiders_to_run = []
    
    if business_type == 'digital' and offering_type == 'service':
        spiders_to_run = ['fiverr', 'upwork', 'freelancer']
    elif business_type == 'digital' and offering_type == 'product':
        spiders_to_run = ['etsy', 'appsumo', 'producthunt']
    elif business_type == 'physical' and offering_type == 'product':
        spiders_to_run = ['indiamart', 'ebay', 'amazon']
    elif business_type == 'physical' and offering_type == 'service':
        spiders_to_run = ['indiamart', 'justdial', 'urbanclap']
    
    # Run spiders in parallel
    spider_results = []
    for spider in spiders_to_run:
        result = run_spider(spider, query)
        spider_results.append(result)
    
    # Aggregate results
    final_results = aggregate_results(spider_results)
    
    return final_results


@flow(name="scheduled-market-refresh")
def scheduled_market_refresh():
    """
    Scheduled flow to refresh market data periodically
    Runs daily to keep pricing data current
    """
    
    # Common categories to scrape
    categories = [
        {'business': 'digital', 'offering': 'service', 'query': 'web development'},
        {'business': 'digital', 'offering': 'service', 'query': 'graphic design'},
        {'business': 'digital', 'offering': 'product', 'query': 'saas tools'},
        {'business': 'physical', 'offering': 'product', 'query': 'electronics'},
    ]
    
    results = []
    for cat in categories:
        result = scrape_market_data_flow(
            business_type=cat['business'],
            offering_type=cat['offering'],
            query=cat['query']
        )
        results.append(result)
    
    return {
        'categories_scraped': len(categories),
        'results': results,
    }


if __name__ == '__main__':
    # Example: Run a single scraping flow
    result = scrape_market_data_flow(
        business_type='digital',
        offering_type='service',
        query='ui ux design',
        region='global'
    )
    print(result)

