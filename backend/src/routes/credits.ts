import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Validation schema
const purchaseSchema = z.object({
  credits: z.number().int().positive(),
  amount: z.number().positive(),
});

// Get user profile with credits
router.get('/profile', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({ profile: data });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Purchase credits
router.post('/purchase', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Validate request body
    const validatedData = purchaseSchema.parse(req.body);

    // Get current credits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Record purchase
    const { error: purchaseError } = await supabaseAdmin
      .from('credit_purchases')
      .insert({
        user_id: userId,
        credits_purchased: validatedData.credits,
        amount_paid: validatedData.amount,
      });

    if (purchaseError) throw purchaseError;

    // Update credits
    const newCredits = (profile?.credits || 0) + validatedData.credits;
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Fetch updated profile
    const { data: updatedProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    res.json({ 
      message: 'Credits purchased successfully',
      profile: updatedProfile 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error purchasing credits:', error);
    res.status(500).json({ error: 'Failed to purchase credits' });
  }
});

// Get purchase history
router.get('/purchases', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabaseAdmin
      .from('credit_purchases')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });

    if (error) throw error;

    res.json({ purchases: data });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchase history' });
  }
});

export default router;

