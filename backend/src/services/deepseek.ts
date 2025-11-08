import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

if (!DEEPSEEK_API_KEY) {
  throw new Error('DEEPSEEK_API_KEY is required');
}

export interface PricingInput {
  businessType: string;
  targetMarket: string;
  productDescription: string;
  costToDeliver: string;
  competitorPricing: string;
  valueProposition: string;
}

export async function generatePricingRecommendation(
  input: PricingInput
): Promise<string> {
  try {
    const prompt = `You are an expert pricing consultant. Based on the following information, provide a detailed, actionable pricing recommendation:

Business Type: ${input.businessType}
Target Market: ${input.targetMarket}
Product/Service Description: ${input.productDescription}
Cost to Deliver: ${input.costToDeliver}
Competitor Pricing: ${input.competitorPricing}
Unique Value Proposition: ${input.valueProposition}

Please provide:
1. A recommended pricing strategy (value-based, cost-plus, competitive, or penetration)
2. A specific price range or pricing model
3. Key considerations for this pricing decision
4. Potential pricing models to consider (tiered, freemium, usage-based, etc.)
5. Next steps for implementation

Format your response in a clear, structured way that's easy to read and actionable.`;

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

