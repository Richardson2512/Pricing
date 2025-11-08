/*
  # Market Listings Table
  
  Stores scraped pricing data from various platforms
  Used by DeepSeek AI for market analysis
*/

CREATE TABLE IF NOT EXISTS market_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  title text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  currency text DEFAULT 'USD',
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  reviews integer CHECK (reviews >= 0),
  delivery_time integer CHECK (delivery_time >= 0),
  seller_name text,
  seller_level text,
  description text,
  category text,
  url text,
  scraped_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_listings_source ON market_listings(source);
CREATE INDEX IF NOT EXISTS idx_market_listings_category ON market_listings(category);
CREATE INDEX IF NOT EXISTS idx_market_listings_price ON market_listings(price);
CREATE INDEX IF NOT EXISTS idx_market_listings_scraped_at ON market_listings(scraped_at);

-- Enable Row Level Security
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read market data (it's public)
CREATE POLICY "Public read access for market listings"
  ON market_listings FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only service role can insert/update
CREATE POLICY "Service role can manage market listings"
  ON market_listings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create view for latest market data by category
CREATE OR REPLACE VIEW latest_market_data AS
SELECT DISTINCT ON (source, category, title)
  *
FROM market_listings
WHERE scraped_at > NOW() - INTERVAL '7 days'
ORDER BY source, category, title, scraped_at DESC;

-- Function to get market statistics for a category
CREATE OR REPLACE FUNCTION get_market_stats(category_name text)
RETURNS TABLE (
  source text,
  avg_price numeric,
  min_price numeric,
  max_price numeric,
  median_price numeric,
  listing_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.source,
    AVG(ml.price)::numeric AS avg_price,
    MIN(ml.price)::numeric AS min_price,
    MAX(ml.price)::numeric AS max_price,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ml.price)::numeric AS median_price,
    COUNT(*)::bigint AS listing_count
  FROM market_listings ml
  WHERE ml.category ILIKE '%' || category_name || '%'
    AND ml.scraped_at > NOW() - INTERVAL '7 days'
  GROUP BY ml.source;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE market_listings IS 'Stores scraped pricing data from marketplaces for AI analysis';
COMMENT ON FUNCTION get_market_stats IS 'Calculate market statistics for a given category';

