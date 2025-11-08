import scrapy
from scrapy_playwright.page import PageMethod
from pricing_scrapers.items import MarketListingItem


class ProductHuntSpider(scrapy.Spider):
    """
    Spider for scraping ProductHunt listings
    Used for: digital products and SaaS pricing
    """
    name = 'producthunt'
    allowed_domains = ['producthunt.com']

    custom_settings = {
        'CONCURRENT_REQUESTS': 3,
        'DOWNLOAD_DELAY': 4,
    }

    def __init__(self, category='productivity', *args, **kwargs):
        super(ProductHuntSpider, self).__init__(*args, **kwargs)
        self.category = category
        self.start_urls = [
            f'https://www.producthunt.com/topics/{category}'
        ]

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={
                    'playwright': True,
                    'playwright_page_methods': [
                        PageMethod('wait_for_selector', 'div[data-test="post-item"]', timeout=10000),
                    ],
                },
                callback=self.parse,
                errback=self.errback_close_page,
            )

    async def errback_close_page(self, failure):
        page = failure.request.meta.get('playwright_page')
        if page:
            await page.close()

    def parse(self, response):
        """Parse ProductHunt listings"""
        self.logger.info(f'Parsing ProductHunt page: {response.url}')

        products = response.css('div[data-test="post-item"], article.product')

        for product in products[:20]:
            item = MarketListingItem()

            item['source'] = 'ProductHunt'
            item['title'] = product.css('h3::text, a.product-name::text').get('').strip()

            # ProductHunt doesn't always show prices directly
            # We'll extract from description or use placeholder
            price_text = product.css('span.price::text, div.pricing::text').get('Free')
            item['price'] = self.extract_price(price_text)
            item['currency'] = 'USD'

            # Extract upvotes as proxy for rating
            upvotes_text = product.css('span.upvotes::text, button.vote-count::text').get('')
            item['reviews'] = self.extract_upvotes(upvotes_text)
            
            # Convert upvotes to rating (normalize)
            if item['reviews']:
                item['rating'] = min(5.0, (item['reviews'] / 100) + 3.5)

            # Description
            item['description'] = product.css('p.tagline::text, p.description::text').get('').strip()[:200]

            item['category'] = self.category
            item['url'] = response.urljoin(product.css('a::attr(href)').get(''))

            if item['title']:
                yield item

    def extract_price(self, text):
        """Extract price or return 0 for free products"""
        try:
            if 'free' in text.lower():
                return 0.0
            return float(''.join(filter(lambda x: x.isdigit() or x == '.', text)))
        except:
            return 0.0

    def extract_upvotes(self, text):
        """Extract upvote count"""
        try:
            return int(''.join(filter(str.isdigit, text)))
        except:
            return 0

