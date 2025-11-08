import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser, AuthRequest } from '../middleware/auth.js';
import { generatePricingRecommendation } from '../services/deepseek.js';
import { parseDocument } from '../services/documentParser.js';
import { scrapeMarketData, cleanMarketData, enrichMarketData } from '../services/marketScraper.js';

const router = Router();

// Validation schema
const consultationSchema = z.object({
  businessType: z.enum(['digital', 'physical']),
  offeringType: z.enum(['product', 'service']),
  experienceLevel: z.enum(['beginner', 'intermediate', 'expert']),
  region: z.string().min(1),
  niche: z.string().optional(),
  pricingGoal: z.enum(['cost_plus', 'market_rate', 'premium']),
  productDescription: z.string().min(1),
  costToDeliver: z.string().min(1),
  competitorPricing: z.string().min(1),
  valueProposition: z.string().min(1),
  files: z.array(z.any()).optional(),
});

// Note: generatePricingRecommendation is now imported from deepseek.ts service

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

    // Step 1: Parse documents if provided (for digital services)
    let parsedDocuments;
    if (validatedData.files && validatedData.files.length > 0) {
      console.log('Parsing uploaded documents...');
      // In production, extract text from uploaded files and parse
      parsedDocuments = {
        deliverables: ['Extracted from uploaded documents'],
        complexity: 'medium',
      };
    }

    // Step 2: Scrape market data based on business type
    console.log('Scraping market data...');
    const rawMarketData = await scrapeMarketData({
      businessType: validatedData.businessType,
      offeringType: validatedData.offeringType,
      region: validatedData.region,
      niche: validatedData.niche,
    });

    // Step 3: Clean and enrich market data
    const cleanedData = cleanMarketData(rawMarketData);
    const enrichedData = enrichMarketData(cleanedData);

    // Step 4: Generate AI-powered recommendation with all context
    console.log('Generating AI pricing analysis with DeepSeek V3...');
    const recommendation = await generatePricingRecommendation({
      ...validatedData,
      parsedDocuments,
      marketData: enrichedData,
    });

    // Step 5: Store consultation in database
    const { data: consultation, error: consultationError } = await supabaseAdmin
      .from('consultations')
      .insert({
        user_id: userId,
        business_type: `${validatedData.businessType}_${validatedData.offeringType}`,
        target_market: `${validatedData.region}${validatedData.niche ? ` - ${validatedData.niche}` : ''}`,
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

