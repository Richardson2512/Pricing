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
  title = 'How Much Should I Price for My Project? | AI-Powered Pricing Tool',
  description = 'Wondering how much should I charge for my project? Get instant AI-powered pricing recommendations for products, services, and freelance work. Free pricing calculator for entrepreneurs, freelancers, and businesses.',
  keywords = 'how much should i charge for my project, how much should i price for my project, pricing calculator, freelance pricing, product pricing, service pricing, AI pricing tool, pricing strategy, price my work, pricing recommendations',
  ogImage = 'https://howmuchshouldiprice.com/og-image.jpg',
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
          ],
        })}
      </script>
    </Helmet>
  );
}

