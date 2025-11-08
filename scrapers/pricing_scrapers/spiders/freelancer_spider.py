import scrapy
from scrapy_playwright.page import PageMethod
from pricing_scrapers.items import MarketListingItem


class FreelancerSpider(scrapy.Spider):
    """
    Spider for scraping Freelancer.com listings
    Used for: digital services (all categories)
    """
    name = 'freelancer'
    allowed_domains = ['freelancer.com']

    custom_settings = {
        'CONCURRENT_REQUESTS': 3,
        'DOWNLOAD_DELAY': 4,
    }

    def __init__(self, query='web development', *args, **kwargs):
        super(FreelancerSpider, self).__init__(*args, **kwargs)
        self.query = query
        self.start_urls = [
            f'https://www.freelancer.com/freelancers/{query.replace(" ", "-")}'
        ]

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={
                    'playwright': True,
                    'playwright_page_methods': [
                        PageMethod('wait_for_selector', 'div.FreelancerInfo', timeout=10000),
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
        """Parse Freelancer.com profiles"""
        self.logger.info(f'Parsing Freelancer.com page: {response.url}')

        freelancers = response.css('div.FreelancerInfo, div.freelancer-card')

        for freelancer in freelancers[:20]:
            item = MarketListingItem()

            item['source'] = 'Freelancer.com'
            item['title'] = freelancer.css('a.FreelancerInfo-name::text, h3.name::text').get('').strip()

            # Extract hourly rate
            rate_text = freelancer.css('span.hourly-rate::text, div.rate span::text').get('')
            item['price'] = self.extract_price(rate_text)
            item['currency'] = 'USD'

            # Extract rating
            rating_text = freelancer.css('span.rating::text, div.rating strong::text').get('')
            item['rating'] = self.extract_rating(rating_text)

            # Extract reviews
            reviews_text = freelancer.css('span.reviews::text, span.review-count::text').get('')
            item['reviews'] = self.extract_reviews(reviews_text)

            # Seller info
            item['seller_name'] = item['title']
            item['seller_level'] = freelancer.css('span.badge::text, div.level::text').get('').strip()

            # Description
            item['description'] = freelancer.css('p.description::text, div.summary::text').get('').strip()[:200]

            item['category'] = self.query
            item['url'] = response.urljoin(freelancer.css('a::attr(href)').get(''))

            if item['title'] and item['price'] > 0:
                yield item

    def extract_price(self, text):
        """Extract hourly rate"""
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

