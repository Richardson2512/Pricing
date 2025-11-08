import os
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()


class DataCleaningPipeline:
    """Clean and normalize scraped data"""

    def process_item(self, item, spider):
        # Clean price
        if 'price' in item:
            price_str = str(item['price']).replace(',', '').replace('$', '').replace('₹', '')
            try:
                item['price'] = float(price_str)
            except (ValueError, TypeError):
                item['price'] = 0.0

        # Clean rating
        if 'rating' in item and item['rating']:
            try:
                item['rating'] = float(item['rating'])
                if item['rating'] > 5:
                    item['rating'] = item['rating'] / 10  # Normalize to 5-star scale
            except (ValueError, TypeError):
                item['rating'] = None

        # Clean reviews
        if 'reviews' in item and item['reviews']:
            try:
                reviews_str = str(item['reviews']).replace(',', '').replace('k', '000')
                item['reviews'] = int(float(reviews_str))
            except (ValueError, TypeError):
                item['reviews'] = 0

        # Clean delivery time
        if 'delivery_time' in item and item['delivery_time']:
            try:
                delivery_str = str(item['delivery_time']).lower()
                if 'day' in delivery_str:
                    item['delivery_time'] = int(''.join(filter(str.isdigit, delivery_str)))
                elif 'week' in delivery_str:
                    weeks = int(''.join(filter(str.isdigit, delivery_str)))
                    item['delivery_time'] = weeks * 7
            except (ValueError, TypeError):
                item['delivery_time'] = None

        # Add timestamp
        item['scraped_at'] = datetime.utcnow().isoformat()

        return item


class SupabasePipeline:
    """Store cleaned data in Supabase"""

    def __init__(self):
        self.supabase: Client = None

    def open_spider(self, spider):
        """Initialize Supabase connection"""
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

        if not supabase_url or not supabase_key:
            spider.logger.warning('Supabase credentials not found, skipping database storage')
            return

        self.supabase = create_client(supabase_url, supabase_key)
        spider.logger.info('Connected to Supabase')

    def process_item(self, item, spider):
        """Store item in Supabase"""
        if not self.supabase:
            return item

        try:
            # Convert Scrapy Item to dict
            data = dict(item)

            # Insert into market_listings table
            result = self.supabase.table('market_listings').insert(data).execute()
            spider.logger.info(f'Stored listing: {data.get("title", "Unknown")}')

        except Exception as e:
            spider.logger.error(f'Error storing item in Supabase: {e}')

        return item

    def close_spider(self, spider):
        """Cleanup on spider close"""
        spider.logger.info('Closing Supabase pipeline')

