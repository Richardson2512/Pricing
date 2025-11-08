import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Validation schema
const consultationSchema = z.object({
  businessType: z.string().min(1),
  targetMarket: z.string().min(1),
  productDescription: z.string().min(1),
  costToDeliver: z.string().min(1),
  competitorPricing: z.string().min(1),
  valueProposition: z.string().min(1),
});

// Generate pricing recommendation
const generatePricingRecommendation = (data: {
  businessType: string;
  targetMarket: string;
  productDescription: string;
  costToDeliver: string;
  competitorPricing: string;
  valueProposition: string;
}) => {
  return `Based on your ${data.businessType} business targeting ${data.targetMarket}, here's our pricing recommendation:

PRICING STRATEGY:
Given your cost structure (${data.costToDeliver}) and competitive landscape (${data.competitorPricing}), we recommend a value-based pricing approach.

RECOMMENDED PRICE RANGE:
Consider positioning your offering in the premium segment of your market, reflecting the unique value you provide: ${data.valueProposition}

KEY CONSIDERATIONS:
1. Cost Coverage: Ensure your pricing covers all costs with a healthy margin
2. Market Positioning: Align with how you want to be perceived in ${data.targetMarket}
3. Value Delivery: Price should reflect the value you deliver, not just your costs
4. Competitive Landscape: Stay aware of ${data.competitorPricing} but don't race to the bottom

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
};

// Get all consultations for authenticated user
router.get('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabaseAdmin
      .from('consultations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ consultations: data });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// Create new consultation
router.post('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Validate request body
    const validatedData = consultationSchema.parse(req.body);

    // Check user credits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    if (!profile || profile.credits < 1) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    // Generate recommendation
    const recommendation = generatePricingRecommendation(validatedData);

    // Create consultation
    const { data: consultation, error: consultationError } = await supabaseAdmin
      .from('consultations')
      .insert({
        user_id: userId,
        business_type: validatedData.businessType,
        target_market: validatedData.targetMarket,
        product_description: validatedData.productDescription,
        cost_to_deliver: validatedData.costToDeliver,
        competitor_pricing: validatedData.competitorPricing,
        value_proposition: validatedData.valueProposition,
        pricing_recommendation: recommendation,
      })
      .select()
      .single();

    if (consultationError) throw consultationError;

    // Deduct credit
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.status(201).json({ consultation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error creating consultation:', error);
    res.status(500).json({ error: 'Failed to create consultation' });
  }
});

// Get single consultation
router.get('/:id', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const consultationId = req.params.id;

    const { data, error } = await supabaseAdmin
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json({ consultation: data });
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ error: 'Failed to fetch consultation' });
  }
});

export default router;

