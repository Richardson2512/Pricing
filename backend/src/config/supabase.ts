import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Admin client with service role key for backend operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Types
export type Profile = {
  id: string;
  email: string;
  credits: number;
  created_at: string;
  updated_at: string;
};

export type Consultation = {
  id: string;
  user_id: string;
  business_type: string;
  target_market: string;
  product_description: string;
  cost_to_deliver: string;
  competitor_pricing: string;
  value_proposition: string;
  pricing_recommendation: string;
  created_at: string;
};

export type CreditPurchase = {
  id: string;
  user_id: string;
  credits_purchased: number;
  amount_paid: number;
  purchase_date: string;
};

