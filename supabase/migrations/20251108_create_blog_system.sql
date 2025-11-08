-- Create blog system tables
-- This migration creates tables for storing SEO-optimized blog posts

-- Blog categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'HowMuchShouldIPrice Team',
  
  -- SEO fields
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT[],
  canonical_url TEXT,
  
  -- SEO optimization
  focus_keyword TEXT NOT NULL,
  reading_time_minutes INTEGER DEFAULT 5,
  
  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog post tags junction table
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_focus_keyword ON blog_posts(focus_keyword);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access to published posts
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Anyone can view blog categories"
  ON blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view blog tags"
  ON blog_tags FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view blog post tags"
  ON blog_post_tags FOR SELECT
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

-- Insert blog categories
INSERT INTO blog_categories (name, slug, description, meta_title, meta_description) VALUES
  ('Pricing Guides', 'pricing-guides', 'Comprehensive guides on pricing strategies for products and services', 'Pricing Guides | HowMuchShouldIPrice', 'Expert pricing guides to help you price your products and services correctly'),
  ('Freelancing', 'freelancing', 'Pricing advice specifically for freelancers and independent contractors', 'Freelance Pricing Advice | HowMuchShouldIPrice', 'Learn how to price your freelance services and maximize your earnings'),
  ('Digital Products', 'digital-products', 'Pricing strategies for SaaS, apps, courses, and digital goods', 'Digital Product Pricing | HowMuchShouldIPrice', 'Discover the best pricing strategies for digital products and SaaS'),
  ('Physical Products', 'physical-products', 'Pricing guidance for physical goods, crafts, and merchandise', 'Physical Product Pricing | HowMuchShouldIPrice', 'Learn how to price physical products with our expert guides'),
  ('Pricing Tools', 'pricing-tools', 'Reviews and guides for pricing calculators and tools', 'Pricing Tools & Calculators | HowMuchShouldIPrice', 'Discover the best pricing tools and calculators for your business')
ON CONFLICT (slug) DO NOTHING;

-- Insert common tags
INSERT INTO blog_tags (name, slug) VALUES
  ('Pricing Strategy', 'pricing-strategy'),
  ('Freelancing', 'freelancing'),
  ('SaaS Pricing', 'saas-pricing'),
  ('Product Pricing', 'product-pricing'),
  ('Service Pricing', 'service-pricing'),
  ('Pricing Calculator', 'pricing-calculator'),
  ('Pricing Tips', 'pricing-tips'),
  ('Business Strategy', 'business-strategy'),
  ('Revenue Optimization', 'revenue-optimization'),
  ('Market Analysis', 'market-analysis')
ON CONFLICT (slug) DO NOTHING;

