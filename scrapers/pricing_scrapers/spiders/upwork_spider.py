import scrapy
from scrapy_playwright.page import PageMethod
from pricing_scrapers.items import MarketListingItem


class UpworkSpider(scrapy.Spider):
    """
    Spider for scraping Upwork freelancer listings
    Used for: digital services (development, design, writing, etc.)
    """
    name = 'upwork'
    allowed_domains = ['upwork.com']

    custom_settings = {
        'CONCURRENT_REQUESTS': 3,
        'DOWNLOAD_DELAY': 4,
    }

    def __init__(self, query='web development', *args, **kwargs):
        super(UpworkSpider, self).__init__(*args, **kwargs)
        self.query = query
        self.start_urls = [
            f'https://www.upwork.com/search/profiles/?q={query.replace(" ", "%20")}'
        ]

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={
                    'playwright': True,
                    'playwright_page_methods': [
                        PageMethod('wait_for_selector', 'article.profile-item', timeout=10000),
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
        """Parse Upwork freelancer profiles"""
        self.logger.info(f'Parsing Upwork page: {response.url}')

        profiles = response.css('article.profile-item, div.freelancer-card')

        for profile in profiles[:20]:
            item = MarketListingItem()

            item['source'] = 'Upwork'
            item['title'] = profile.css('h4::text, h3.freelancer-title::text').get('').strip()

            # Extract hourly rate
            rate_text = profile.css('span.rate::text, strong.hourly-rate::text').get('')
            item['price'] = self.extract_price(rate_text)
            item['currency'] = 'USD'

            # Extract rating
            rating_text = profile.css('span.rating::text, div.rating strong::text').get('')
            item['rating'] = self.extract_rating(rating_text)

            # Extract reviews/jobs
            reviews_text = profile.css('span.reviews::text, span.jobs-count::text').get('')
            item['reviews'] = self.extract_reviews(reviews_text)

            # Seller info
            item['seller_name'] = profile.css('a.freelancer-name::text, span.name::text').get('').strip()
            item['seller_level'] = profile.css('span.badge::text, div.level::text').get('').strip()

            # Description
            item['description'] = profile.css('p.description::text, div.overview::text').get('').strip()[:200]

            item['category'] = self.query
            item['url'] = response.urljoin(profile.css('a::attr(href)').get(''))

            if item['title'] and item['price'] > 0:
                yield item

    def extract_price(self, text):
        """Extract hourly rate from text like '$50/hr'"""
        try:
            numbers = ''.join(filter(lambda x: x.isdigit() or x == '.', text))
            return float(numbers) if numbers else 0.0
        except:
            return 0.0

    def extract_rating(self, text):
        """Extract rating from text"""
        try:
            return float(''.join(filter(lambda x: x.isdigit() or x == '.', text)))
        except:
            return None

    def extract_reviews(self, text):
        """Extract review/job count"""
        try:
            return int(''.join(filter(str.isdigit, text)))
        except:
            return 0

