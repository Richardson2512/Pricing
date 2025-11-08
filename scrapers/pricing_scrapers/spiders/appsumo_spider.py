import scrapy
from scrapy_playwright.page import PageMethod
from pricing_scrapers.items import MarketListingItem


class AppSumoSpider(scrapy.Spider):
    """
    Spider for scraping AppSumo product listings
    Used for: digital products (SaaS, tools, software)
    """
    name = 'appsumo'
    allowed_domains = ['appsumo.com']

    custom_settings = {
        'CONCURRENT_REQUESTS': 3,
        'DOWNLOAD_DELAY': 4,
    }

    def __init__(self, category='productivity', *args, **kwargs):
        super(AppSumoSpider, self).__init__(*args, **kwargs)
        self.category = category
        self.start_urls = [
            f'https://appsumo.com/browse/{category}/'
        ]

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={
                    'playwright': True,
                    'playwright_page_methods': [
                        PageMethod('wait_for_selector', 'div.product-card', timeout=10000),
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
        """Parse AppSumo product listings"""
        self.logger.info(f'Parsing AppSumo page: {response.url}')

        products = response.css('div.product-card, article.product')

        for product in products[:20]:
            item = MarketListingItem()

            item['source'] = 'AppSumo'
            item['title'] = product.css('h3::text, h2.product-title::text').get('').strip()

            # Extract price
            price_text = product.css('span.price::text, div.pricing span::text').get('')
            item['price'] = self.extract_price(price_text)
            item['currency'] = 'USD'

            # Extract rating
            rating_text = product.css('span.rating::text, div.stars::attr(data-rating)').get('')
            item['rating'] = self.extract_rating(rating_text)

            # Extract reviews
            reviews_text = product.css('span.reviews::text, span.review-count::text').get('')
            item['reviews'] = self.extract_reviews(reviews_text)

            # Description
            item['description'] = product.css('p.description::text, div.excerpt::text').get('').strip()[:200]

            item['category'] = self.category
            item['url'] = response.urljoin(product.css('a::attr(href)').get(''))

            if item['title'] and item['price'] > 0:
                yield item

    def extract_price(self, text):
        """Extract price"""
        try:
            return float(''.join(filter(lambda x: x.isdigit() or x == '.', text)))
        except:
            return 0.0

    def extract_rating(self, text):
        """Extract rating"""
        try:
            return float(''.join(filter(lambda x: x.isdigit() or x == '.', text)))
        except:
            return None

    def extract_reviews(self, text):
        """Extract review count"""
        try:
            return int(''.join(filter(str.isdigit, text)))
        except:
            return 0

