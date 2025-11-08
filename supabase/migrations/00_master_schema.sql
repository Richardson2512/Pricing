/*
  # PriceWise Master Database Schema
  
  Complete database setup for AI-powered pricing platform
  
  Tables:
  1. profiles - User accounts with credits
  2. consultations - Pricing analysis requests and results
  3. credit_purchases - Transaction history
  4. market_listings - Scraped pricing data from platforms
  5. uploaded_documents - Track user document uploads
  6. questionnaire_responses - Store detailed user responses
  
  Storage:
  - documents bucket for SoW/contract uploads
*/

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  credits integer DEFAULT 3 NOT NULL CHECK (credits >= 0),
  total_credits_purchased integer DEFAULT 0,
  total_analyses_completed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_credits ON profiles(credits);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE profiles IS 'User profiles with credit balance and statistics';

-- ============================================================================
-- 2. QUESTIONNAIRE RESPONSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Step 1: Business Classification
  business_type text NOT NULL CHECK (business_type IN ('digital', 'physical')),
  offering_type text NOT NULL CHECK (offering_type IN ('product', 'service')),
  
  -- Step 2: Experience & Market
  experience_level text NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'expert')),
  region text NOT NULL,
  niche text,
  pricing_goal text NOT NULL CHECK (pricing_goal IN ('cost_plus', 'market_rate', 'premium')),
  
  -- Step 3: Product Details
  product_description text NOT NULL,
  cost_to_deliver text NOT NULL,
  
  -- Step 4: Competition & Value
  competitor_pricing text NOT NULL,
  value_proposition text NOT NULL,
  
  -- Additional Context
  target_customer text,
  monthly_volume integer,
  current_price numeric,
  
  -- Metadata
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own responses"
  ON questionnaire_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responses"
  ON questionnaire_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_user ON questionnaire_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_business_type ON questionnaire_responses(business_type, offering_type);

COMMENT ON TABLE questionnaire_responses IS 'Detailed questionnaire responses for pricing analysis';

