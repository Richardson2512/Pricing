-- Fix the HowMuchShouldIPrice.com link in the first blog post to be blue

UPDATE blog_posts
SET content = REPLACE(
  content,
  '<p>That''s exactly what <strong>HowMuchShouldIPrice.com</strong> helps you figure out',
  '<p>That''s exactly what <strong><a href="https://howmuchshouldiprice.com" target="_blank">HowMuchShouldIPrice.com</a></strong> helps you figure out'
)
WHERE slug = 'how-to-price-your-product-right-way-2025';

