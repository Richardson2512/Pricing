import scrapy
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MarketListingItem(scrapy.Item):
    """Scrapy Item for market listings"""
    source = scrapy.Field()
    title = scrapy.Field()
    price = scrapy.Field()
    currency = scrapy.Field()
    rating = scrapy.Field()
    reviews = scrapy.Field()
    delivery_time = scrapy.Field()
    seller_name = scrapy.Field()
    seller_level = scrapy.Field()
    description = scrapy.Field()
    category = scrapy.Field()
    url = scrapy.Field()
    scraped_at = scrapy.Field()


class MarketListing(BaseModel):
    """Pydantic model for validation and database storage"""
    source: str = Field(..., description="Platform name (Fiverr, Upwork, etc.)")
    title: str = Field(..., description="Listing title")
    price: float = Field(..., ge=0, description="Price in local currency")
    currency: str = Field(default="USD", description="Currency code")
    rating: Optional[float] = Field(None, ge=0, le=5, description="Rating out of 5")
    reviews: Optional[int] = Field(None, ge=0, description="Number of reviews")
    delivery_time: Optional[int] = Field(None, ge=0, description="Delivery time in days")
    seller_name: Optional[str] = Field(None, description="Seller/vendor name")
    seller_level: Optional[str] = Field(None, description="Seller level/badge")
    description: Optional[str] = Field(None, description="Short description")
    category: Optional[str] = Field(None, description="Category/niche")
    url: Optional[str] = Field(None, description="Listing URL")
    scraped_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "source": "Fiverr",
                "title": "Professional UI/UX Design",
                "price": 1200.0,
                "currency": "USD",
                "rating": 4.9,
                "reviews": 234,
                "delivery_time": 7,
                "seller_name": "design_pro",
                "seller_level": "Level 2",
                "category": "Design",
            }
        }

