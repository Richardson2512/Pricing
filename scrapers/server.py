"""
FastAPI Server for Scraper Service
Provides REST API endpoints for backend to trigger scraping
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import os
from dotenv import load_dotenv
from api_connector import ScraperAPI
import asyncio

load_dotenv()

app = FastAPI(
    title="Pricing Scrapers API",
    description="Market data scraping service for HowMuchShouldIPrice",
    version="1.0.0"
)

# CORS configuration
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3001')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        BACKEND_URL,
        FRONTEND_URL,
        "https://*.railway.app",
        "https://*.vercel.app",
        "https://howmuchshouldiprice.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize scraper API
scraper_api = ScraperAPI()


class ScrapeRequest(BaseModel):
    """Request model for scraping"""
    business_type: str  # 'digital' or 'physical'
    offering_type: str  # 'product' or 'service'
    query: str
    region: Optional[str] = 'global'
    use_cache: Optional[bool] = True
    max_age_hours: Optional[int] = 24


class ScrapeResponse(BaseModel):
    """Response model for scraping"""
    status: str
    message: str
    count: int
    data: List[Dict]


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Pricing Scrapers API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "supabase_connected": bool(os.getenv('SUPABASE_URL')),
        "environment": os.getenv('ENVIRONMENT', 'development')
    }


@app.post("/scrape", response_model=ScrapeResponse)
async def scrape_market_data(request: ScrapeRequest):
    """
    Trigger market data scraping
    
    Args:
        request: ScrapeRequest with business_type, offering_type, query
        
    Returns:
        ScrapeResponse with scraped market listings
    """
    try:
        # Validate inputs
        if request.business_type not in ['digital', 'physical']:
            raise HTTPException(
                status_code=400,
                detail="business_type must be 'digital' or 'physical'"
            )
        
        if request.offering_type not in ['product', 'service']:
            raise HTTPException(
                status_code=400,
                detail="offering_type must be 'product' or 'service'"
            )
        
        # Use cached data if available and requested
        if request.use_cache:
            results = scraper_api.get_cached_market_data(
                business_type=request.business_type,
                offering_type=request.offering_type,
                query=request.query,
                max_age_hours=request.max_age_hours
            )
        else:
            # Trigger fresh scrape
            results = await scraper_api.scrape_and_fetch(
                business_type=request.business_type,
                offering_type=request.offering_type,
                query=request.query,
                region=request.region
            )
        
        return ScrapeResponse(
            status="success",
            message=f"Found {len(results)} market listings",
            count=len(results),
            data=results
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Scraping failed: {str(e)}"
        )


@app.post("/scrape/async")
async def scrape_async(request: ScrapeRequest, background_tasks: BackgroundTasks):
    """
    Trigger scraping in background (non-blocking)
    Returns immediately, scraping happens in background
    """
    try:
        # Add scraping to background tasks
        background_tasks.add_task(
            scraper_api.scrape_and_fetch,
            request.business_type,
            request.offering_type,
            request.query,
            request.region
        )
        
        return {
            "status": "accepted",
            "message": "Scraping job queued in background",
            "query": request.query
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to queue scraping job: {str(e)}"
        )


@app.get("/cache/{query}")
async def get_cached_data(
    query: str,
    business_type: str = 'digital',
    offering_type: str = 'service',
    max_age_hours: int = 24
):
    """
    Get cached market data without triggering new scrape
    """
    try:
        results = scraper_api.get_cached_market_data(
            business_type=business_type,
            offering_type=offering_type,
            query=query,
            max_age_hours=max_age_hours
        )
        
        return {
            "status": "success",
            "count": len(results),
            "data": results
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch cached data: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv('PORT', 8000))
    
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv('ENVIRONMENT') == 'development'
    )

