import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser, AuthRequest } from '../middleware/auth.js';
import { generatePricingRecommendation } from '../services/deepseek.js';
import { parseDocument, detectScrapingSources } from '../services/documentParser.js';
import { scrapeMarketData, cleanMarketData, enrichMarketData } from '../services/marketScraper.js';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

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

// Document-based consultation (Upload & Parse)
router.post('/document', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { filePaths } = req.body;

    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      return res.status(400).json({ error: 'No file paths provided' });
    }

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

    console.log('Step 1: Downloading and extracting text from documents...');
    
    // Extract text from all uploaded documents
    const documentTexts: string[] = [];
    
    for (const filePath of filePaths) {
      try {
        // Download file from Supabase storage
        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
          .from('documents')
          .download(filePath);

        if (downloadError) {
          console.error(`Error downloading file ${filePath}:`, downloadError);
          continue;
        }

        // Convert Blob to Buffer
        const buffer = Buffer.from(await fileData.arrayBuffer());
        
        // Extract text based on file type
        let text = '';
        const fileExt = filePath.split('.').pop()?.toLowerCase();

        if (fileExt === 'pdf') {
          const pdfData = await pdfParse(buffer);
          text = pdfData.text;
        } else if (fileExt === 'docx' || fileExt === 'doc') {
          const result = await mammoth.extractRawText({ buffer });
          text = result.value;
        } else if (fileExt === 'txt' || fileExt === 'csv') {
          text = buffer.toString('utf-8');
        }

        if (text.trim()) {
          documentTexts.push(text);
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
      }
    }

    if (documentTexts.length === 0) {
      return res.status(400).json({ error: 'Could not extract text from any uploaded documents' });
    }

    // Combine all document texts
    const combinedText = documentTexts.join('\n\n---\n\n');

    console.log('Step 2: Parsing documents with DeepSeek V3...');
    
    // Parse combined document text
    const parsedDoc = await parseDocument(combinedText);

    if (!parsedDoc.offering_type || !parsedDoc.domain) {
      return res.status(400).json({ 
        error: 'Could not determine offering type and domain from documents. Please provide more detailed documents or use manual questionnaire.' 
      });
    }

    console.log('Step 3: Detecting category and scraping sources...');
    
    // Detect which platforms to scrape from
    const scrapingSources = detectScrapingSources(parsedDoc);
    console.log('Scraping sources:', scrapingSources);

    // Step 4: Scrape market data
    console.log('Step 4: Scraping market data from detected sources...');
    const rawMarketData = await scrapeMarketData({
      businessType: parsedDoc.domain,
      offeringType: parsedDoc.offering_type,
      region: parsedDoc.region || 'Global',
      niche: parsedDoc.category,
      sources: scrapingSources,
    });

    // Step 5: Clean and enrich market data
    console.log('Step 5: Cleaning and enriching market data...');
    const cleanedData = cleanMarketData(rawMarketData);
    const enrichedData = enrichMarketData(cleanedData);

    // Step 6: Generate AI-powered pricing recommendation
    console.log('Step 6: Generating AI pricing analysis with DeepSeek V3...');
    const recommendation = await generatePricingRecommendation({
      businessType: parsedDoc.domain,
      offeringType: parsedDoc.offering_type,
      experienceLevel: parsedDoc.complexity === 'high' ? 'expert' : parsedDoc.complexity === 'low' ? 'beginner' : 'intermediate',
      region: parsedDoc.region || 'Global',
      niche: parsedDoc.category,
      pricingGoal: 'market_rate',
      productDescription: `${parsedDoc.deliverables?.join(', ') || 'N/A'}\n\nMaterials: ${parsedDoc.materials?.join(', ') || 'N/A'}\n\nTools: ${parsedDoc.tools?.join(', ') || 'N/A'}`,
      costToDeliver: `Quantity: ${parsedDoc.quantity || 'N/A'}\nTimeline: ${parsedDoc.timeline || 'N/A'}\nComplexity: ${parsedDoc.complexity || 'N/A'}`,
      competitorPricing: parsedDoc.hints_of_budget || 'No budget hints found in documents',
      valueProposition: `Keywords: ${parsedDoc.keywords?.join(', ') || 'N/A'}\nDependencies: ${parsedDoc.dependencies?.join(', ') || 'N/A'}`,
      parsedDocuments: parsedDoc,
      marketData: enrichedData,
    });

    // Step 7: Store consultation in database
    console.log('Step 7: Storing consultation...');
    const { data: consultation, error: consultationError } = await supabaseAdmin
      .from('consultations')
      .insert({
        user_id: userId,
        business_type: `${parsedDoc.domain}_${parsedDoc.offering_type}`,
        target_market: `${parsedDoc.region || 'Global'}${parsedDoc.category ? ` - ${parsedDoc.category}` : ''}`,
        product_description: parsedDoc.deliverables?.join(', ') || 'Extracted from documents',
        cost_to_deliver: `${parsedDoc.quantity || 'N/A'} | ${parsedDoc.timeline || 'N/A'}`,
        competitor_pricing: parsedDoc.hints_of_budget || 'No budget hints found',
        value_proposition: parsedDoc.keywords?.join(', ') || 'N/A',
        pricing_recommendation: recommendation,
      })
      .select()
      .single();

    if (consultationError) throw consultationError;

    // Store parsed document data
    for (const filePath of filePaths) {
      await supabaseAdmin.from('uploaded_documents').insert({
        user_id: userId,
        file_name: filePath.split('/').pop(),
        file_path: filePath,
        parsed_deliverables: parsedDoc.deliverables,
        parsed_timeline: parsedDoc.timeline,
        parsed_tools: parsedDoc.tools,
        parsed_complexity: parsedDoc.complexity,
        parsed_dependencies: parsedDoc.dependencies,
        parsing_status: 'completed',
        parsed_at: new Date().toISOString(),
      });
    }

    // Deduct credit
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', userId);

    if (updateError) throw updateError;

    console.log('✅ Document-based consultation completed successfully!');
    res.status(201).json({ consultation, parsedData: parsedDoc });
  } catch (error) {
    console.error('Error creating document-based consultation:', error);
    res.status(500).json({ error: 'Failed to process documents and create consultation' });
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

