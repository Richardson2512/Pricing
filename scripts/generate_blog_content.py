"""
Blog Content Generator
Uses DeepSeek AI to generate SEO-optimized blog posts for target keywords
"""

import os
import json
from datetime import datetime, timedelta
from supabase import create_client
from dotenv import load_dotenv
import requests

load_dotenv()

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY')
DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Target keywords for blog posts
KEYWORDS = [
    {
        'keyword': 'price recommendation tool',
        'category': 'pricing-tools',
        'title': 'The Ultimate Price Recommendation Tool: How AI Can Help You Price Anything',
    },
    {
        'keyword': 'how to price your product',
        'category': 'pricing-guides',
        'title': 'How to Price Your Product: The Complete 2025 Guide',
    },
    {
        'keyword': 'how to price your service',
        'category': 'pricing-guides',
        'title': 'How to Price Your Service: Expert Strategies for Service-Based Businesses',
    },
    {
        'keyword': 'pricing calculator for freelancers',
        'category': 'freelancing',
        'title': 'Best Pricing Calculator for Freelancers: Find Your Perfect Rate',
    },
    {
        'keyword': 'pricing strategy for digital products',
        'category': 'digital-products',
        'title': 'Pricing Strategy for Digital Products: SaaS, Apps, and More',
    },
    {
        'keyword': 'pricing strategy for physical products',
        'category': 'physical-products',
        'title': 'Pricing Strategy for Physical Products: From Crafts to Electronics',
    },
    {
        'keyword': 'optimal service pricing guide',
        'category': 'pricing-guides',
        'title': 'Optimal Service Pricing Guide: How to Charge What You\'re Worth',
    },
    {
        'keyword': 'freelance service pricing tool',
        'category': 'freelancing',
        'title': 'Freelance Service Pricing Tool: Calculate Your Rates Accurately',
    },
    {
        'keyword': 'automate product pricing analysis',
        'category': 'pricing-tools',
        'title': 'Automate Product Pricing Analysis: Save Time and Increase Profits',
    },
    {
        'keyword': 'smart price suggestion for services',
        'category': 'pricing-guides',
        'title': 'Smart Price Suggestion for Services: AI-Powered Pricing Intelligence',
    },
    {
        'keyword': 'market-based pricing tool',
        'category': 'pricing-tools',
        'title': 'Market-Based Pricing Tool: Price According to Real Market Data',
    },
    {
        'keyword': 'cost-based pricing calculator',
        'category': 'pricing-tools',
        'title': 'Cost-Based Pricing Calculator: Ensure Profitability Every Time',
    },
    {
        'keyword': 'competitive pricing analysis online',
        'category': 'pricing-guides',
        'title': 'Competitive Pricing Analysis Online: Beat Your Competition',
    },
    {
        'keyword': 'pricing intelligence platform for SMEs',
        'category': 'pricing-tools',
        'title': 'Pricing Intelligence Platform for SMEs: Enterprise Tools for Small Business',
    },
    {
        'keyword': 'how much should I charge as a freelancer',
        'category': 'freelancing',
        'title': 'How Much Should I Charge as a Freelancer? The Definitive Answer',
    },
    {
        'keyword': 'realistic price range for my service',
        'category': 'pricing-guides',
        'title': 'Finding a Realistic Price Range for Your Service: Data-Driven Approach',
    },
    {
        'keyword': 'benchmark pricing for digital products',
        'category': 'digital-products',
        'title': 'Benchmark Pricing for Digital Products: What Others Are Charging',
    },
    {
        'keyword': 'travel costs service pricing calculator',
        'category': 'pricing-tools',
        'title': 'Travel Costs Service Pricing Calculator: Factor in Every Mile',
    },
    {
        'keyword': 'real world pricing advice for freelancers',
        'category': 'freelancing',
        'title': 'Real World Pricing Advice for Freelancers: What Actually Works',
    },
    {
        'keyword': 'price your product correctly first time',
        'category': 'pricing-guides',
        'title': 'Price Your Product Correctly the First Time: Avoid Costly Mistakes',
    },
]


