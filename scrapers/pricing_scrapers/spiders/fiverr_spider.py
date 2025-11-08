import scrapy
from scrapy_playwright.page import PageMethod
from pricing_scrapers.items import MarketListingItem


class FiverrSpider(scrapy.Spider):
    """
    Spider for scraping Fiverr gig listings
    Used for: digital services (design, development, writing, etc.)
    """
    name = 'fiverr'
    allowed_domains = ['fiverr.com']

    custom_settings = {
        'CONCURRENT_REQUESTS': 4,
        'DOWNLOAD_DELAY': 3,
    }

    def __init__(self, query='ui design', *args, **kwargs):
        super(FiverrSpider, self).__init__(*args, **kwargs)
        self.query = query
        self.start_urls = [
            f'https://www.fiverr.com/search/gigs?query={query.replace(" ", "%20")}&source=top-bar&search_in=everywhere'
        ]

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={
                    'playwright': True,
                    'playwright_page_methods': [
                        PageMethod('wait_for_selector', 'div[data-gig-card]', timeout=10000),
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
        """Parse Fiverr search results"""
        self.logger.info(f'Parsing Fiverr page: {response.url}')

        # Extract gig cards
        gigs = response.css('div[data-gig-card]')
        
        for gig in gigs[:20]:  # Limit to 20 results
            item = MarketListingItem()

            item['source'] = 'Fiverr'
            item['title'] = gig.css('h3::text, a.gig-title::text').get('').strip()
            
            # Extract price
            price_text = gig.css('span.price::text, div.price span::text').get('')
            item['price'] = self.clean_price(price_text)
            item['currency'] = 'USD'

            # Extract rating
            rating_text = gig.css('span.rating-score::text, div.rating span::text').get('')
            item['rating'] = self.clean_rating(rating_text)

            # Extract reviews
            reviews_text = gig.css('span.rating-count::text, span.reviews::text').get('')
            item['reviews'] = self.clean_reviews(reviews_text)

            # Extract seller info
            item['seller_name'] = gig.css('span.seller-name::text, a.seller-link::text').get('').strip()
            item['seller_level'] = gig.css('span.seller-level::text, div.level::text').get('').strip()

            # Extract delivery time
            delivery_text = gig.css('span.delivery::text, div.delivery-time::text').get('')
            item['delivery_time'] = self.clean_delivery(delivery_text)

            item['category'] = self.query
            item['url'] = response.urljoin(gig.css('a::attr(href)').get(''))

            if item['title'] and item['price'] > 0:
                yield item

    def clean_price(self, price_text):
        """Extract numeric price from text"""
        try:
            return float(''.join(filter(lambda x: x.isdigit() or x == '.', price_text)))
        except:
            return 0.0

    def clean_rating(self, rating_text):
        """Extract rating number"""
        try:
            return float(''.join(filter(lambda x: x.isdigit() or x == '.', rating_text)))
        except:
            return None

    def clean_reviews(self, reviews_text):
        """Extract review count"""
        try:
            # Handle formats like "234", "(234)", "1.2k"
            text = reviews_text.replace('(', '').replace(')', '').replace(',', '')
            if 'k' in text.lower():
                return int(float(text.lower().replace('k', '')) * 1000)
            return int(''.join(filter(str.isdigit, text)))
        except:
            return 0

    def clean_delivery(self, delivery_text):
        """Extract delivery time in days"""
        try:
            text = delivery_text.lower()
            if 'day' in text:
                return int(''.join(filter(str.isdigit, text)))
            elif 'week' in text:
                return int(''.join(filter(str.isdigit, text))) * 7
            elif 'month' in text:
                return int(''.join(filter(str.isdigit, text))) * 30
        except:
            pass
        return None

