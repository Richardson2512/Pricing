/*
  # Pricing Platform Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `credits` (integer, default 3 for free tier)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `consultations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `business_type` (text)
      - `target_market` (text)
      - `product_description` (text)
      - `cost_to_deliver` (text)
      - `competitor_pricing` (text)
      - `value_proposition` (text)
      - `pricing_recommendation` (text)
      - `created_at` (timestamptz)
    
    - `credit_purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `credits_purchased` (integer)
      - `amount_paid` (numeric)
      - `purchase_date` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  credits integer DEFAULT 3 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  business_type text NOT NULL,
  target_market text NOT NULL,
  product_description text NOT NULL,
  cost_to_deliver text NOT NULL,
  competitor_pricing text NOT NULL,
  value_proposition text NOT NULL,
  pricing_recommendation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultations"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS credit_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  credits_purchased integer NOT NULL,
  amount_paid numeric(10,2) NOT NULL,
  purchase_date timestamptz DEFAULT now()
);

ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON credit_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON credit_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);