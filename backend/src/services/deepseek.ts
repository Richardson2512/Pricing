import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

if (!DEEPSEEK_API_KEY) {
  throw new Error('DEEPSEEK_API_KEY is required');
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

    prompt += `\n\nPROVIDE A COMPREHENSIVE PRICING ANALYSIS INCLUDING:

1. RECOMMENDED PRICE RANGE
   - Low (entry/competitive): $X
   - Average (market-aligned): $Y
   - High (premium): $Z
   
2. COST BREAKDOWN & JUSTIFICATION
   - Operational costs
   - Time/labor costs
   - Tool/material costs
   - Profit margin recommendation
   
3. MARKET POSITIONING
   - Where you fit in the competitive landscape
   - Pricing strategy recommendation (cost-plus, market-rate, or premium)
   - Regional adjustments for ${input.region}
   
4. EXPERIENCE MULTIPLIER
   - How ${input.experienceLevel} level affects pricing
   - Recommended adjustments based on expertise
   
5. ACTIONABLE NEXT STEPS
   - Specific pricing to start with
   - A/B testing recommendations
   - When to adjust pricing

Format your response clearly with sections and bullet points. Be specific with numbers and reasoning.`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from DeepSeek API');
    }

    return data.choices[0].message.content;
  } catch (error) {
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