def generate_blog_content(keyword: str, title: str) -> dict:
    """Generate SEO-optimized blog content using DeepSeek"""
    
    prompt = f"""You are an expert SEO blog writer specializing in pricing strategies and business advice.

Write a comprehensive, SEO-optimized blog post about: "{keyword}"

Title: {title}

Requirements:
1. Write 1500-2000 words
2. Use HTML formatting (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>)
3. Include the focus keyword "{keyword}" naturally 5-8 times
4. Use semantic keywords and related terms
5. Write in a helpful, authoritative tone
6. Include practical examples and actionable advice
7. Add numbered lists and bullet points for readability
8. Include a strong conclusion with CTA
9. Make it genuinely helpful, not just keyword stuffing
10. Use <h2> for main sections, <h3> for subsections

Structure:
- Introduction (hook + problem statement)
- Main content (3-5 major sections with H2 headings)
- Practical examples or case studies
- Common mistakes to avoid
- Tools/resources section
- Conclusion with call-to-action

Write engaging, valuable content that answers the user's question completely.

Return ONLY the HTML content (no markdown, no code blocks, just HTML tags)."""

    try:
        response = requests.post(
            DEEPSEEK_API_URL,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
            },
            json={
                'model': 'deepseek-chat',
                'messages': [
                    {'role': 'system', 'content': 'You are an expert SEO blog writer.'},
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.7,
                'max_tokens': 4000
            },
            timeout=60
        )
        
        if response.status_code == 200:
            content = response.json()['choices'][0]['message']['content']
            
            # Generate excerpt (first 200 characters)
            excerpt = content.replace('<h2>', '').replace('</h2>', '').replace('<p>', '').replace('</p>', '')[:200] + '...'
            
            return {
                'content': content,
                'excerpt': excerpt,
                'reading_time': estimate_reading_time(content)
            }
        else:
            print(f"Error generating content: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Exception generating content: {e}")
        return None


def estimate_reading_time(html_content: str) -> int:
    """Estimate reading time based on word count"""
    # Remove HTML tags for word count
    import re
    text = re.sub('<[^<]+?>', '', html_content)
    word_count = len(text.split())
    # Average reading speed: 200 words per minute
    return max(1, round(word_count / 200))


def create_slug(title: str) -> str:
    """Create URL-friendly slug from title"""
    import re
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug


def get_category_id(category_slug: str):
    """Get category ID from slug"""
    result = supabase.table('blog_categories').select('id').eq('slug', category_slug).single().execute()
    return result.data['id'] if result.data else None


def generate_all_blog_posts():
    """Generate and insert all blog posts"""
    
    print(f"🚀 Generating {len(KEYWORDS)} blog posts...")
    
    for i, item in enumerate(KEYWORDS, 1):
        print(f"\n[{i}/{len(KEYWORDS)}] Generating: {item['title']}")
        
        # Generate content using DeepSeek
        result = generate_blog_content(item['keyword'], item['title'])
        
        if not result:
            print(f"❌ Failed to generate content for: {item['keyword']}")
            continue
        
        # Get category ID
        category_id = get_category_id(item['category'])
        
        # Create slug
        slug = create_slug(item['title'])
        
        # Prepare blog post data
        blog_data = {
            'title': item['title'],
            'slug': slug,
            'excerpt': result['excerpt'],
            'content': result['content'],
            'category_id': category_id,
            'focus_keyword': item['keyword'],
            'meta_title': f"{item['title']} | HowMuchShouldIPrice",
            'meta_description': result['excerpt'],
            'meta_keywords': [item['keyword'], 'pricing', 'business strategy'],
            'status': 'published',
            'published_at': (datetime.now() - timedelta(days=len(KEYWORDS)-i)).isoformat(),
            'reading_time_minutes': result['reading_time'],
            'author_name': 'HowMuchShouldIPrice Team'
        }
        
        # Insert into database
        try:
            response = supabase.table('blog_posts').insert(blog_data).execute()
            print(f"✅ Created: {slug}")
        except Exception as e:
            print(f"❌ Error inserting post: {e}")
    
    print(f"\n🎉 Blog generation complete!")


if __name__ == '__main__':
    generate_all_blog_posts()

