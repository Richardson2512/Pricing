import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Validate API key but don't crash - log warning instead
if (!DEEPSEEK_API_KEY) {
  console.warn('⚠️ DEEPSEEK_API_KEY not configured - pricing recommendations will fail');
  console.warn('   Set DEEPSEEK_API_KEY environment variable to enable AI pricing');
}

// Helper function to calculate market statistics
function calculateMarketStats(marketData: Array<{ price: number }>) {
  const prices = marketData.map(d => d.price).sort((a, b) => a - b);
  const sum = prices.reduce((acc, price) => acc + price, 0);
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: Math.round(sum / prices.length),
    median: prices[Math.floor(prices.length / 2)],
    top10: prices[Math.floor(prices.length * 0.9)],
  };
}

export interface PricingInput {
  businessType: 'digital' | 'physical';
  offeringType: 'product' | 'service';
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  region: string;
  targetMarket?: string;
  niche?: string;
  pricingGoal: 'cost_plus' | 'market_rate' | 'premium';
  productDescription: string;
  costToDeliver: string;
  competitorPricing: string;
  valueProposition: string;
  parsedDocuments?: {
    deliverables?: string[];
    timeline?: string;
    tools?: string[];
    complexity?: string;
    dependencies?: string[];
  };
  marketData?: Array<{
    source: string;
    title: string;
    price: number;
    currency: string;
    rating?: number;
    reviews?: number;
    delivery?: number;
  }>;
}

