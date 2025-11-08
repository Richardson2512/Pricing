import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
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