-- ============================================================================
-- 3. UPLOADED DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS uploaded_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  questionnaire_id uuid REFERENCES questionnaire_responses(id) ON DELETE CASCADE,
  
  -- File Information
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  
  -- Parsed Data (from DeepSeek)
  parsed_deliverables text[],
  parsed_timeline text,
  parsed_tools text[],
  parsed_complexity text CHECK (parsed_complexity IN ('low', 'medium', 'high')),
  parsed_dependencies text[],
  parsing_status text DEFAULT 'pending' CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed')),
  parsing_error text,
  
  -- Metadata
  uploaded_at timestamptz DEFAULT now(),
  parsed_at timestamptz
);

ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON uploaded_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON uploaded_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_documents_user ON uploaded_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_questionnaire ON uploaded_documents(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON uploaded_documents(parsing_status);

COMMENT ON TABLE uploaded_documents IS 'User uploaded documents (SoW, contracts) with parsed data';

-- ============================================================================
-- 4. CONSULTATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  questionnaire_id uuid REFERENCES questionnaire_responses(id) ON DELETE SET NULL,
  
  -- Legacy fields (for backward compatibility)
  business_type text NOT NULL,
  target_market text NOT NULL,
  product_description text NOT NULL,
  cost_to_deliver text NOT NULL,
  competitor_pricing text NOT NULL,
  value_proposition text NOT NULL,
  
  -- AI Analysis Results
  pricing_recommendation text NOT NULL,
  
  -- Pricing Breakdown (structured data)
  price_low numeric,
  price_average numeric,
  price_high numeric,
  recommended_price numeric,
  
  -- Market Data Summary
  market_data_count integer DEFAULT 0,
  market_median_price numeric,
  market_avg_price numeric,
  
  -- Status
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processing_time_seconds integer,
  
  -- Metadata
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultations"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_consultations_user ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created ON consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);

COMMENT ON TABLE consultations IS 'Pricing analysis requests and AI-generated recommendations';

-- ============================================================================
-- 5. CREDIT PURCHASES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS credit_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Purchase Details
  credits_purchased integer NOT NULL CHECK (credits_purchased > 0),
  amount_paid numeric(10,2) NOT NULL CHECK (amount_paid >= 0),
  currency text DEFAULT 'USD',
  
  -- Payment Information
  payment_method text,
  payment_provider text,
  payment_id text,
  payment_status text DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Metadata
  purchase_date timestamptz DEFAULT now()
);

ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON credit_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON credit_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON credit_purchases(purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON credit_purchases(payment_status);

COMMENT ON TABLE credit_purchases IS 'Credit purchase transactions and payment history';

-- ============================================================================
-- 6. MARKET LISTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS market_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source Information
  source text NOT NULL,
  platform_category text,
  
  -- Listing Details
  title text NOT NULL,
  description text,
  url text,
  
  -- Pricing
  price numeric NOT NULL CHECK (price >= 0),
  currency text DEFAULT 'USD',
  price_usd numeric, -- Normalized to USD
  
  -- Quality Metrics
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  reviews integer CHECK (reviews >= 0),
  delivery_time integer CHECK (delivery_time >= 0),
  
  -- Seller Information
  seller_name text,
  seller_level text,
  seller_country text,
  
  -- Classification
  category text,
  tags text[],
  business_type text,
  offering_type text,
  
  -- Quality Score (calculated)
  quality_score numeric,
  
  -- Metadata
  scraped_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;

-- Public read access for market data
CREATE POLICY "Public read access for market listings"
  ON market_listings FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Service role can manage
CREATE POLICY "Service role can manage market listings"
  ON market_listings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_market_source ON market_listings(source);
CREATE INDEX IF NOT EXISTS idx_market_category ON market_listings(category);
CREATE INDEX IF NOT EXISTS idx_market_price ON market_listings(price);
CREATE INDEX IF NOT EXISTS idx_market_scraped ON market_listings(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_business_type ON market_listings(business_type, offering_type);
CREATE INDEX IF NOT EXISTS idx_market_active ON market_listings(is_active) WHERE is_active = true;

COMMENT ON TABLE market_listings IS 'Scraped pricing data from various marketplaces';

-- ============================================================================
-- 7. STORAGE BUCKETS
-- ============================================================================

-- Create storage bucket for user documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Service role can access all documents"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'documents')
  WITH CHECK (bucket_id = 'documents');

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid uuid)
RETURNS TABLE (
  total_credits integer,
  credits_used integer,
  credits_remaining integer,
  total_analyses integer,
  total_spent numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(cp.credits_purchased), 0)::integer + 3 as total_credits,
    COALESCE(p.total_analyses_completed, 0)::integer as credits_used,
    COALESCE(p.credits, 0)::integer as credits_remaining,
    COALESCE(p.total_analyses_completed, 0)::integer as total_analyses,
    COALESCE(SUM(cp.amount_paid), 0)::numeric as total_spent
  FROM profiles p
  LEFT JOIN credit_purchases cp ON cp.user_id = p.id
  WHERE p.id = user_uuid
  GROUP BY p.credits, p.total_analyses_completed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate market statistics for a category
CREATE OR REPLACE FUNCTION get_market_stats(
  category_filter text,
  business_type_filter text DEFAULT NULL,
  offering_type_filter text DEFAULT NULL
)
RETURNS TABLE (
  source text,
  listing_count bigint,
  avg_price numeric,
  min_price numeric,
  max_price numeric,
  median_price numeric,
  top_10_percent numeric,
  bottom_10_percent numeric,
  avg_rating numeric,
  avg_reviews numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.source,
    COUNT(*)::bigint AS listing_count,
    ROUND(AVG(ml.price)::numeric, 2) AS avg_price,
    MIN(ml.price)::numeric AS min_price,
    MAX(ml.price)::numeric AS max_price,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ml.price)::numeric AS median_price,
    PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY ml.price)::numeric AS top_10_percent,
    PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY ml.price)::numeric AS bottom_10_percent,
    ROUND(AVG(ml.rating)::numeric, 2) AS avg_rating,
    ROUND(AVG(ml.reviews)::numeric, 0) AS avg_reviews
  FROM market_listings ml
  WHERE ml.is_active = true
    AND ml.scraped_at > NOW() - INTERVAL '7 days'
    AND (category_filter IS NULL OR ml.category ILIKE '%' || category_filter || '%')
    AND (business_type_filter IS NULL OR ml.business_type = business_type_filter)
    AND (offering_type_filter IS NULL OR ml.offering_type = offering_type_filter)
  GROUP BY ml.source
  HAVING COUNT(*) >= 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credit and update stats
