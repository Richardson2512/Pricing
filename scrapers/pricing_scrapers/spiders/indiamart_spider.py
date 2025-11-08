import scrapy
from pricing_scrapers.items import MarketListingItem


class IndiaMartSpider(scrapy.Spider):
    """
    Spider for scraping IndiaMART product listings
    Used for: physical products and services in India
    """
    name = 'indiamart'
    allowed_domains = ['indiamart.com']

    custom_settings = {
        'CONCURRENT_REQUESTS': 5,
        'DOWNLOAD_DELAY': 2,
    }

    def __init__(self, query='office furniture', *args, **kwargs):
        super(IndiaMartSpider, self).__init__(*args, **kwargs)
        self.query = query
        self.start_urls = [
            f'https://dir.indiamart.com/search.mp?ss={query.replace(" ", "+")}'
        ]

    def parse(self, response):
        """Parse IndiaMART search results"""
        self.logger.info(f'Parsing IndiaMART page: {response.url}')

        products = response.css('div.lst, div.product-card, div.listing-card')

        for product in products[:20]:
            item = MarketListingItem()

            item['source'] = 'IndiaMART'
            item['title'] = product.css('span.prd-name::text, h2.title::text, a.product-title::text').get('').strip()

            # Extract price
            price_text = product.css('span.price::text, div.price span::text').get('')
            item['price'] = self.extract_price(price_text)
            item['currency'] = 'INR'

            # Seller info
            item['seller_name'] = product.css('span.company-name::text, a.seller::text').get('').strip()
            
            # Description
            item['description'] = product.css('div.description::text, p.desc::text').get('').strip()[:200]

            # Rating (if available)
            rating_text = product.css('span.rating::text, div.rating::text').get('')
            item['rating'] = self.extract_rating(rating_text)

            item['category'] = self.query
            item['url'] = response.urljoin(product.css('a::attr(href)').get(''))

            if item['title'] and item['price'] > 0:
                yield item

        # Follow pagination
        next_page = response.css('a.next::attr(href), a.pagination-next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)

    def extract_price(self, text):
        """Extract price from text like '₹ 5,000 / Piece'"""
        try:
            # Remove currency symbols and commas
            numbers = ''.join(filter(lambda x: x.isdigit() or x == '.', text))
            return float(numbers) if numbers else 0.0
        except:
            return 0.0

    def extract_rating(self, text):
        """Extract rating if present"""
        try:
            return float(''.join(filter(lambda x: x.isdigit() or x == '.', text)))
        except:
            return None

