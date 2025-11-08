# PriceWise Scrapers

Python-based web scraping layer for collecting market pricing data from multiple platforms.

## Architecture

This scraper layer uses **Scrapy** with **Playwright** for JavaScript rendering, collecting structured pricing data from various marketplaces.

## Tech Stack

| Purpose | Tool | Why |
|---------|------|-----|
| Crawling | Scrapy | Production-grade, asynchronous, extensible |
| JavaScript rendering | Playwright (scrapy-playwright) | Handles dynamic sites like AppSumo, ProductHunt |
| Data parsing | BeautifulSoup4 / lxml | HTML cleanup and fallback parsing |
| API fallback | Requests / httpx | For platforms with official APIs |
| Proxy rotation | scrapy-rotating-proxies | Distribute scraping load |
| Scheduling | Prefect | Orchestrate periodic crawls |
| Data validation | Pydantic | Ensure data quality |
| Database | Supabase (PostgreSQL) | Store scraped data |

## Project Structure

```
scrapers/
├── pricing_scrapers/
│   ├── __init__.py
│   ├── settings.py              # Scrapy configuration
│   ├── items.py                 # Data models
│   ├── pipelines.py             # Data cleaning & storage
│   ├── middlewares.py           # Request/response processing
│   └── spiders/
│       ├── __init__.py
│       ├── fiverr_spider.py     # Digital services
│       ├── upwork_spider.py     # Digital services
│       ├── freelancer_spider.py # Digital services
│       ├── etsy_spider.py       # Digital products
│       ├── appsumo_spider.py    # Digital products (SaaS)
│       ├── producthunt_spider.py # Digital products
│       └── indiamart_spider.py  # Physical products/services
├── workflows/
│   └── scraping_flow.py         # Prefect orchestration
├── requirements.txt             # Python dependencies
├── scrapy.cfg                   # Scrapy project config
├── .env.example
└── README.md
```

## Platform Mapping

### Digital Services
- **Fiverr** - Freelance services (design, development, writing)
- **Upwork** - Professional freelancing
- **Freelancer.com** - Global freelance marketplace

### Digital Products
- **Etsy** - Digital downloads, templates, printables
- **AppSumo** - SaaS tools and software
- **ProductHunt** - New digital products

### Physical Products
- **IndiaMART** - B2B products (India)
- **eBay** - Consumer products (global)
- **Amazon** - E-commerce products

### Physical Services
- **IndiaMART** - Business services (India)
- **Justdial** - Local services (India)
- **UrbanClap/Urban Company** - Home services

## Setup

### 1. Install Python Dependencies

```bash
cd scrapers
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Install Playwright Browsers

```bash
playwright install chromium
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Test a Spider

```bash
# Run Fiverr spider
scrapy crawl fiverr -a query="ui design"

# Run Upwork spider
scrapy crawl upwork -a query="web development"

# Run with output file
scrapy crawl fiverr -a query="logo design" -o output/fiverr_results.json
```

## Running Spiders

### Single Spider

```bash
scrapy crawl fiverr -a query="graphic design"
```

### All Spiders for a Category

```python
from workflows.scraping_flow import scrape_market_data_flow

result = scrape_market_data_flow(
    business_type='digital',
    offering_type='service',
    query='web development',
    region='global'
)
```

### Scheduled Scraping with Prefect

```bash
# Start Prefect server
prefect server start

# Deploy flow
python workflows/scraping_flow.py

# Schedule daily refresh
prefect deployment build workflows/scraping_flow.py:scheduled_market_refresh \
  --name "daily-market-refresh" \
  --cron "0 2 * * *"  # Run at 2 AM daily
```

## Data Pipeline

```
1. Spider scrapes platform
   ↓
2. DataCleaningPipeline normalizes data
   ↓
3. SupabasePipeline stores in database
   ↓
4. Backend API queries Supabase
   ↓
5. DeepSeek analyzes market data
   ↓
6. User receives pricing recommendation
```

## Output Format

Each spider outputs standardized JSON:

```json
{
  "source": "Fiverr",
  "title": "Professional UI/UX Design",
  "price": 1200.0,
  "currency": "USD",
  "rating": 4.9,
  "reviews": 234,
  "delivery_time": 7,
  "seller_name": "design_pro",
  "seller_level": "Level 2",
  "category": "ui design",
  "url": "https://fiverr.com/...",
  "scraped_at": "2025-11-08T10:30:00Z"
}
```

## Database Schema

Create `market_listings` table in Supabase:

```sql
CREATE TABLE market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  rating NUMERIC,
  reviews INTEGER,
  delivery_time INTEGER,
  seller_name TEXT,
  seller_level TEXT,
  description TEXT,
  category TEXT,
  url TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_market_listings_source ON market_listings(source);
CREATE INDEX idx_market_listings_category ON market_listings(category);
CREATE INDEX idx_market_listings_price ON market_listings(price);
```

## Anti-Detection Features

- **Random User Agents** - Rotates browser signatures
- **Download Delays** - Respects rate limits
- **Playwright** - Renders JavaScript like real browser
- **Proxy Support** - Optional proxy rotation
- **Auto-throttle** - Adapts speed based on response times

## Monitoring

### Scrapy Stats

```bash
# View spider statistics
scrapy crawl fiverr -a query="design" -s LOG_LEVEL=INFO
```

### Prefect Dashboard

```bash
# Access at http://localhost:4200
prefect server start
```

## Troubleshooting

### Spider Not Finding Elements

- Check if site structure changed
- Verify CSS selectors in spider code
- Enable Playwright screenshots for debugging

### Rate Limiting / Blocks

- Increase `DOWNLOAD_DELAY` in settings
- Enable proxy rotation
- Reduce `CONCURRENT_REQUESTS`

### Database Connection Issues

- Verify Supabase credentials in `.env`
- Check network connectivity
- Ensure `market_listings` table exists

## Integration with Backend

The backend calls the scraping service via:

```typescript
// backend/src/services/marketScraper.ts
import { exec } from 'child_process';

async function triggerScraping(config) {
  // Trigger Python scraping workflow
  exec(`python workflows/scraping_flow.py --config '${JSON.stringify(config)}'`);
  
  // Poll Supabase for results
  // Return cleaned market data
}
```

## Production Deployment

### Option 1: Separate Scraping Service

- Deploy scrapers on dedicated server
- Use Prefect Cloud for orchestration
- Backend triggers via API calls

### Option 2: Integrated with Backend

- Include Python runtime in backend container
- Run spiders as subprocess
- Use Redis for job queue

### Option 3: Serverless

- Deploy spiders as AWS Lambda / Google Cloud Functions
- Trigger on-demand via API Gateway
- Store results in Supabase

## Best Practices

1. **Respect robots.txt** (currently disabled for demo)
2. **Use reasonable delays** (2-4 seconds between requests)
3. **Rotate user agents** to avoid detection
4. **Cache results** for 1-24 hours
5. **Monitor for changes** in site structure
6. **Handle errors gracefully** with retries
7. **Store raw HTML** for debugging
8. **Log all scraping activity**

## Legal & Ethical Considerations

- Review each platform's Terms of Service
- Use public data only
- Don't overload servers
- Consider using official APIs where available
- Respect rate limits and robots.txt
- Store data securely and comply with privacy laws

## Maintenance

- **Weekly**: Check if spiders still work
- **Monthly**: Update CSS selectors if sites change
- **Quarterly**: Review and update platform list
- **As needed**: Add new platforms based on user requests