CREATE OR REPLACE FUNCTION deduct_credit_and_update_stats(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  current_credits integer;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits
  FROM profiles
  WHERE id = user_uuid;
  
  -- Check if user has credits
  IF current_credits < 1 THEN
    RETURN false;
  END IF;
  
  -- Deduct credit and update stats
  UPDATE profiles
  SET 
    credits = credits - 1,
    total_analyses_completed = total_analyses_completed + 1,
    updated_at = now()
  WHERE id = user_uuid;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits after purchase
CREATE OR REPLACE FUNCTION add_credits_after_purchase(
  user_uuid uuid,
  credits_to_add integer,
  amount numeric,
  payment_method_name text DEFAULT 'stripe'
)
RETURNS uuid AS $$
DECLARE
  purchase_id uuid;
BEGIN
  -- Insert purchase record
  INSERT INTO credit_purchases (user_id, credits_purchased, amount_paid, payment_method)
  VALUES (user_uuid, credits_to_add, amount, payment_method_name)
  RETURNING id INTO purchase_id;
  
  -- Add credits to profile
  UPDATE profiles
  SET 
    credits = credits + credits_to_add,
    total_credits_purchased = total_credits_purchased + credits_to_add,
    updated_at = now()
  WHERE id = user_uuid;
  
  RETURN purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. VIEWS
-- ============================================================================

-- View for latest market data
CREATE OR REPLACE VIEW latest_market_data AS
SELECT DISTINCT ON (source, category, title)
  *
FROM market_listings
WHERE is_active = true
  AND scraped_at > NOW() - INTERVAL '7 days'
ORDER BY source, category, title, scraped_at DESC;

-- View for user dashboard summary
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.credits,
  p.total_analyses_completed,
  COUNT(DISTINCT c.id) as total_consultations,
  MAX(c.created_at) as last_consultation_date,
  COALESCE(SUM(cp.amount_paid), 0) as total_spent
FROM profiles p
LEFT JOIN consultations c ON c.user_id = p.id
LEFT JOIN credit_purchases cp ON cp.user_id = p.id
GROUP BY p.id, p.email, p.first_name, p.last_name, p.credits, p.total_analyses_completed;

COMMENT ON VIEW user_dashboard_summary IS 'Aggregated user statistics for dashboard';

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

-- Trigger to update profile stats after consultation
CREATE OR REPLACE FUNCTION update_profile_after_consultation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET total_analyses_completed = total_analyses_completed + 1
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_consultation_insert
  AFTER INSERT ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_after_consultation();

-- ============================================================================
-- 11. INITIAL DATA
-- ============================================================================

-- Insert sample market data for testing (optional)
INSERT INTO market_listings (source, title, price, currency, rating, reviews, category, business_type, offering_type)
VALUES 
  ('Fiverr', 'Professional UI/UX Design', 1200, 'USD', 4.9, 234, 'design', 'digital', 'service'),
  ('Fiverr', 'Mobile App Design', 800, 'USD', 4.7, 156, 'design', 'digital', 'service'),
  ('Upwork', 'Full Stack Development', 2500, 'USD', 4.8, 89, 'development', 'digital', 'service'),
  ('Etsy', 'Digital Planner Template', 15, 'USD', 4.6, 1200, 'templates', 'digital', 'product'),
  ('AppSumo', 'Project Management Tool', 49, 'USD', 4.5, 450, 'productivity', 'digital', 'product')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 12. GRANTS
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- Verify setup
DO $$
BEGIN
  RAISE NOTICE '✅ PriceWise Database Schema Created Successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - profiles (with name fields)';
  RAISE NOTICE '  - questionnaire_responses';
  RAISE NOTICE '  - uploaded_documents';
  RAISE NOTICE '  - consultations';
  RAISE NOTICE '  - credit_purchases';
  RAISE NOTICE '  - market_listings';
  RAISE NOTICE '';
  RAISE NOTICE 'Storage buckets:';
  RAISE NOTICE '  - documents (for SoW/contract uploads)';
  RAISE NOTICE '';
  RAISE NOTICE 'Helper functions:';
  RAISE NOTICE '  - get_user_stats()';
  RAISE NOTICE '  - get_market_stats()';
  RAISE NOTICE '  - deduct_credit_and_update_stats()';
  RAISE NOTICE '  - add_credits_after_purchase()';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Ready to use!';
END $$;