export async function generatePricingRecommendation(
  input: PricingInput
): Promise<string> {
  // Validate API key at function call time
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key is not configured. Please set DEEPSEEK_API_KEY environment variable.');
  }
  
  try {
    // Build comprehensive prompt with all available data
    let prompt = `You are an expert pricing consultant analyzing a ${input.businessType} ${input.offeringType}.

BUSINESS CONTEXT:
- Type: ${input.businessType} ${input.offeringType}
- Experience Level: ${input.experienceLevel}
- Region/Market: ${input.region}
${input.niche ? `- Niche/Industry: ${input.niche}` : ''}
- Pricing Goal: ${input.pricingGoal.replace('_', ' ')}

OFFERING DETAILS:
${input.productDescription}

COST STRUCTURE:
${input.costToDeliver}

COMPETITIVE LANDSCAPE:
${input.competitorPricing}

UNIQUE VALUE PROPOSITION:
${input.valueProposition}`;

    // Add parsed document data if available
    if (input.parsedDocuments) {
      prompt += `\n\nPARSED FROM DOCUMENTS:`;
      if (input.parsedDocuments.deliverables) {
        prompt += `\n- Deliverables: ${input.parsedDocuments.deliverables.join(', ')}`;
      }
      if (input.parsedDocuments.timeline) {
        prompt += `\n- Timeline: ${input.parsedDocuments.timeline}`;
      }
      if (input.parsedDocuments.tools) {
        prompt += `\n- Tools Required: ${input.parsedDocuments.tools.join(', ')}`;
      }
      if (input.parsedDocuments.complexity) {
        prompt += `\n- Complexity: ${input.parsedDocuments.complexity}`;
      }
    }

    // Add market data if available
    if (input.marketData && input.marketData.length > 0) {
      prompt += `\n\nMARKET DATA (${input.marketData.length} comparable listings):`;
      const stats = calculateMarketStats(input.marketData);
      prompt += `\n- Price Range: ${stats.min} - ${stats.max} ${input.marketData[0].currency}`;
      prompt += `\n- Median Price: ${stats.median} ${input.marketData[0].currency}`;
      prompt += `\n- Average Price: ${stats.average} ${input.marketData[0].currency}`;
      prompt += `\n- Top 10% Price: ${stats.top10} ${input.marketData[0].currency}`;
    }

    prompt += `\n\n=== CRITICAL INSTRUCTIONS ===
You MUST provide SPECIFIC PRICING NUMBERS with EXACT dollar amounts. NO generic advice.

Analyze the business type and provide appropriate pricing structure:

1. IDENTIFY THE BUSINESS MODEL:
   - ${input.businessType} ${input.offeringType}
   - Category: ${input.niche || 'General'}
   - Sales model: ${input.productDescription.includes('subscription') ? 'Subscription' : input.productDescription.includes('one-time') ? 'One-time' : 'To be determined'}

2. RECOMMENDED PRICING STRUCTURE:

   ${input.businessType === 'digital' && input.offeringType === 'product' ? `
   FOR DIGITAL PRODUCTS (Software, Apps, SaaS, Courses, Templates, etc.):
   
   IF SUBSCRIPTION/SaaS MODEL:
   Provide TIERED PRICING with EXACT amounts:
   
   FREE TIER:
   - Price: $0
   - Features: [List 3-5 basic features]
   - Limits: [Specific limits like "10 items/month", "1 user"]
   - Purpose: Lead generation, freemium conversion
   
   STARTER TIER:
   - Price: $X/month (be specific!)
   - Features: [List 5-7 features]
   - Limits: [Specific limits]
   - Target: Individual users, freelancers, hobbyists
   - Why this price: [Calculate: costs + margin + market positioning]
   
   PROFESSIONAL TIER:
   - Price: $Y/month (be specific!)
   - Features: [List 8-10 features]
   - Limits: [Higher limits]
   - Target: Small businesses, growing teams
   - Why this price: [2-3x value of Starter, competitor comparison]
   
   BUSINESS/ENTERPRISE TIER:
   - Price: $Z/month (be specific!)
   - Features: [List 10+ features, unlimited access]
   - Limits: Unlimited or very high
   - Target: Large companies, enterprises
   - Why this price: [Premium positioning, full value, enterprise support]
   
   IF ONE-TIME PURCHASE (Ebooks, Templates, Courses, Apps):
   - Basic Version: $X (specific number)
   - Standard Version: $Y (specific number)
   - Premium/Pro Version: $Z (specific number)
   Explain what each version includes and why that specific price.
   ` : ''}
   
   ${input.businessType === 'physical' && input.offeringType === 'product' ? `
   FOR PHYSICAL PRODUCTS (Crafts, Electronics, Food, Apparel, etc.):
   
   Calculate UNIT PRICING:
   - Material Cost per unit: $X
   - Labor Cost per unit: $Y
   - Overhead per unit: $Z
   - Total Cost: $A
   - Recommended Retail Price: $B (specific number!)
   - Wholesale Price (if applicable): $C
   - Bulk Pricing: $D per unit for 10+, $E per unit for 50+, $F per unit for 100+
   
   Explain:
   - Why this specific retail price
   - Profit margin percentage
   - How it compares to similar products
   - Shipping cost considerations
   ` : ''}
   
   ${input.businessType === 'digital' && input.offeringType === 'service' ? `
   FOR DIGITAL SERVICES (Design, Development, Writing, Consulting, etc.):
   
   Provide SPECIFIC RATES:
   
   HOURLY RATE:
   - Beginner: $X/hour
   - Intermediate: $Y/hour
   - Expert: $Z/hour
   - Your recommended rate: $W/hour (based on ${input.experienceLevel} level)
   
   PROJECT-BASED PRICING:
   - Small project (1-2 weeks): $A
   - Medium project (3-4 weeks): $B
   - Large project (1-3 months): $C
   - Your typical project: $D (specific number based on description)
   
   RETAINER PRICING:
   - Basic retainer (20 hours/month): $E/month
   - Standard retainer (40 hours/month): $F/month
   - Premium retainer (80 hours/month): $G/month
   
   Explain why these specific numbers based on:
   - Your experience level
   - Market rates in ${input.region}
   - Competitor pricing
   - Value delivered
   ` : ''}
   
   ${input.businessType === 'physical' && input.offeringType === 'service' ? `
   FOR PHYSICAL SERVICES (Construction, Repair, Photography, Events, etc.):
   
   Provide SPECIFIC RATES:
   
   HOURLY RATE:
   - Standard rate: $X/hour
   - After-hours rate: $Y/hour
   - Emergency rate: $Z/hour
   
   PROJECT-BASED:
   - Small job: $A
   - Medium job: $B
   - Large job: $C
   
   ADDITIONAL COSTS:
   - Travel/Transportation: $D per trip or $E per mile
   - Materials markup: F% on top of cost
   - Equipment rental: $G per day
   
   Calculate total for typical job:
   - Labor: $X
   - Materials: $Y
   - Travel: $Z
   - Total: $W (specific number!)
   ` : ''}

3. COST BREAKDOWN WITH ACTUAL NUMBERS
   Based on: ${input.costToDeliver}
   
   Calculate and show:
   - Monthly operational costs: $X (be specific!)
   - Per-customer/per-unit cost: $Y
   - Recommended profit margin: Z% (30-50% typical)
   - Break-even point: N customers/units per month
   - Annual revenue target: $W with M customers
   
4. COMPETITIVE ANALYSIS WITH SPECIFIC PRICES
   Based on: ${input.competitorPricing}
   
   List competitors with their EXACT prices:
   - Competitor 1: $X/month for [features]
   - Competitor 2: $Y/month for [features]  
   - Competitor 3: $Z/month for [features]
   
   YOUR POSITIONING:
   - Recommended price: $W (specific!)
   - Position: X% lower/higher than average
   - Reasoning: [why this specific price beats competitors]
   
5. FINAL PRICING RECOMMENDATION

   Based on ALL the above analysis, here's what you should charge:
   
   ${input.businessType === 'digital' && input.offeringType === 'product' ? `
   IF SUBSCRIPTION MODEL:
   - Free: $0 (features: ...)
   - Starter: $X/month (features: ...)
   - Pro: $Y/month (features: ...)
   - Business: $Z/month (features: ...)
   
   IF ONE-TIME:
   - Basic: $X
   - Pro: $Y
   - Enterprise: $Z
   ` : ''}
   
   ${input.businessType === 'physical' && input.offeringType === 'product' ? `
   - Retail Price: $X per unit
   - Wholesale: $Y per unit (for 10+)
   - Bulk: $Z per unit (for 100+)
   - Profit margin: W%
   ` : ''}
   
   ${input.offeringType === 'service' ? `
   - Hourly Rate: $X/hour
   - Day Rate: $Y/day
   - Project Rate: $Z for typical project
   - Retainer: $W/month
   ` : ''}

6. FEATURE DISTRIBUTION (for tiered products)
   ${input.businessType === 'digital' && input.offeringType === 'product' ? `
   Based on the features provided, organize them:
   
   FREE TIER gets:
   - [List specific features]
   
   STARTER ($X) gets:
   - Everything in Free
   - [List additional features]
   
   PRO ($Y) gets:
   - Everything in Starter
   - [List additional features]
   
   BUSINESS ($Z) gets:
   - Everything in Pro
   - [List additional features]
   ` : ''}

7. IMPLEMENTATION PLAN
   - Launch price: $X for [specific tier/product]
   - Introductory offer: $Y for first Z customers (if applicable)
   - Price testing strategy: Start at $A, test for B weeks
   - Expected conversion rate: C%
   - Monthly revenue projection: $D with E customers

=== CRITICAL RULES ===
1. EVERY price must be a SPECIFIC DOLLAR AMOUNT (e.g., $49, not "$40-60")
2. Provide EXACT numbers for ALL tiers/options
3. Base prices on ${input.region} market context
4. Use market data provided to justify prices
5. Calculate break-even and profit margins
6. Compare to specific competitors with their exact prices
7. NO generic advice like "test and iterate" - give EXACT starting prices
8. For SaaS: MUST provide Free, Starter, Pro, Business tiers with specific prices
9. For services: MUST provide hourly, project, and retainer rates
10. For physical products: MUST provide unit, wholesale, and bulk prices

Your response must be actionable and specific enough that the user can implement pricing IMMEDIATELY.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for AI

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert pricing consultant who provides clear, actionable pricing recommendations for businesses. Focus on practical advice that can be implemented immediately.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from DeepSeek API');
    }

    return data.choices[0].message.content;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('DeepSeek API timeout after 2 minutes');
      throw new Error('AI pricing analysis timeout. Please try again.');
    }
    console.error('Error calling DeepSeek API:', error);
    
    // Fallback to basic recommendation if API fails
    return `Based on your ${input.businessType} business targeting ${input.targetMarket}, here's our pricing recommendation:

PRICING STRATEGY:
Given your cost structure (${input.costToDeliver}) and competitive landscape (${input.competitorPricing}), we recommend a value-based pricing approach.

RECOMMENDED PRICE RANGE:
Consider positioning your offering in the premium segment of your market, reflecting the unique value you provide: ${input.valueProposition}

KEY CONSIDERATIONS:
1. Cost Coverage: Ensure your pricing covers all costs with a healthy margin
2. Market Positioning: Align with how you want to be perceived in ${input.targetMarket}
3. Value Delivery: Price should reflect the value you deliver, not just your costs
4. Competitive Landscape: Stay aware of ${input.competitorPricing} but don't race to the bottom

PRICING MODELS TO CONSIDER:
- Tiered pricing: Offer multiple levels to capture different customer segments
- Value-based: Price according to the value delivered to customers
- Freemium: Offer a free tier to acquire users, premium for advanced features
- Usage-based: Charge based on consumption or usage levels

NEXT STEPS:
1. Test your pricing with a small segment of customers
2. Monitor customer feedback and conversion rates
3. Be prepared to iterate based on market response
4. Consider offering early-bird discounts to gain initial traction

Remember: Pricing is not permanent. Start with a hypothesis and refine based on real market feedback.`;
  }
}

