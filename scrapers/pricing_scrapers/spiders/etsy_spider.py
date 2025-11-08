import scrapy
from scrapy_playwright.page import PageMethod
from pricing_scrapers.items import MarketListingItem


class EtsySpider(scrapy.Spider):
    """
    Spider for scraping Etsy product listings
    Used for: digital products (templates, graphics, printables)
    """
    name = 'etsy'
    allowed_domains = ['etsy.com']

    custom_settings = {
        'CONCURRENT_REQUESTS': 4,
        'DOWNLOAD_DELAY': 3,
    }

    def __init__(self, query='digital planner', *args, **kwargs):
        super(EtsySpider, self).__init__(*args, **kwargs)
        self.query = query
        self.start_urls = [
            f'https://www.etsy.com/search?q={query.replace(" ", "+")}'
        ]

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={
                    'playwright': True,
                    'playwright_page_methods': [
                        PageMethod('wait_for_selector', 'div.listing-link', timeout=10000),
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
        """Parse Etsy search results"""
        self.logger.info(f'Parsing Etsy page: {response.url}')

        listings = response.css('div.listing-link, li.listing')

        for listing in listings[:20]:
            item = MarketListingItem()

            item['source'] = 'Etsy'
            item['title'] = listing.css('h3::text, h2.listing-title::text').get('').strip()

            # Extract price
            price_text = listing.css('span.currency-value::text, span.price::text').get('')
            item['price'] = self.extract_price(price_text)
            item['currency'] = listing.css('span.currency-symbol::text').get('$').strip()

            # Extract rating
            rating_text = listing.css('span.rating::text, div.stars::attr(data-rating)').get('')
            item['rating'] = self.extract_rating(rating_text)

            # Extract reviews
            reviews_text = listing.css('span.review-count::text').get('')
            item['reviews'] = self.extract_reviews(reviews_text)

            # Seller info
            item['seller_name'] = listing.css('span.shop-name::text, a.shop-link::text').get('').strip()

            item['category'] = self.query
            item['url'] = response.urljoin(listing.css('a::attr(href)').get(''))

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

