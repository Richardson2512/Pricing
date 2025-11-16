import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export function SEO({
  title = 'How Much Should I Price for a Project? | AI-Powered Pricing Tool',
  description = 'Wondering how much should I charge for a project? Get instant AI-powered pricing recommendations for products, services, and freelance work. Free pricing calculator for entrepreneurs, freelancers, and businesses.',
  keywords = 'Product pricing tool, Service pricing calculator, Price comparison tool, How to price my product, How to price my service, Best pricing strategy, Product pricing software, Service pricing software, Online pricing calculator, Competitive pricing analysis, Pricing optimization tool, Set price for product, Set price for service, Pricing tool for small business, Pricing tool for freelancers, Product pricing guide, Service pricing guide, Pricing calculator for startups, Pricing calculator for entrepreneurs, Pricing tool for e-commerce',
  ogImage = 'https://howmuchshouldiprice.com/logo.png',
  ogType = 'website',
  canonicalUrl,
  noindex = false,
}: SEOProps) {
  const siteUrl = 'https://howmuchshouldiprice.com';
  const fullCanonicalUrl = canonicalUrl || siteUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="HowMuchShouldIPrice" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Additional SEO Tags */}
      <meta name="author" content="HowMuchShouldIPrice" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      
      {/* Mobile */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="HowMuchShouldIPrice" />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'HowMuchShouldIPrice',
          url: siteUrl,
          description: description,
          applicationCategory: 'BusinessApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1250',
          },
        })}
      </script>
      
      {/* FAQ Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How much should I charge for my project?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The price for your project depends on factors like your experience, market rates, project complexity, and value delivered. Our AI-powered tool analyzes these factors and provides personalized pricing recommendations based on real market data.',
              },
            },
            {
              '@type': 'Question',
              name: 'How much should I price for my project?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Pricing your project requires understanding your costs, target market, competitors, and value proposition. Our platform uses AI to analyze market trends and provide specific pricing recommendations for products, services, and freelance work.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is the pricing tool free?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! New users get 3 free pricing checks with no credit card required. You can upgrade to get more pricing recommendations as needed.',
              },
            },
            // AEO Questions
            {
              '@type': 'Question',
              name: 'What is the best way to price a product?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Combine cost-plus, value-based, and competitive pricing. Validate using market data, customer willingness to pay, and margin targets. Use our product pricing tool to simulate scenarios.',
              },
            },
            {
              '@type': 'Question',
              name: 'How do I price my service competitively?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Benchmark competitor rates, factor in your expertise and delivery time, and set a target margin. The service pricing calculator helps compare against market rates and adjust for scope and value.',
              },
            },
            {
              '@type': 'Question',
              name: 'What factors should I consider when pricing a product?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Consider unit costs, market demand, competitor pricing, positioning, seasonality, and desired margin. Our pricing optimization tool weighs these inputs to recommend a price.',
              },
            },
            {
              '@type': 'Question',
              name: 'How can I compare my product price with competitors?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Run a competitive pricing analysis: gather competitor prices, normalize for features and quality, and compare value. Our price comparison tool automates this process.',
              },
            },
            {
              '@type': 'Question',
              name: 'What is the average price for [product/service]?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Averages vary by region, quality, and package. Use our pricing tool to fetch current market ranges and suggested price bands for your specific niche.',
              },
            },
            {
              '@type': 'Question',
              name: 'How do I calculate profit margin for my product?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Profit margin = (Price − Cost) ÷ Price. Our calculator accepts your costs and target margin to generate recommended prices and profit scenarios.',
              },
            },
            {
              '@type': 'Question',
              name: 'What is the recommended pricing strategy for [industry]?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'It depends on buyer behavior and competition. Many industries use tiered, bundle, or value-based pricing. The strategy guide in our app adapts to your industry signals.',
              },
            },
            {
              '@type': 'Question',
              name: 'How do I set a fair price for my service?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Estimate hours, include overhead, benchmark competitors, and align with perceived value. The service pricing guide helps you justify and communicate your price.',
              },
            },
            {
              '@type': 'Question',
              name: 'What tools help with pricing decisions?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use an online pricing calculator, competitive pricing analysis, and pricing optimization software. Our platform combines all three for products and services.',
              },
            },
            {
              '@type': 'Question',
              name: 'How do I optimize my pricing for higher sales?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Test price points, add value tiers, and monitor conversion and churn. Our optimization tool suggests changes based on elasticity and competitor movements.',
              },
            },
            {
              '@type': 'Question',
              name: 'What are the latest pricing trends for [product/service]?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Trends include dynamic pricing, personalized offers, and transparent bundles. The dashboard highlights market shifts for your category.',
              },
            },
            {
              '@type': 'Question',
              name: 'How do I adjust my pricing for different markets?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Localize by purchasing power, taxes, logistics, and competition. Our tool provides regional price bands and recommended currency rounding.',
              },
            },
            {
              '@type': 'Question',
              name: 'What is dynamic pricing and how does it work?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Dynamic pricing updates prices based on demand, inventory, and competition. Our system can recommend dynamic rules for eligible categories.',
              },
            },
            {
              '@type': 'Question',
              name: 'How do I use a pricing calculator?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Enter your costs, target margin, and market info. The calculator outputs a recommended price range and justification you can present to stakeholders.',
              },
            },
            {
              '@type': 'Question',
              name: 'What is the impact of pricing on sales?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Small price changes can meaningfully affect conversion, revenue, and profit. We model trade-offs between price, volume, and margin to guide decisions.',
              },
            },
          ],
        })}
      </script>

      {/* HowTo Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How do I use a pricing calculator?',
          description:
            'Use a pricing calculator to set prices for products and services by inputting costs, market data, and target margins.',
          step: [
            {
              '@type': 'HowToStep',
              name: 'Gather inputs',
              text: 'Collect unit costs, expected hours (for services), desired margin, and competitor prices.',
            },
            {
              '@type': 'HowToStep',
              name: 'Enter details',
              text: 'Enter your costs, target margin, and product/service details into the calculator.',
            },
            {
              '@type': 'HowToStep',
              name: 'Review recommendations',
              text: 'Compare the recommended price range with competitor benchmarks and value positioning.',
            },
            {
              '@type': 'HowToStep',
              name: 'Adjust and publish',
              text: 'Refine based on strategy (tiered, bundle, discounts) and publish your final price.',
            },
          ],
          tool: [
            {
              '@type': 'HowToTool',
              name: 'Online pricing calculator',
            },
          ],
        })}
      </script>
    </Helmet>
  );
}

